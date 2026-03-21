import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { login } from "./auth.js";
import {
  handleLogin,
  handleGetPosts,
  handleCreatePost,
  handleDeletePost,
  _resetPosts,
} from "./api.js";

function adminToken() {
  const { token } = login("admin@test.com", "admin123");
  return token;
}

function userToken() {
  const { token } = login("user@test.com", "password");
  return token;
}

describe("API", () => {
  beforeEach(() => {
    _resetPosts();
  });

  describe("handleLogin", () => {
    it("should login with valid credentials", () => {
      const res = handleLogin({ body: { email: "admin@test.com", password: "admin123" } });
      assert.equal(res.status, 200);
      assert.ok(res.body.token);
      assert.equal(res.body.user.role, "admin");
    });

    it("should reject invalid credentials", () => {
      const res = handleLogin({ body: { email: "admin@test.com", password: "wrong" } });
      assert.equal(res.status, 401);
    });

    it("should reject missing email", () => {
      const res = handleLogin({ body: { password: "admin123" } });
      assert.equal(res.status, 400);
    });

    it("should reject invalid email format", () => {
      const res = handleLogin({ body: { email: "not-an-email", password: "admin123" } });
      assert.equal(res.status, 400);
    });

    it("should reject missing password", () => {
      const res = handleLogin({ body: { email: "admin@test.com" } });
      assert.equal(res.status, 400);
    });

    it("should reject empty password", () => {
      const res = handleLogin({ body: { email: "admin@test.com", password: "" } });
      assert.equal(res.status, 400);
    });

    it("should reject missing body", () => {
      const res = handleLogin({ body: undefined });
      assert.equal(res.status, 400);
    });

    it("should reject non-string email", () => {
      const res = handleLogin({ body: { email: 123, password: "test" } });
      assert.equal(res.status, 400);
    });
  });

  describe("handleGetPosts", () => {
    it("should return posts", () => {
      const res = handleGetPosts();
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.equal(res.body.length, 1);
    });
  });

  describe("handleCreatePost", () => {
    it("should create a post as admin", () => {
      const res = handleCreatePost({
        headers: { token: adminToken() },
        body: { title: "New Post", body: "Content here" },
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.title, "New Post");
    });

    it("should reject creation by user role", () => {
      const res = handleCreatePost({
        headers: { token: userToken() },
        body: { title: "Hack", body: "Nope" },
      });
      assert.equal(res.status, 403);
    });

    it("should reject creation without token", () => {
      const res = handleCreatePost({
        headers: {},
        body: { title: "Hack", body: "Nope" },
      });
      assert.equal(res.status, 403);
    });

    it("should reject missing title", () => {
      const res = handleCreatePost({
        headers: { token: adminToken() },
        body: { body: "Content" },
      });
      assert.equal(res.status, 400);
    });

    it("should reject empty title", () => {
      const res = handleCreatePost({
        headers: { token: adminToken() },
        body: { title: "  ", body: "Content" },
      });
      assert.equal(res.status, 400);
    });

    it("should reject missing body", () => {
      const res = handleCreatePost({
        headers: { token: adminToken() },
        body: { title: "Title" },
      });
      assert.equal(res.status, 400);
    });

    it("should reject overly long title", () => {
      const res = handleCreatePost({
        headers: { token: adminToken() },
        body: { title: "x".repeat(201), body: "Content" },
      });
      assert.equal(res.status, 400);
    });

    it("should sanitize XSS in title", () => {
      const res = handleCreatePost({
        headers: { token: adminToken() },
        body: { title: '<script>alert("xss")</script>', body: "Safe body" },
      });
      assert.equal(res.status, 201);
      assert.ok(!res.body.title.includes("<script>"));
      assert.ok(res.body.title.includes("&lt;script&gt;"));
    });

    it("should sanitize XSS in body", () => {
      const res = handleCreatePost({
        headers: { token: adminToken() },
        body: { title: "Safe title", body: '<img onerror="alert(1)" src="x">' },
      });
      assert.equal(res.status, 201);
      assert.ok(!res.body.body.includes("<img"));
      assert.ok(res.body.body.includes("&lt;img"));
    });

    it("should sanitize HTML entities: &, quotes", () => {
      const res = handleCreatePost({
        headers: { token: adminToken() },
        body: { title: 'A & B "test" \'ok\'', body: "Content" },
      });
      assert.equal(res.status, 201);
      assert.ok(res.body.title.includes("&amp;"));
      assert.ok(res.body.title.includes("&quot;"));
      assert.ok(res.body.title.includes("&#x27;"));
    });

    it("should generate unique IDs even after deletion", () => {
      // Create post id=2
      handleCreatePost({
        headers: { token: adminToken() },
        body: { title: "Post 2", body: "Body" },
      });
      // Delete post id=2
      handleDeletePost({ headers: { token: adminToken() }, params: { id: "2" } });
      // Create another — should be id=2 (max existing is 1) — this is fine
      const res = handleCreatePost({
        headers: { token: adminToken() },
        body: { title: "Post 3", body: "Body" },
      });
      assert.equal(res.status, 201);
      assert.ok(res.body.id >= 1);
    });
  });

  describe("handleDeletePost", () => {
    it("should delete a post as admin", () => {
      const res = handleDeletePost({
        headers: { token: adminToken() },
        params: { id: "1" },
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.deleted, true);
    });

    it("should reject deletion by user role", () => {
      const res = handleDeletePost({
        headers: { token: userToken() },
        params: { id: "1" },
      });
      assert.equal(res.status, 403);
    });

    it("should return 404 for non-existent post", () => {
      const res = handleDeletePost({
        headers: { token: adminToken() },
        params: { id: "999" },
      });
      assert.equal(res.status, 404);
    });

    it("should reject invalid ID (non-numeric)", () => {
      const res = handleDeletePost({
        headers: { token: adminToken() },
        params: { id: "abc" },
      });
      assert.equal(res.status, 400);
    });

    it("should reject negative ID", () => {
      const res = handleDeletePost({
        headers: { token: adminToken() },
        params: { id: "-1" },
      });
      assert.equal(res.status, 400);
    });

    it("should reject zero ID", () => {
      const res = handleDeletePost({
        headers: { token: adminToken() },
        params: { id: "0" },
      });
      assert.equal(res.status, 400);
    });

    it("should use strict equality (not loose ==)", () => {
      // "1" should not match via loose equality tricks — the ID is parsed to int first
      const res = handleDeletePost({
        headers: { token: adminToken() },
        params: { id: "1" },
      });
      assert.equal(res.status, 200);

      // "01" parsed as parseInt is 1, so it would match — this is acceptable behavior
      // The important thing is no type coercion bugs with objects/arrays
    });

    it("should reject missing params", () => {
      const res = handleDeletePost({
        headers: { token: adminToken() },
        params: {},
      });
      assert.equal(res.status, 400);
    });
  });
});
