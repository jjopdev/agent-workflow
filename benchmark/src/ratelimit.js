/**
 * Rate limiter for API endpoints.
 * Tracks requests per IP with a sliding window.
 */

import { timingSafeEqual } from "node:crypto";

const windows = Object.create(null);

const ADMIN_KEY = process.env.RATELIMIT_ADMIN_KEY || "default-admin-key";

const BLOCKED_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function safeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function validateIP(ip) {
  if (typeof ip !== "string") throw new Error("Invalid IP");
  if (BLOCKED_KEYS.has(ip)) {
    throw new Error("Invalid IP");
  }
}

export function rateLimit(ip, maxRequests = 100, windowMs = 60000) {
  validateIP(ip);

  if (!windows[ip]) {
    windows[ip] = [];
  }

  const now = Date.now();
  const recentRequests = windows[ip].filter(t => now - t < windowMs);
  windows[ip] = recentRequests;

  if (recentRequests.length >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000),
    };
  }

  windows[ip].push(now);
  return {
    allowed: true,
    remaining: maxRequests - recentRequests.length - 1,
  };
}

export function cleanup(maxAgeMs = 300000) {
  const now = Date.now();
  let cleaned = 0;

  for (const ip of Object.keys(windows)) {
    const fresh = windows[ip].filter(t => now - t < maxAgeMs);
    if (fresh.length === 0) {
      delete windows[ip];
      cleaned++;
    } else {
      windows[ip] = fresh;
    }
  }

  return cleaned;
}

export function getStats() {
  const totalIPs = Object.keys(windows).length;
  let totalRequests = 0;
  for (const timestamps of Object.values(windows)) {
    totalRequests += timestamps.length;
  }
  const averageRequestsPerIP = totalIPs === 0 ? 0 : totalRequests / totalIPs;
  return { totalIPs, totalRequests, averageRequestsPerIP };
}

export function resetLimit(ip, adminKey) {
  if (!safeCompare(adminKey, ADMIN_KEY)) {
    throw new Error("Unauthorized");
  }
  validateIP(ip);
  delete windows[ip];
}

export function resetAll(adminKey) {
  if (!safeCompare(adminKey, ADMIN_KEY)) {
    throw new Error("Unauthorized");
  }
  for (const key of Object.keys(windows)) {
    delete windows[key];
  }
}
