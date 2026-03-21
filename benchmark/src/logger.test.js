import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  log,
  info,
  warn,
  error,
  debug,
  getLogs,
  clearLogs,
  getLogCount,
  setMinLevel,
} from "./logger.js";

const ADMIN_KEY = "default-admin-key";

describe("logger", () => {
  describe("basic logging", () => {
    beforeEach(() => {
      clearLogs(ADMIN_KEY);
      setMinLevel("debug");
    });

    it("should return entry with timestamp, level, message, and context", () => {
      const entry = log("info", "hello", { userId: 1 });
      assert.equal(entry.level, "info");
      assert.equal(entry.message, "hello");
      assert.deepEqual(entry.context, { userId: 1 });
      assert.equal(typeof entry.timestamp, "string");
      assert.ok(entry.timestamp.length > 0);
    });

    it("should add entry to the log buffer", () => {
      log("warn", "something");
      assert.equal(getLogCount(), 1);
    });
  });

  describe("log injection sanitization", () => {
    beforeEach(() => {
      clearLogs(ADMIN_KEY);
      setMinLevel("debug");
    });

    it("should replace newline characters with a space", () => {
      const entry = log("info", "line1\nline2");
      assert.ok(!entry.message.includes("\n"), "newline should be removed");
      assert.ok(entry.message.includes(" "), "space should replace newline");
    });

    it("should replace null byte control characters", () => {
      const entry = log("info", "bad\x00char");
      assert.ok(!entry.message.includes("\x00"), "null byte should be removed");
    });

    it("should replace other control characters below 0x20", () => {
      const entry = log("info", "ctrl\x01\x02\x1Fchars");
      assert.ok(!entry.message.includes("\x01"));
      assert.ok(!entry.message.includes("\x02"));
      assert.ok(!entry.message.includes("\x1F"));
    });
  });

  describe("context isolation", () => {
    beforeEach(() => {
      clearLogs(ADMIN_KEY);
      setMinLevel("debug");
    });

    it("should not allow context to overwrite top-level timestamp", () => {
      const entry = log("info", "test", { timestamp: "evil" });
      assert.notEqual(entry.timestamp, "evil");
      assert.ok(entry.timestamp.includes("T"), "timestamp should be ISO format");
    });

    it("should not allow context to overwrite top-level level", () => {
      const entry = log("info", "test", { level: "hacked" });
      assert.equal(entry.level, "info");
    });
  });

  describe("sensitive data redaction", () => {
    beforeEach(() => {
      clearLogs(ADMIN_KEY);
      setMinLevel("debug");
    });

    it("should redact password", () => {
      const entry = log("info", "login", { password: "secret123" });
      assert.equal(entry.context.password, "[REDACTED]");
    });

    it("should redact token", () => {
      const entry = log("info", "auth", { token: "abc123" });
      assert.equal(entry.context.token, "[REDACTED]");
    });

    it("should redact secret", () => {
      const entry = log("info", "cfg", { secret: "shh" });
      assert.equal(entry.context.secret, "[REDACTED]");
    });

    it("should redact authorization", () => {
      const entry = log("info", "req", { authorization: "Bearer xyz" });
      assert.equal(entry.context.authorization, "[REDACTED]");
    });

    it("should redact ssn", () => {
      const entry = log("info", "pii", { ssn: "123-45-6789" });
      assert.equal(entry.context.ssn, "[REDACTED]");
    });

    it("should redact creditCard", () => {
      const entry = log("info", "pay", { creditCard: "4111111111111111" });
      assert.equal(entry.context.creditCard, "[REDACTED]");
    });

    it("should redact api_key", () => {
      const entry = log("info", "api", { api_key: "key-xyz" });
      assert.equal(entry.context.api_key, "[REDACTED]");
    });
  });

  describe("nested redaction", () => {
    beforeEach(() => {
      clearLogs(ADMIN_KEY);
      setMinLevel("debug");
    });

    it("should redact password nested inside user object", () => {
      const entry = log("info", "nested", { user: { password: "x", name: "alice" } });
      assert.equal(entry.context.user.password, "[REDACTED]");
      assert.equal(entry.context.user.name, "alice");
    });

    it("should redact token in deeply nested object", () => {
      const entry = log("info", "deep", { a: { b: { token: "t" } } });
      assert.equal(entry.context.a.b.token, "[REDACTED]");
    });
  });

  describe("level filtering", () => {
    beforeEach(() => {
      clearLogs(ADMIN_KEY);
      setMinLevel("debug");
    });

    it("should return null for debug when minLevel is info", () => {
      setMinLevel("info");
      const result = debug("should not log");
      assert.equal(result, null);
    });

    it("should allow info when minLevel is info", () => {
      setMinLevel("info");
      const result = info("should log");
      assert.notEqual(result, null);
      assert.equal(result.level, "info");
    });

    it("should return null for info when minLevel is warn", () => {
      setMinLevel("warn");
      assert.equal(info("nope"), null);
      assert.equal(debug("nope"), null);
    });

    it("should allow warn and error when minLevel is warn", () => {
      setMinLevel("warn");
      assert.notEqual(warn("yes"), null);
      assert.notEqual(error("yes"), null);
    });
  });

  describe("setMinLevel invalid input", () => {
    it("should throw for an invalid level string", () => {
      assert.throws(() => setMinLevel("verbose"), /Invalid level/);
    });

    it("should throw for an empty string", () => {
      assert.throws(() => setMinLevel(""), /Invalid level/);
    });
  });

  describe("pagination", () => {
    beforeEach(() => {
      clearLogs(ADMIN_KEY);
      setMinLevel("debug");
    });

    it("should return default limit of 100 and correct total for 150 logs", () => {
      for (let i = 0; i < 150; i++) {
        log("info", `msg ${i}`);
      }
      const result = getLogs();
      assert.equal(result.total, 150);
      assert.equal(result.entries.length, 100);
      assert.equal(result.limit, 100);
      assert.equal(result.offset, 0);
    });

    it("should return correct slice with offset and limit", () => {
      for (let i = 0; i < 60; i++) {
        log("info", `msg ${i}`);
      }
      const result = getLogs({ offset: 50, limit: 10 });
      assert.equal(result.entries.length, 10);
      assert.equal(result.offset, 50);
      assert.equal(result.total, 60);
      assert.equal(result.entries[0].message, "msg 50");
    });

    it("should cap limit at 1000", () => {
      for (let i = 0; i < 5; i++) {
        log("info", `msg ${i}`);
      }
      const result = getLogs({ limit: 9999 });
      assert.equal(result.limit, 1000);
    });
  });

  describe("clearLogs auth", () => {
    beforeEach(() => {
      clearLogs(ADMIN_KEY);
      setMinLevel("debug");
    });

    it("should throw Unauthorized without adminKey", () => {
      assert.throws(() => clearLogs(), /Unauthorized/);
    });

    it("should throw Unauthorized for wrong adminKey", () => {
      assert.throws(() => clearLogs("bad-key"), /Unauthorized/);
    });

    it("should clear all logs with valid adminKey", () => {
      log("info", "one");
      log("info", "two");
      clearLogs(ADMIN_KEY);
      assert.equal(getLogCount(), 0);
    });
  });

  describe("getLogCount", () => {
    beforeEach(() => {
      clearLogs(ADMIN_KEY);
      setMinLevel("debug");
    });

    it("should return correct count after logging", () => {
      log("info", "a");
      log("warn", "b");
      log("error", "c");
      assert.equal(getLogCount(), 3);
    });

    it("should return 0 after clearLogs", () => {
      log("info", "x");
      clearLogs(ADMIN_KEY);
      assert.equal(getLogCount(), 0);
    });
  });

  describe("getLogs level filter", () => {
    beforeEach(() => {
      clearLogs(ADMIN_KEY);
      setMinLevel("debug");
    });

    it("should return only entries matching the specified level", () => {
      log("info", "info msg");
      log("warn", "warn msg");
      log("error", "error msg");
      const result = getLogs({ level: "warn" });
      assert.equal(result.entries.length, 1);
      assert.equal(result.entries[0].level, "warn");
      assert.equal(result.total, 1);
    });

    it("should return empty entries when no logs match the level filter", () => {
      log("info", "info msg");
      const result = getLogs({ level: "error" });
      assert.equal(result.entries.length, 0);
      assert.equal(result.total, 0);
    });
  });

  describe("circular reference handling", () => {
    beforeEach(() => {
      clearLogs(ADMIN_KEY);
      setMinLevel("debug");
    });

    it("should replace circular reference with [Circular]", () => {
      const obj = {};
      obj.self = obj;
      const entry = log("info", "test", obj);
      assert.equal(entry.context.self, "[Circular]");
    });

    it("should not throw when context contains a deeply nested circular reference", () => {
      const a = {};
      const b = { a };
      a.b = b;
      assert.doesNotThrow(() => log("info", "test", a));
    });
  });
});
