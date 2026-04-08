#!/usr/bin/env python3
"""
Validate agent-workflow manifests and repository structure.

Checks:
  1. All three JSON manifests parse correctly.
  2. Version fields are consistent across all three.
  3. Required paths exist in the repository.
  4. Every skill subdirectory contains a SKILL.md file.
  5. Distribution packages (if dist/ exists) contain no forbidden files.

Exits with code 0 on full success, code 1 on any failure.
"""

import json
import os
import sys

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

RESET = "\033[0m"
GREEN = "\033[32m"
RED   = "\033[31m"

failures: list[str] = []


def ok(msg: str) -> None:
    print(f"  {GREEN}PASS{RESET}  {msg}")


def fail(msg: str) -> None:
    print(f"  {RED}FAIL{RESET}  {msg}")
    failures.append(msg)


def section(title: str) -> None:
    print(f"\n{title}")
    print("-" * len(title))


# ---------------------------------------------------------------------------
# Resolve repo root (script lives in scripts/, repo root is one level up)
# ---------------------------------------------------------------------------

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SCRIPT_DIR)

MANIFESTS = {
    "Claude Code (.claude-plugin/plugin.json)": os.path.join(ROOT, ".claude-plugin", "plugin.json"),
    "Copilot CLI (plugin.json)":                os.path.join(ROOT, "plugin.json"),
    "VS Code extension (package.json)":         os.path.join(ROOT, "package.json"),
    "VS Code Claude variant (package.claude.json)":  os.path.join(ROOT, "package.claude.json"),
    "VS Code Copilot variant (package.copilot.json)": os.path.join(ROOT, "package.copilot.json"),
}

REQUIRED_PATHS = [
    "skills",
    "agents",
    ".github/agents",
    "hooks/hooks.json",
    "settings.json",
    ".claude-plugin/plugin.json",
]

# ---------------------------------------------------------------------------
# 1. Parse JSON manifests
# ---------------------------------------------------------------------------

section("1. JSON manifest parsing")

parsed: dict[str, dict] = {}
for label, path in MANIFESTS.items():
    try:
        with open(path, encoding="utf-8") as fh:
            parsed[label] = json.load(fh)
        ok(f"{label}")
    except FileNotFoundError:
        fail(f"{label} — file not found: {path}")
    except json.JSONDecodeError as exc:
        fail(f"{label} — JSON parse error: {exc}")

# ---------------------------------------------------------------------------
# 2. Version consistency
# ---------------------------------------------------------------------------

section("2. Version consistency")

versions: dict[str, str] = {}
for label, data in parsed.items():
    v = data.get("version")
    if v is None:
        fail(f"{label} — missing 'version' field")
    else:
        versions[label] = v

if versions:
    unique = set(versions.values())
    if len(unique) == 1:
        ok(f"All manifests agree on version {next(iter(unique))!r}")
    else:
        for label, v in versions.items():
            fail(f"{label} — version is {v!r} (mismatch)")

# ---------------------------------------------------------------------------
# 3. Required paths
# ---------------------------------------------------------------------------

section("3. Required paths")

for rel in REQUIRED_PATHS:
    full = os.path.join(ROOT, rel)
    if os.path.exists(full):
        ok(rel)
    else:
        fail(f"{rel} — not found at {full}")

# ---------------------------------------------------------------------------
# 4. Skill subdirectories contain SKILL.md
# ---------------------------------------------------------------------------

section("4. Skill SKILL.md files")

skills_dir = os.path.join(ROOT, "skills")
if os.path.isdir(skills_dir):
    subdirs = sorted(
        entry.name
        for entry in os.scandir(skills_dir)
        if entry.is_dir()
    )
    if subdirs:
        for name in subdirs:
            skill_md = os.path.join(skills_dir, name, "SKILL.md")
            if os.path.isfile(skill_md):
                ok(f"skills/{name}/SKILL.md")
            else:
                fail(f"skills/{name}/SKILL.md — missing")
    else:
        fail("skills/ directory exists but contains no subdirectories")
else:
    fail("skills/ directory not found — skipping SKILL.md checks")

# ---------------------------------------------------------------------------
# 5. Distribution package validation (only if dist/ exists)
# ---------------------------------------------------------------------------

DIST_DIR = os.path.join(ROOT, "dist")
FORBIDDEN_FILES = [
    "README.md", "CONTRIBUTING.md", "CODEOWNERS", "CLAUDE.md",
    "GUIDE.md", "SETUP.md", "CHANGELOG.md", "INSTALL.md",
    "workflow-model-strategy.md", ".gitignore", ".git",
    "benchmark", "scripts", "node_modules", ".github/workflows",
    ".vscodeignore",
]

if os.path.isdir(DIST_DIR):
    section("5. Distribution packages")

    for pkg_name in sorted(os.listdir(DIST_DIR)):
        pkg_path = os.path.join(DIST_DIR, pkg_name)
        if not os.path.isdir(pkg_path):
            continue  # skip .vsix files

        # Check forbidden files
        for forbidden in FORBIDDEN_FILES:
            full = os.path.join(pkg_path, forbidden)
            if os.path.exists(full):
                fail(f"dist/{pkg_name} contains forbidden: {forbidden}")

        # Check PLAN-*.md
        import glob as _glob
        for f in _glob.glob(os.path.join(pkg_path, "PLAN-*.md")):
            fail(f"dist/{pkg_name} contains forbidden: {os.path.basename(f)}")

        # Check required files
        if os.path.isfile(os.path.join(pkg_path, "LICENSE")):
            ok(f"dist/{pkg_name}/LICENSE")
        else:
            fail(f"dist/{pkg_name} missing LICENSE")

        if os.path.isdir(os.path.join(pkg_path, "skills")):
            ok(f"dist/{pkg_name}/skills/")
        else:
            fail(f"dist/{pkg_name} missing skills/")

        if os.path.isdir(os.path.join(pkg_path, "agents")):
            ok(f"dist/{pkg_name}/agents/")
        else:
            fail(f"dist/{pkg_name} missing agents/")

        if os.path.isfile(os.path.join(pkg_path, "hooks", "hooks.json")):
            ok(f"dist/{pkg_name}/hooks/hooks.json")
        else:
            fail(f"dist/{pkg_name} missing hooks/hooks.json")

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

print()
print("=" * 50)
if failures:
    print(f"{RED}FAILED{RESET} — {len(failures)} issue(s) found:")
    for msg in failures:
        print(f"  - {msg}")
    sys.exit(1)
else:
    print(f"{GREEN}ALL CHECKS PASSED{RESET}")
    sys.exit(0)
