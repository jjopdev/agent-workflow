/**
 * Token-based auth module with HMAC-signed tokens, password hashing, and role hierarchy.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

// In production, this would come from an environment variable
const TOKEN_SECRET = process.env.TOKEN_SECRET || "default-secret-change-in-production";
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const ROLE_HIERARCHY = { admin: 2, user: 1 };

function hashPassword(password, salt) {
  return createHmac("sha256", salt).update(password).digest("hex");
}

// Pre-hashed passwords with salts
const USER_SALT = "fixed-salt-for-demo"; // In production, each user gets a unique salt
const USERS = [
  {
    id: 1,
    email: "admin@test.com",
    passwordHash: hashPassword("admin123", USER_SALT),
    salt: USER_SALT,
    role: "admin",
  },
  {
    id: 2,
    email: "user@test.com",
    passwordHash: hashPassword("password", USER_SALT),
    salt: USER_SALT,
    role: "user",
  },
];

export function login(email, password) {
  if (typeof email !== "string" || typeof password !== "string") return null;

  const user = USERS.find((u) => u.email === email);
  if (!user) return null;

  const candidateHash = hashPassword(password, user.salt);
  // Timing-safe comparison to prevent timing attacks
  const hashBuffer = Buffer.from(user.passwordHash, "hex");
  const candidateBuffer = Buffer.from(candidateHash, "hex");
  if (!timingSafeEqual(hashBuffer, candidateBuffer)) return null;

  const token = createToken({ id: user.id, role: user.role });
  return { token, user: { id: user.id, email: user.email, role: user.role } };
}

export function createToken(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const body = { ...payload, iat: Date.now(), exp: Date.now() + TOKEN_EXPIRY_MS };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const bodyB64 = Buffer.from(JSON.stringify(body)).toString("base64url");
  const signature = createHmac("sha256", TOKEN_SECRET)
    .update(`${headerB64}.${bodyB64}`)
    .digest("base64url");

  return `${headerB64}.${bodyB64}.${signature}`;
}

export function verifyToken(token) {
  try {
    if (typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, bodyB64, signature] = parts;

    // Verify signature
    const expectedSignature = createHmac("sha256", TOKEN_SECRET)
      .update(`${headerB64}.${bodyB64}`)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(bodyB64, "base64url").toString());

    // Check expiry
    if (!payload.exp || payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

export function authorize(token, requiredRole) {
  const payload = verifyToken(token);
  if (!payload) return false;

  const userLevel = ROLE_HIERARCHY[payload.role];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];

  if (userLevel == null || requiredLevel == null) return false;

  // Role hierarchy: admin (2) >= user (1)
  return userLevel >= requiredLevel;
}
