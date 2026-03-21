import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  set,
  get,
  del,
  listKeys,
  dump,
  flush,
  setSession,
  getSession,
  cleanupExpiredSessions,
} from "./store.js";

const ADMIN_KEY = "default-admin-key";

describe("store", () => {
  describe("basic CRUD", () => {
    beforeEach(() => {
      flush(ADMIN_KEY);
    });

    it("should set and get a value", () => {
      set("user1", "theme", "dark");
      assert.equal(get("user1", "theme"), "dark");
    });

    it("should return undefined for missing key", () => {
      assert.equal(get("user1", "missing"), undefined);
    });

    it("should delete a key and return true", () => {
      set("user1", "theme", "dark");
      const result = del("user1", "theme");
      assert.equal(result, true);
      assert.equal(get("user1", "theme"), undefined);
    });

    it("should return false when deleting from non-existent user", () => {
      const result = del("ghost", "key");
      assert.equal(result, false);
    });

    it("should list keys for a user", () => {
      set("user1", "a", 1);
      set("user1", "b", 2);
      const keys = listKeys("user1");
      assert.deepEqual(keys.sort(), ["a", "b"]);
    });

    it("should return empty array for user with no keys", () => {
      assert.deepEqual(listKeys("nobody"), []);
    });
  });

  describe("prototype pollution protection", () => {
    it("should throw when userId is __proto__", () => {
      assert.throws(() => set("__proto__", "x", "y"), /Invalid key/);
    });

    it("should throw when key is __proto__", () => {
      assert.throws(() => set("user", "__proto__", "y"), /Invalid key/);
    });

    it("should throw when userId is constructor", () => {
      assert.throws(() => set("constructor", "x", "y"), /Invalid key/);
    });

    it("should throw when userId is prototype", () => {
      assert.throws(() => set("prototype", "x", "y"), /Invalid key/);
    });

    it("should throw when key is constructor", () => {
      assert.throws(() => set("user", "constructor", "y"), /Invalid key/);
    });

    it("should throw when key is prototype", () => {
      assert.throws(() => set("user", "prototype", "y"), /Invalid key/);
    });
  });

  describe("__sessions__ protection", () => {
    it("should throw when userId is __sessions__", () => {
      assert.throws(() => set("__sessions__", "x", "y"), /Invalid key/);
    });
  });

  describe("session expiry", () => {
    beforeEach(() => {
      flush(ADMIN_KEY);
    });

    it("should return null for expired session", async () => {
      setSession("sess-expired", { user: "alice" }, 1);
      await new Promise((r) => setTimeout(r, 10));
      assert.equal(getSession("sess-expired"), null);
    });

    it("should return data for valid session within TTL", () => {
      setSession("sess-valid", { user: "bob" }, 60000);
      const data = getSession("sess-valid");
      assert.deepEqual(data, { user: "bob" });
    });
  });

  describe("cleanupExpiredSessions", () => {
    beforeEach(() => {
      flush(ADMIN_KEY);
    });

    it("should remove expired sessions and return count", async () => {
      setSession("expired1", { a: 1 }, 1);
      setSession("expired2", { b: 2 }, 1);
      setSession("live", { c: 3 }, 60000);
      await new Promise((r) => setTimeout(r, 10));
      const cleaned = cleanupExpiredSessions();
      assert.equal(cleaned, 2);
      assert.equal(getSession("live") !== null, true);
    });

    it("should return 0 when no sessions exist", () => {
      assert.equal(cleanupExpiredSessions(), 0);
    });
  });

  describe("dump auth", () => {
    beforeEach(() => {
      flush(ADMIN_KEY);
    });

    it("should throw Unauthorized when called without adminKey", () => {
      assert.throws(() => dump(), /Unauthorized/);
    });

    it("should throw Unauthorized for wrong adminKey", () => {
      assert.throws(() => dump("wrong-key"), /Unauthorized/);
    });

    it("should succeed with correct adminKey", () => {
      set("user1", "x", 1);
      const result = dump(ADMIN_KEY);
      assert.equal(typeof result, "object");
    });
  });

  describe("dump scoping", () => {
    beforeEach(() => {
      flush(ADMIN_KEY);
    });

    it("should return only the specified user's data", () => {
      set("user1", "color", "red");
      set("user2", "color", "blue");
      const result = dump(ADMIN_KEY, "user1");
      assert.deepEqual(result, { color: "red" });
    });

    it("should return empty object for user with no data", () => {
      const result = dump(ADMIN_KEY, "nobody");
      assert.deepEqual(result, {});
    });
  });

  describe("flush auth", () => {
    beforeEach(() => {
      flush(ADMIN_KEY);
    });

    it("should throw Unauthorized when called without adminKey", () => {
      assert.throws(() => flush(), /Unauthorized/);
    });

    it("should throw Unauthorized for wrong adminKey", () => {
      assert.throws(() => flush("bad-key"), /Unauthorized/);
    });

    it("should clear all data with correct adminKey", () => {
      set("user1", "k", "v");
      flush(ADMIN_KEY);
      assert.equal(get("user1", "k"), undefined);
    });
  });

  describe("namespace isolation", () => {
    beforeEach(() => {
      flush(ADMIN_KEY);
    });

    it("should not expose user1 data in user2 keys", () => {
      set("user1", "secret", "hidden");
      set("user2", "visible", "here");
      assert.deepEqual(listKeys("user2"), ["visible"]);
      assert.equal(get("user2", "secret"), undefined);
    });
  });
});
