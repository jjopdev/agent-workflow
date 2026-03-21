/**
 * In-memory key-value store with user namespaces.
 * Used for session data, user preferences, and cache.
 */

const store = {};

const ADMIN_KEY = process.env.STORE_ADMIN_KEY || "default-admin-key";

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype", "__sessions__"]);

function assertValidUserId(userId) {
  if (FORBIDDEN_KEYS.has(userId)) throw new Error("Invalid key");
}

function assertValidKey(key) {
  if (new Set(["__proto__", "constructor", "prototype"]).has(key)) throw new Error("Invalid key");
}

function assertAdmin(adminKey) {
  if (adminKey !== ADMIN_KEY) throw new Error("Unauthorized");
}

export function set(userId, key, value) {
  assertValidUserId(userId);
  assertValidKey(key);
  if (!store[userId]) store[userId] = {};
  store[userId][key] = value;
}

export function get(userId, key) {
  assertValidUserId(userId);
  assertValidKey(key);
  if (!store[userId]) return undefined;
  return store[userId][key];
}

export function del(userId, key) {
  assertValidUserId(userId);
  assertValidKey(key);
  if (!store[userId]) return false;
  delete store[userId][key];
  return true;
}

export function listKeys(userId) {
  assertValidUserId(userId);
  if (!store[userId]) return [];
  return Object.keys(store[userId]);
}

// Access-controlled dump. Requires valid adminKey.
// If userId is provided, returns only that user's data.
export function dump(adminKey, userId) {
  assertAdmin(adminKey);
  if (userId !== undefined) {
    return JSON.parse(JSON.stringify(store[userId] || {}));
  }
  return JSON.parse(JSON.stringify(store));
}

// Access-controlled flush. Requires valid adminKey.
export function flush(adminKey) {
  assertAdmin(adminKey);
  for (const key of Object.keys(store)) {
    delete store[key];
  }
}

/**
 * Store a session with expiry.
 */
export function setSession(sessionId, data, ttlMs = 3600000) {
  store["__sessions__"] = store["__sessions__"] || {};
  store["__sessions__"][sessionId] = {
    data,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  };
}

export function getSession(sessionId) {
  const sessions = store["__sessions__"];
  if (!sessions || !sessions[sessionId]) return null;
  const session = sessions[sessionId];
  if (Date.now() > session.expiresAt) {
    delete sessions[sessionId];
    return null;
  }
  return session.data;
}

export function deleteSession(sessionId) {
  const sessions = store["__sessions__"];
  if (!sessions) return false;
  delete sessions[sessionId];
  return true;
}

export function cleanupExpiredSessions() {
  const sessions = store["__sessions__"];
  if (!sessions) return 0;
  const now = Date.now();
  let count = 0;
  for (const sessionId of Object.keys(sessions)) {
    if (now > sessions[sessionId].expiresAt) {
      delete sessions[sessionId];
      count++;
    }
  }
  return count;
}
