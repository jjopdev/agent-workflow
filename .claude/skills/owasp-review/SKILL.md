---
name: owasp-review
description: >
  Use this skill when reviewing application code, APIs, auth flows, forms,
  infrastructure glue, or pull requests for security weaknesses. It applies to
  OWASP Top 10:2025 reviews, secure-code audits, vulnerability triage, and web
  application hardening work, even when the user only says "check security",
  "review for vulnerabilities", or "make this app safer". Focus on practical
  reviewer behavior: find the issue, explain risk, map it to OWASP, and state
  the minimum change required to reduce exposure.
version: 1.0.0
---

# OWASP Review - Secure Code Review for Web Applications

Use this skill as the default review framework for security-focused code reviews.
It is optimized for Reviewer and PR Reviewer workflows: scan quickly, identify
the real risk, tie it to a known weakness category, and give a concrete next action.

## When to use this skill

- The user asks for a security review, vulnerability review, or secure-code audit.
- A change touches authentication, authorization, sessions, forms, uploads, or APIs.
- A pull request introduces data access, third-party integrations, or exception handling.
- The task references OWASP Top 10:2025, XSS, CSRF, injection, secrets, headers, or hardening.

## Review workflow

1. Read only the changed files and the directly related auth, schema, and data-access code.
2. Run Snyk scans when tools are available, but do not stop at tool output.
3. Review against the OWASP Top 10:2025 sections below.
4. Apply the cross-cutting web checks for gaps Snyk may not catch.
5. Report findings with severity, impacted path, exploit condition, and minimum fix.

## Review output contract

For each finding, state:

- Severity: `Critical`, `Important`, or `Suggestion`
- OWASP mapping: `A01` to `A10`, plus optional CWE or ASVS note when helpful
- Exploit path: how an attacker reaches the issue
- Evidence: file, route, component, or code path involved
- Minimum fix: the smallest change that materially reduces risk

## Quick reference

| Prompt pattern | Review focus |
|---|---|
| "Review this API for security" | Auth, access control, input validation, response leakage |
| "Check this PR for OWASP issues" | Changed files, auth/session impact, injection, secrets, logging |
| "Make this app safer" | Misconfiguration, headers, CSRF, rate limiting, secrets, exception handling |
| "Look for XSS or auth bypass" | Output encoding, untrusted HTML, IDOR, route/resource authorization |

## OWASP Top 10:2025 review guide

### A01:2025 - Broken Access Control

Review for authorization failures, not only authentication gaps.

Check:
- Every protected route verifies identity before data access.
- Resource ownership or tenant scope is checked, not just role presence.
- User-controlled identifiers cannot fetch or mutate another user's data.
- Server actions and API handlers enforce auth internally and do not rely only on middleware.

Look for:
- IDOR-style access using `id`, `userId`, `accountId`, `slug`, or path params.
- Admin-only actions guarded in the UI but not on the server.
- Bulk operations that skip per-record authorization.

Repo-specific expectation:
- For API routes and server handlers, verify identity before any protected data access.

### A02:2025 - Security Misconfiguration

Review for insecure defaults, exposed internals, and missing hardening.

