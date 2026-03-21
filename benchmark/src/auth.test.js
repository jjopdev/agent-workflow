import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { login, verifyToken, authorize, createToken } from "./auth.js";

describe("auth", () => {
  describe("login", () => {
    it("should login with valid admin credentials", () => {
      const result = login("admin@test.com", "admin123");
      assert.ok(result);
      assert.equal(result.user.role, "admin");
      assert.equal(result.user.email, "admin@test.com");
      assert.ok(result.token);
    });

    it("should login with valid user credentials", () => {
      const result = login("user@test.com", "password");
      assert.ok(result);
      assert.equal(result.user.role, "user");
    });

    it("should return null for wrong password", () => {
      assert.equal(login("admin@test.com", "wrong"), null);
    });

    it("should return null for unknown email", () => {
      assert.equal(login("nobody@test.com", "admin123"), null);
    });

    it("should return null for non-string inputs", () => {
      assert.equal(login(null, "admin123"), null);
      assert.equal(login("admin@test.com", 123), null);
      assert.equal(login(undefined, undefined), null);
    });

    it("should not expose password in user object", () => {
      const result = login("admin@test.com", "admin123");
      assert.ok(result);
      assert.equal(result.user.password, undefined);
      assert.equal(result.user.passwordHash, undefined);
      assert.equal(result.user.salt, undefined);
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", () => {
      const { token } = login("admin@test.com", "admin123");
      const payload = verifyToken(token);
      assert.equal(payload.id, 1);
      assert.equal(payload.role, "admin");
    });

    it("should reject a forged unsigned token", () => {
      // Simulate the old vulnerability: base64-encode a payload without signing
      const forged = Buffer.from(JSON.stringify({ id: 1, role: "admin" })).toString("base64");
      assert.equal(verifyToken(forged), null);
    });

    it("should reject a forged token with tampered payload", () => {
      const { token } = login("user@test.com", "password");
      const parts = token.split(".");
      // Tamper with the payload to escalate role
      const tampered = Buffer.from(JSON.stringify({ id: 2, role: "admin", iat: Date.now(), exp: Date.now() + 3600000 })).toString("base64url");
      const forgedToken = `${parts[0]}.${tampered}.${parts[2]}`;
      assert.equal(verifyToken(forgedToken), null);
    });

    it("should reject a malformed token (not 3 parts)", () => {
      assert.equal(verifyToken("abc.def"), null);
      assert.equal(verifyToken("singlestring"), null);
      assert.equal(verifyToken("a.b.c.d"), null);
    });

    it("should reject non-string input", () => {
      assert.equal(verifyToken(null), null);
      assert.equal(verifyToken(undefined), null);
      assert.equal(verifyToken(123), null);
      assert.equal(verifyToken({}), null);
    });

    it("should reject an expired token", () => {
      // Create a token that is already expired
      const payload = { id: 1, role: "admin" };
      const header = { alg: "HS256", typ: "JWT" };
      const body = { ...payload, iat: Date.now() - 7200000, exp: Date.now() - 3600000 };

      const secret = process.env.TOKEN_SECRET || "default-secret-change-in-production";
      const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
      const bodyB64 = Buffer.from(JSON.stringify(body)).toString("base64url");
      const signature = createHmac("sha256", secret)
        .update(`${headerB64}.${bodyB64}`)
        .digest("base64url");

      const expiredToken = `${headerB64}.${bodyB64}.${signature}`;
      assert.equal(verifyToken(expiredToken), null);
    });

    it("should reject an empty string", () => {
      assert.equal(verifyToken(""), null);
    });
  });

  describe("authorize", () => {
    it("should authorize admin for admin role", () => {
      const { token } = login("admin@test.com", "admin123");
      assert.equal(authorize(token, "admin"), true);
    });

    it("should authorize admin for user role (hierarchy)", () => {
      const { token } = login("admin@test.com", "admin123");
      assert.equal(authorize(token, "user"), true);
    });

    it("should authorize user for user role", () => {
      const { token } = login("user@test.com", "password");
      assert.equal(authorize(token, "user"), true);
    });

    it("should deny user for admin role", () => {
      const { token } = login("user@test.com", "password");
      assert.equal(authorize(token, "admin"), false);
    });

    it("should deny with invalid token", () => {
      assert.equal(authorize("forged-token", "user"), false);
    });

    it("should deny with unknown role in token", () => {
      // Even if someone somehow got a token with an unknown role, it should fail
      const token = createToken({ id: 99, role: "superadmin" });
      assert.equal(authorize(token, "admin"), false);
    });

    it("should deny when required role is unknown", () => {
      const { token } = login("admin@test.com", "admin123");
      assert.equal(authorize(token, "superadmin"), false);
    });
  });
});
