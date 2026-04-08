import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const settingsPath = resolve(__dirname, "../../.claude/settings.json");

// --- Load and parse hooks from settings.json ---

const settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
const stopHooks = settings.hooks?.Stop ?? [];

function getHookPrompt(index) {
  return stopHooks[index]?.hooks?.[0]?.prompt ?? "";
}

const lessonPrompt = getHookPrompt(0);
const pipelinePrompt = getHookPrompt(1);

// --- Pattern extractor: pulls detection keywords from the hook prompts ---

/**
 * Patterns the lesson-detection hook looks for in the assistant message.
 * Split into "phrase" (multi-word, safe for substring match) and "word"
 * (single-word, needs word-boundary match to avoid false positives).
 */
const LESSON_PHRASES = [
  "i apologize",
  "you are right",
  "that was incorrect",
  "my mistake",
  "let me try a different approach",
  "that did not work",
  "the previous attempt failed",
];
const LESSON_WORDS = ["wrong", "not that", "instead do"];
// Note: "no" alone is too ambiguous even with word boundaries — the LLM uses
// context to determine if the user said "no" as a correction. We skip it in
// the deterministic matcher and rely on the phrase patterns above.

/** Check if a message would trigger the lesson-detection hook */
function wouldTriggerLesson(message) {
  const lower = message.toLowerCase();
  if (LESSON_PHRASES.some((p) => lower.includes(p))) return true;
  return LESSON_WORDS.some((w) => new RegExp(`\\b${w}\\b`).test(lower));
}

/** Check if a message would trigger the post-pipeline hook */
function wouldTriggerPipeline(message) {
  const lower = message.toLowerCase();
  // Patterns from the pipeline hook prompt
  const stageKeywords = ["plan", "implement", "test", "review", "security"];
  const completionSignals = [
    "pipeline summary",
    "security review complet",
    "all stages complet",
    "pipeline run complet",
  ];

  const stagesFound = stageKeywords.filter((k) => lower.includes(k));
  const hasCompletionSignal = completionSignals.some((s) =>
    lower.includes(s)
  );

  // Pipeline detected if: completion signal + multiple stages mentioned
  return hasCompletionSignal || stagesFound.length >= 3;
}

// =============================================================
// Tests
// =============================================================

describe("Hook structure validation", () => {
  it("settings.json has Stop hooks array", () => {
    assert.ok(Array.isArray(stopHooks), "Stop hooks should be an array");
    assert.equal(stopHooks.length, 2, "Should have 2 Stop hooks");
  });

  it("lesson-detection hook has type=agent and prompt", () => {
    const hook = stopHooks[0].hooks[0];
    assert.equal(hook.type, "agent");
    assert.ok(hook.prompt.length > 50, "Prompt should be substantial");
    assert.ok(hook.timeout > 0, "Should have a timeout");
  });

  it("post-pipeline hook has type=agent and prompt", () => {
    const hook = stopHooks[1].hooks[0];
    assert.equal(hook.type, "agent");
    assert.ok(hook.prompt.length > 50, "Prompt should be substantial");
    assert.ok(hook.timeout > 0, "Should have a timeout");
  });

  it("both hooks check stop_hook_active to prevent loops", () => {
    assert.ok(lessonPrompt.includes("stop_hook_active"));
    assert.ok(pipelinePrompt.includes("stop_hook_active"));
  });

  it("lesson hook references $ARGUMENTS", () => {
    assert.ok(lessonPrompt.includes("$ARGUMENTS"));
  });

  it("pipeline hook references $ARGUMENTS", () => {
    assert.ok(pipelinePrompt.includes("$ARGUMENTS"));
  });
});

describe("Lesson-detection hook — should trigger", () => {
  const shouldTrigger = [
    {
      name: "Claude apologizes for mistake",
      msg: "I apologize, I was looking at the wrong file. Let me fix that.",
    },
    {
      name: "Claude acknowledges user is right",
      msg: "You are right, the import should use the default export instead.",
    },
    {
      name: "Claude admits incorrect approach",
      msg: "That was incorrect — the hook needs a command type, not agent.",
    },
    {
      name: "Claude says my mistake",
      msg: "My mistake, the path should be relative to the project root.",
    },
    {
      name: "Claude retries different approach",
      msg: "Let me try a different approach since the regex didn't work.",
    },
    {
      name: "Previous attempt failed",
      msg: "The previous attempt failed because the file was read-only.",
    },
    {
      name: "That did not work",
      msg: "That did not work. I'll use a node script instead.",
    },
  ];

  for (const { name, msg } of shouldTrigger) {
    it(name, () => {
      assert.ok(
        wouldTriggerLesson(msg),
        `Expected trigger for: "${msg.slice(0, 60)}..."`
      );
    });
  }
});

describe("Lesson-detection hook — should NOT trigger", () => {
  const shouldNotTrigger = [
    {
      name: "Normal bug fix implementation",
      msg: "I've fixed the null pointer bug in the auth module. The issue was a missing null check.",
    },
    {
      name: "Standard iterative work",
      msg: "Done. The component now renders correctly with the new props.",
    },
    {
      name: "Expected error handling",
      msg: "Added try-catch around the API call to handle network errors gracefully.",
    },
    {
      name: "Routine file creation",
      msg: "Created the new test file with 5 test cases covering edge cases.",
    },
  ];

  for (const { name, msg } of shouldNotTrigger) {
    it(name, () => {
      assert.ok(
        !wouldTriggerLesson(msg),
        `Should NOT trigger for: "${msg.slice(0, 60)}..."`
      );
    });
  }
});

describe("Post-pipeline hook — should trigger", () => {
  const shouldTrigger = [
    {
      name: "Security review completion (final stage)",
      msg: "Security review completed. No critical vulnerabilities found. All OWASP Top 10 categories checked.",
    },
    {
      name: "Pipeline summary with stages",
      msg: "Pipeline summary: Plan ✓, Implement ✓, Test ✓, Review ✓, Security ✓. All stages completed successfully.",
    },
    {
      name: "Multiple stages mentioned",
      msg: "The Plan phase identified 3 tasks. Implement phase created 2 files. Test phase passed 8/8. Review approved.",
    },
    {
      name: "Pipeline run completed",
      msg: "Pipeline run completed. 5 stages executed with no blockers.",
    },
  ];

  for (const { name, msg } of shouldTrigger) {
    it(name, () => {
      assert.ok(
        wouldTriggerPipeline(msg),
        `Expected trigger for: "${msg.slice(0, 60)}..."`
      );
    });
  }
});

describe("Post-pipeline hook — should NOT trigger", () => {
  const shouldNotTrigger = [
    {
      name: "Single task completion",
      msg: "Done. I've implemented the feature and it passes all tests.",
    },
    {
      name: "Just a review, no pipeline",
      msg: "Code review complete. Found 2 minor issues that should be addressed.",
    },
    {
      name: "Normal conversation",
      msg: "Here's the updated configuration file with the new settings.",
    },
    {
      name: "Partial pipeline (only 2 stages)",
      msg: "Implemented the fix and ran the tests. All passing.",
    },
  ];

  for (const { name, msg } of shouldNotTrigger) {
    it(name, () => {
      assert.ok(
        !wouldTriggerPipeline(msg),
        `Should NOT trigger for: "${msg.slice(0, 60)}..."`
      );
    });
  }
});
