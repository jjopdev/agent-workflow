/**
 * API handlers with input validation and XSS sanitization.
 */

import { login, authorize } from "./auth.js";

const posts = [
  { id: 1, title: "Hello World", body: "First post", authorId: 1 },
];

// Exported for testing — allows resetting state between tests
export function _resetPosts() {
  posts.length = 0;
  posts.push({ id: 1, title: "Hello World", body: "First post", authorId: 1 });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TITLE_LENGTH = 200;
const MAX_BODY_LENGTH = 10000;

export function handleLogin(req) {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return { status: 400, body: { error: "Invalid email format" } };
  }
  if (typeof password !== "string" || password.length === 0) {
    return { status: 400, body: { error: "Password is required" } };
  }

  const result = login(email, password);
  if (!result) return { status: 401, body: { error: "Invalid credentials" } };
  return { status: 200, body: result };
}

export function handleGetPosts() {
  return { status: 200, body: posts };
}

export function handleCreatePost(req) {
  const { token } = req.headers ?? {};
  if (!authorize(token, "admin")) {
    return { status: 403, body: { error: "Forbidden" } };
  }

  const { title, body } = req.body ?? {};

  if (typeof title !== "string" || title.trim().length === 0) {
    return { status: 400, body: { error: "Title is required" } };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { status: 400, body: { error: `Title must be at most ${MAX_TITLE_LENGTH} characters` } };
  }
  if (typeof body !== "string" || body.trim().length === 0) {
    return { status: 400, body: { error: "Body is required" } };
  }
  if (body.length > MAX_BODY_LENGTH) {
    return { status: 400, body: { error: `Body must be at most ${MAX_BODY_LENGTH} characters` } };
  }

  const sanitizedTitle = escapeHtml(title.trim());
  const sanitizedBody = escapeHtml(body.trim());

  const maxId = posts.reduce((max, p) => Math.max(max, p.id), 0);
  const newPost = { id: maxId + 1, title: sanitizedTitle, body: sanitizedBody, authorId: 1 };
  posts.push(newPost);
  return { status: 201, body: newPost };
}

export function handleDeletePost(req) {
  const { token } = req.headers ?? {};
  if (!authorize(token, "admin")) {
    return { status: 403, body: { error: "Forbidden" } };
  }

  const id = parseInt(req.params?.id, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return { status: 400, body: { error: "Invalid post ID" } };
  }

  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return { status: 404, body: { error: "Not found" } };

  posts.splice(index, 1);
  return { status: 200, body: { deleted: true } };
}
