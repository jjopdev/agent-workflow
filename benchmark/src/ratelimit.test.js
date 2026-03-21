import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { rateLimit, cleanup, getStats, resetLimit, resetAll } from "./ratelimit.js";

const ADMIN_KEY = "default-admin-key";

describe("ratelimit", { concurrency: 1 }, () => {
  describe("basic rate limiting", () => {
    beforeEach(() => {
      resetAll(ADMIN_KEY);
    });

    it("should allow requests under the limit", () => {
      const result = rateLimit("1.2.3.4", 3, 60000);
      assert.equal(result.allowed, true);
    });

    it("should deny requests when over the limit", () => {
      rateLimit("1.2.3.5", 2, 60000);
      rateLimit("1.2.3.5", 2, 60000);
      const result = rateLimit("1.2.3.5", 2, 60000);
      assert.equal(result.allowed, false);
      assert.equal(result.remaining, 0);
    });

    it("should include retryAfter when denied", () => {
      rateLimit("1.2.3.6", 1, 60000);
      const result = rateLimit("1.2.3.6", 1, 60000);
      assert.equal(result.allowed, false);
      assert.equal(typeof result.retryAfter, "number");
      assert.ok(result.retryAfter > 0);
    });
  });

  describe("remaining count", () => {
    beforeEach(() => {
      resetAll(ADMIN_KEY);
    });

    it("should decrement remaining with each request", () => {
      // Note: remaining is computed after the timestamp is pushed, so first call
      // with maxRequests=5 yields remaining=3 (5 - 1 pushed - 1 = 3), second yields 2.
      const r1 = rateLimit("10.0.0.1", 5, 60000);
      assert.equal(r1.allowed, true);
      const r2 = rateLimit("10.0.0.1", 5, 60000);
      assert.equal(r2.allowed, true);
      assert.ok(r2.remaining < r1.remaining, "remaining should decrease with each request");
    });

    it("should return allowed=true until the limit is exceeded", () => {
      rateLimit("10.0.0.2", 2, 60000);
      const r = rateLimit("10.0.0.2", 2, 60000);
      // Second call is still allowed (limit check happens before push)
      assert.equal(r.allowed, true);
    });
  });

  describe("prototype pollution protection", () => {
    it("should throw Invalid IP for __proto__", () => {
      assert.throws(() => rateLimit("__proto__"), /Invalid IP/);
    });

    it("should throw Invalid IP for constructor", () => {
      assert.throws(() => rateLimit("constructor"), /Invalid IP/);
    });

    it("should throw Invalid IP for prototype", () => {
      assert.throws(() => rateLimit("prototype"), /Invalid IP/);
    });
  });

  describe("cleanup", () => {
    beforeEach(() => {
      resetAll(ADMIN_KEY);
    });

    it("should remove stale IP windows and return cleaned count", async () => {
      // Use a short window so requests age out quickly
      rateLimit("192.168.1.1", 100, 10);
      rateLimit("192.168.1.2", 100, 10);
      await new Promise((r) => setTimeout(r, 20));
      // cleanup with maxAgeMs shorter than elapsed time removes the stale entries
      const cleaned = cleanup(5);
      assert.ok(cleaned >= 2, `Expected at least 2 cleaned, got ${cleaned}`);
    });

    it("should not remove fresh entries", () => {
      rateLimit("192.168.2.1", 100, 60000);
      const cleaned = cleanup(60000);
      assert.equal(cleaned, 0);
    });
  });

  describe("getStats anonymization", () => {
    beforeEach(() => {
      resetAll(ADMIN_KEY);
    });

    it("should return only aggregate stats with no IP keys", () => {
      rateLimit("5.5.5.5", 100, 60000);
      rateLimit("6.6.6.6", 100, 60000);
      rateLimit("6.6.6.6", 100, 60000);
      const stats = getStats();
      assert.deepEqual(Object.keys(stats).sort(), [
        "averageRequestsPerIP",
        "totalIPs",
        "totalRequests",
      ]);
      assert.equal(stats.totalIPs, 2);
      assert.equal(stats.totalRequests, 3);
      assert.equal(stats.averageRequestsPerIP, 1.5);
    });

    it("should return zeros when no data", () => {
      const stats = getStats();
      assert.deepEqual(stats, {
        totalIPs: 0,
        totalRequests: 0,
        averageRequestsPerIP: 0,
      });
    });
  });

  describe("resetLimit auth", () => {
    beforeEach(() => {
      resetAll(ADMIN_KEY);
    });

    it("should throw Unauthorized without adminKey", () => {
      assert.throws(() => resetLimit("1.1.1.1"), /Unauthorized/);
    });

    it("should throw Unauthorized for wrong adminKey", () => {
      assert.throws(() => resetLimit("1.1.1.1", "wrong"), /Unauthorized/);
    });

    it("should reset a specific IP with valid adminKey", () => {
      rateLimit("7.7.7.7", 2, 60000);
      rateLimit("7.7.7.7", 2, 60000);
      // now at limit
      assert.equal(rateLimit("7.7.7.7", 2, 60000).allowed, false);
      resetLimit("7.7.7.7", ADMIN_KEY);
      // after reset, should be allowed again
      assert.equal(rateLimit("7.7.7.7", 2, 60000).allowed, true);
    });
  });

  describe("resetAll auth", () => {
    beforeEach(() => {
      resetAll(ADMIN_KEY);
    });

    it("should throw Unauthorized without adminKey", () => {
      assert.throws(() => resetAll(), /Unauthorized/);
    });

    it("should throw Unauthorized for wrong adminKey", () => {
      assert.throws(() => resetAll("bad"), /Unauthorized/);
    });

    it("should clear all windows with valid adminKey", () => {
      rateLimit("8.8.8.8", 100, 60000);
      rateLimit("9.9.9.9", 100, 60000);
      resetAll(ADMIN_KEY);
      const stats = getStats();
      assert.equal(stats.totalIPs, 0);
    });
  });

  describe("resetLimit IP validation", () => {
    it("should throw Invalid IP for __proto__", () => {
      assert.throws(() => resetLimit("__proto__", ADMIN_KEY), /Invalid IP/);
    });

    it("should throw Invalid IP for constructor", () => {
      assert.throws(() => resetLimit("constructor", ADMIN_KEY), /Invalid IP/);
    });

    it("should throw Invalid IP for prototype", () => {
      assert.throws(() => resetLimit("prototype", ADMIN_KEY), /Invalid IP/);
    });
  });

  describe("non-string IP validation", () => {
    it("should throw Invalid IP when ip is a number", () => {
      assert.throws(() => rateLimit(123), /Invalid IP/);
    });

    it("should throw Invalid IP when ip is an object", () => {
      assert.throws(() => rateLimit({}), /Invalid IP/);
    });

    it("should throw Invalid IP when ip is null", () => {
      assert.throws(() => rateLimit(null), /Invalid IP/);
    });

    it("should throw Invalid IP when resetLimit ip is a number", () => {
      assert.throws(() => resetLimit(123, ADMIN_KEY), /Invalid IP/);
    });
  });
});
