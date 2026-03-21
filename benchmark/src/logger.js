/**
 * Simple structured logger.
 * Logs to an in-memory buffer for testing.
 */

const logs = [];

const ADMIN_KEY = process.env.LOGGER_ADMIN_KEY || "default-admin-key";

const LEVEL_ORDER = { debug: 0, info: 1, warn: 2, error: 3 };
let minLevel = "debug";

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "ssn",
  "creditcard",
  "credit_card",
  "apikey",
  "api_key",
]);

function redactSensitive(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(redactSensitive);
  }
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = "[REDACTED]";
    } else if (value !== null && typeof value === "object") {
      result[key] = redactSensitive(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function sanitizeMessage(message) {
  // Replace newlines and control characters (ASCII 0-31) except tab (0x09) with a space
  return String(message).replace(/[\x00-\x08\x0A-\x1F\x7F]/g, " ");
}

export function setMinLevel(level) {
  if (!(level in LEVEL_ORDER)) {
    throw new Error(`Invalid level: ${level}`);
  }
  minLevel = level;
}

export function log(level, message, context = {}) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) {
    return null;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message: sanitizeMessage(message),
    context: redactSensitive(context),
  };
  logs.push(entry);
  return entry;
}

export function info(message, context) {
  return log("info", message, context);
}

export function warn(message, context) {
  return log("warn", message, context);
}

export function error(message, context) {
  return log("error", message, context);
}

export function debug(message, context) {
  return log("debug", message, context);
}

export function getLogs(filter = {}) {
  let result = logs;
  if (filter.level) {
    result = result.filter(l => l.level === filter.level);
  }
  if (filter.since) {
    result = result.filter(l => l.timestamp >= filter.since);
  }

  const total = result.length;
  const offset = filter.offset !== undefined ? Math.max(0, filter.offset) : 0;
  const limit = filter.limit !== undefined
    ? Math.min(Math.max(1, filter.limit), 1000)
    : 100;

  const entries = result.slice(offset, offset + limit);
  return { entries, total, limit, offset };
}

export function clearLogs(adminKey) {
  if (adminKey !== ADMIN_KEY) {
    throw new Error("Unauthorized");
  }
  logs.length = 0;
}

export function getLogCount() {
  return logs.length;
}
