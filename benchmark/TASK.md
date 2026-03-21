# Workflow Benchmark Task

## Objective

Fix the security vulnerabilities and bugs in `benchmark/src/` and bring test coverage to 100%.

## What to test with `/workflow`

Paste this into Claude Code:

```
/workflow Fix all security vulnerabilities and bugs in benchmark/src/. The auth module uses unsigned base64 tokens (forgeable), has no expiry, no role hierarchy validation, and plaintext passwords. The API has no input validation, no sanitization (XSS), and loose equality on IDs. Add missing tests for token forgery, malformed tokens, input validation, and XSS. Acceptance: all tests pass, no OWASP Top 10 findings remain.
```

## Expected pipeline activation

| Stage | Agent | What should happen |
|-------|-------|--------------------|
| Plan | haiku | Decomposes into subtasks: auth hardening, API validation, test coverage |
| Implement | sonnet | Fixes token signing, adds validation, sanitizes input |
| Test | sonnet | Writes and runs missing tests, verifies 100% coverage |
| Review | sonnet | Reviews changes for quality, simplicity, correctness |
| Security | opus | OWASP review — should find and flag any remaining issues |

## How to verify subagents are running

1. **Model indicator**: Watch the model name in the status line — it should switch between opus/sonnet/haiku
2. **Agent tool calls**: In the conversation, look for `Agent` tool invocations with `subagent_type` specified
3. **Structured delegation**: The orchestrator should produce TASK/SKILLS/CONTEXT_FILES/ACCEPTANCE blocks
4. **Different capabilities**: The reviewer agent is read-only (no Edit/Write/Bash)