Check:
- Debug behavior, stack traces, and provider-specific errors are not exposed to clients.
- Public routes are explicitly documented as public and narrowly scoped.
- CORS policy is explicit rather than permissive.
- Security headers are present where relevant: CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`.

Look for:
- Wildcard CORS on authenticated endpoints.
- Missing frame protections on sensitive pages.
- Error responses that reveal cloud provider details, SQL messages, or internal object shapes.

### A03:2025 - Software Supply Chain Failures

Review dependency and build-chain risk, especially around new packages or scripts.

Check:
- New dependencies are necessary, maintained, and scoped to the smallest surface.
- Lockfiles are updated intentionally.
- Build or deploy scripts do not pull remote code dynamically without integrity controls.
- Snyk dependency findings are acknowledged and triaged.

Look for:
- Unpinned install patterns.
- Postinstall or shell scripts with broad network or file-system access.
- Packages added only for convenience when a standard library solution exists.

### A04:2025 - Cryptographic Failures

Review storage, transit, and token handling of sensitive data.

Check:
- Secrets, tokens, API keys, and private identifiers are never hardcoded.
- Sensitive values are not logged, echoed to the client, or embedded in the frontend.
- Passwords or secrets are delegated to established providers or safe primitives instead of custom crypto.
- Cookie and session settings are appropriate for the risk level.

Look for:
- Custom encryption wrappers without clear justification.
- Tokens stored in local storage when an HttpOnly cookie design is expected.
- Plaintext secrets in config, fixtures, screenshots, or test helpers.

### A05:2025 - Injection

Review every untrusted input path before it reaches a query, shell, template, or parser.

Check:
- Request bodies are validated with schemas before use.
- SQL, NoSQL, shell, path, and template inputs are parameterized or constrained.
- Rendering code does not trust raw HTML or markdown without sanitization.
- File upload metadata is validated server-side.

Look for:
- String concatenation inside queries, filters, commands, or file paths.
- `dangerouslySetInnerHTML` without explicit sanitization.
- Validation after the data is already used.

Repo-specific expectation:
- Apply schema-first validation before using request data and validate uploaded files server-side using content inspection rather than trusting `Content-Type` alone.

### A06:2025 - Insecure Design

Review whether the feature design itself creates risk, even if the code is tidy.

Check:
- High-risk actions have clear trust boundaries and explicit authorization rules.
- Sensitive workflows have abuse-case thinking: replay, enumeration, impersonation, mass assignment.
- The change introduces the minimum privilege needed.

Look for:
- Client-side trust decisions that should live on the server.
- Implicit access rules spread across components instead of one server-side gate.
- Features that expose data to convenience endpoints without a clear threat model.

### A07:2025 - Authentication Failures

Review login, session, and identity lifecycle behavior.

Check:
- Auth is verified on every protected mutation and sensitive read.
- Session or token handling is resistant to reuse and leakage.
- Password reset, email verification, and account recovery flows avoid enumeration.
- Brute-force sensitive endpoints have throttling or rate-limiting plans.

Look for:
- Middleware-only protection.
- Different error messages for "user not found" versus "password invalid".
- Missing logout or session invalidation semantics in high-risk flows.

### A08:2025 - Software or Data Integrity Failures

Review the trust boundary around data and code artifacts.

Check:
- The app does not trust unsigned or unverified external payloads by default.
- Webhooks, callbacks, and async job payloads are verified.
- Deserialization is constrained and schema-validated.

Look for:
- Blind trust in webhook payloads.
- Data merged into privileged objects without field allowlists.
- Cache or background job writes that bypass the usual validation path.

### A09:2025 - Security Logging and Alerting Failures

Review whether security-relevant events can be detected without leaking secrets.

Check:
- Failed auth, permission changes, suspicious input failures, and integrity errors are logged server-side.
- Logs exclude passwords, bearer tokens, cookies, API keys, and sensitive PII.
- The client receives generic errors while the server keeps actionable telemetry.

Look for:
- `console.log` on request bodies, auth claims, or provider responses.
- Silent failure on auth or authorization branches.
- No audit trail for privilege or configuration changes.

### A10:2025 - Mishandling of Exceptional Conditions

Review failure behavior under stress, invalid input, and partial outage.

Check:
- Exceptions fail closed on protected actions.
- Timeouts, retries, and fallback paths do not bypass security checks.
- Error handlers do not downgrade validation, auth, or integrity checks.

Look for:
- Catch blocks that return success-like responses.
- Retry or fallback logic that skips verification.
- Overly broad exception handling that hides security-relevant failures.

## Cross-cutting web checks

Apply these checks even if the issue does not fit a single OWASP section cleanly.

### CSRF

- Review state-changing browser requests for CSRF protection strategy.
- Check cookie and same-site assumptions before accepting a missing CSRF token.
- Treat unauthenticated public forms separately from authenticated mutation flows.

### XSS

- Trace untrusted content from storage or request to render path.
- Require sanitization before rendering raw HTML, markdown, or rich-text output.
- Prefer safe component rendering over HTML injection.

### CORS

- Validate allowed origins, methods, and credentials together.
- Flag wildcard origins on authenticated endpoints.
- Confirm preflight behavior matches the endpoint's real trust boundary.

### Security headers

- Review whether CSP, HSTS, frame protections, MIME sniff protections, and referrer policy are defined where needed.
- Treat missing headers on public marketing pages differently from missing headers on auth or app surfaces.

### Secrets and sensitive data exposure

- Flag secrets in code, sample payloads, logs, tests, or client bundles.
- Check that environment-variable names do not imply client exposure unless explicitly intended.

### Rate limiting and abuse resistance

- Review login, reset, invite, verification, search, and export endpoints for abuse controls.
- If rate limiting is absent, call it out as a design gap when the endpoint is enumeratable or expensive.

### SSRF and outbound requests

- Review user-controlled URLs, redirects, fetch targets, and asset import flows.
- Prefer allowlists or constrained target generation over raw user-provided URLs.

### Clickjacking

- Flag sensitive flows rendered without frame protections.
- Focus on sign-in, billing, admin, and account-management surfaces.

## Project-specific alignment

If the current repository already defines route, auth, validation, upload, or error-handling standards, treat them as the local implementation baseline for the checks in this skill.

Common examples:
- Protected routes verify identity before data access.
- Request data is validated with shared schemas before use.
- Unexpected server errors are logged server-side and exposed generically to clients.
- Upload type and size are validated server-side.

## Severity guidance

Use `Critical` when exploitation could directly bypass auth, expose secrets, or enable unsafe code/data execution.
Use `Important` when the flaw materially weakens security posture or enables abuse under realistic conditions.
Use `Suggestion` when the issue is a meaningful hardening gap without immediate exploit evidence.

## See also

- OWASP ASVS for stricter enterprise control objectives.
- OWASP WSTG for manual testing ideas when code review is not enough.
- CWE mappings when a finding needs standardized classification.

## Rules

- Do not rely on Snyk alone; manual review is mandatory.
- Do not stop at validation; authorization and data exposure must be checked separately.
- Prefer the minimum fix that closes the security gap at the server boundary.
- When evidence is weak, mark the uncertainty and explain what must be verified next.
