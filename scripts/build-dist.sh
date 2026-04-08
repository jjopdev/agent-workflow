#!/usr/bin/env bash
# build-dist.sh — Assemble clean distribution packages for each target platform.
# Compatible with: Windows (Git Bash/MSYS2), macOS, Linux
# Usage: bash scripts/build-dist.sh [--target TARGET] [--help]
# Targets: claude-code, copilot-cli, vscode-claude, vscode-copilot, all (default)

# ---------------------------------------------------------------------------
# Skill distribution policy
# ---------------------------------------------------------------------------
# REQUIRED (5): workflow, workflow-knowledge, workflow-orchestrator, owasp-review, github-cli
# OPTIONAL (9): lesson, save-progress, consolidate, post-session, review-pr,
#               create-issue, prompt-refiner, owasp-mcp-review, skill-creator
# INFRASTRUCTURE (2): codebase-navigator, rlm-codebase-navigation
# EXCLUDED (1): interface-design (domain-specific, heavy references)
# Total distributed: 16 skills

set -euo pipefail

# ---------------------------------------------------------------------------
# Resolve repo root (script lives in scripts/)
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST="$ROOT/dist"

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------
TARGET="all"

print_help() {
  echo "Usage: bash scripts/build-dist.sh [--target TARGET] [--help]"
  echo ""
  echo "Targets:"
  echo "  claude-code     Claude Code plugin package"
  echo "  copilot-cli     Copilot CLI plugin package"
  echo "  vscode-claude   VS Code extension with Claude agents (.vsix)"
  echo "  vscode-copilot  VS Code extension with Copilot agents (.vsix)"
  echo "  all             Build all targets (default)"
  echo ""
  echo "Output: dist/<target>/ or dist/<target>.vsix"
}

while [ $# -gt 0 ]; do
  case "$1" in
    --help|-h)
      print_help
      exit 0
      ;;
    --target|-t)
      TARGET="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1"
      print_help
      exit 1
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
log_info()  { echo "[INFO]  $1"; }
log_ok()    { echo "[OK]    $1"; }
log_warn()  { echo "[WARN]  $1"; }
log_error() { echo "[ERROR] $1"; }

# Read version from package.json (no jq dependency)
VERSION=$(grep '"version"' "$ROOT/package.json" | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
log_info "Version: $VERSION"

# Copy a directory recursively, creating parent dirs
copy_dir() {
  local src="$1" dest="$2"
  if [ ! -d "$src" ]; then
    log_warn "Source directory not found: $src"
    return 1
  fi
  mkdir -p "$dest"
  cp -r "$src/." "$dest/"
}

# Copy a single file, creating parent dirs
copy_file() {
  local src="$1" dest="$2"
  if [ ! -f "$src" ]; then
    log_warn "Source file not found: $src"
    return 1
  fi
  mkdir -p "$(dirname "$dest")"
  cp "$src" "$dest"
}

# Portable in-place replacement that works on macOS and Linux.
replace_in_file() {
  local expr="$1" file="$2" tmp_file

  if [ ! -f "$file" ]; then
    log_warn "File not found for replacement: $file"
    return 1
  fi

  tmp_file="${file}.tmp.$$"
  if sed "$expr" "$file" > "$tmp_file"; then
    mv "$tmp_file" "$file"
  else
    rm -f "$tmp_file"
    return 1
  fi
}

# Sync version from package.json into a plugin.json file
sync_version() {
  local file="$1"
  if [ -f "$file" ]; then
    replace_in_file "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$VERSION\"/" "$file"
    log_info "Synced version $VERSION → $file"
  fi
}

# Count files recursively in a directory
count_files() {
  local dir="$1"
  if [ -d "$dir" ]; then
    find "$dir" -type f | wc -l | tr -d ' '
  else
    echo "0"
  fi
}

# Remove development-only skill artifacts from packaged distributions.
remove_skill_dev_artifacts() {
  local skills_dir="$1"

  if [ ! -d "$skills_dir" ]; then
    return 0
  fi

  find "$skills_dir" -type d -name "evals" -exec rm -rf {} + 2>/dev/null || true
  find "$skills_dir" -type d -name "templates" -exec rm -rf {} + 2>/dev/null || true
  find "$skills_dir" -type d -name "references" -exec rm -rf {} + 2>/dev/null || true

  # Exclude domain-specific skills not needed for core workflow.
  rm -rf "$skills_dir/interface-design" 2>/dev/null || true
}

translate_claude_tools_for_vscode() {
  local agents_dir="$1"

  if [ ! -d "$agents_dir" ]; then
    return 0
  fi

  log_info "Translating Claude tool names to VS Code equivalents..."

  local f
  for f in "$agents_dir"/*.md; do
    [ -f "$f" ] || continue
    replace_in_file 's/^  - Read$/  - read\/readFile/' "$f"
    replace_in_file 's/^  - Edit$/  - edit\/editFiles/' "$f"
    replace_in_file 's/^  - Write$/  - edit\/createFile/' "$f"
    replace_in_file 's/^  - Bash$/  - execute\/runInTerminal/' "$f"
    replace_in_file 's/^  - Glob$/  - search\/fileSearch/' "$f"
    replace_in_file 's/^  - Grep$/  - search\/textSearch/' "$f"
    replace_in_file 's/^  - Agent$/  - agent\/runSubagent/' "$f"
    replace_in_file 's/^  - NotebookEdit$/  - edit\/editNotebook/' "$f"
    replace_in_file '/^  - WebFetch$/d' "$f"
    replace_in_file '/^  - WebSearch$/d' "$f"
    replace_in_file '/^  - TaskCreate$/d' "$f"
    replace_in_file '/^  - TaskUpdate$/d' "$f"
    replace_in_file '/^  - TaskList$/d' "$f"
    replace_in_file '/^  - TaskGet$/d' "$f"
  done

  log_ok "Tool names translated for $(find "$agents_dir" -maxdepth 1 -name '*.md' | wc -l | tr -d ' ') agent files"
}

# ---------------------------------------------------------------------------
# Forbidden files check — ensures no project metadata leaks into packages
# ---------------------------------------------------------------------------
FORBIDDEN_PATTERNS=(
  "README.md"
  "CONTRIBUTING.md"
  "CODEOWNERS"
  "CLAUDE.md"
  "GUIDE.md"
  "SETUP.md"
  "CHANGELOG.md"
  "PLAN-*.md"
  "workflow-model-strategy.md"
  ".gitignore"
  ".git"
  "benchmark"
  "scripts"
  "node_modules"
  ".github/workflows"
  ".vscodeignore"
  ".vscodeignore.claude"
  ".vscodeignore.copilot"
  "package.claude.json"
  "package.copilot.json"
)

validate_package() {
  local pkg_dir="$1" pkg_name="$2"
  local errors=0

  log_info "Validating $pkg_name..."

  # Check forbidden files/dirs
  for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
    # Use find for glob patterns, direct check for fixed names
    if [ -e "$pkg_dir/$pattern" ]; then
      log_error "Forbidden file found in $pkg_name: $pattern"
      errors=$((errors + 1))
    fi
  done

  # Check PLAN-*.md specifically (glob)
  for f in "$pkg_dir"/PLAN-*.md; do
    if [ -f "$f" ]; then
      log_error "Forbidden file found in $pkg_name: $(basename "$f")"
      errors=$((errors + 1))
    fi
  done

  # Check required: LICENSE
  if [ ! -f "$pkg_dir/LICENSE" ]; then
    log_error "$pkg_name missing LICENSE"
    errors=$((errors + 1))
  fi

  # Check required: skills/
  if [ ! -d "$pkg_dir/skills" ]; then
    log_error "$pkg_name missing skills/"
    errors=$((errors + 1))
  else
    # Verify each skill subdir has SKILL.md
    for skill_dir in "$pkg_dir"/skills/*/; do
      if [ -d "$skill_dir" ] && [ ! -f "$skill_dir/SKILL.md" ]; then
        log_error "$pkg_name: $(basename "$skill_dir") missing SKILL.md"
        errors=$((errors + 1))
      fi
    done
  fi

  # Check required: agents/
  if [ ! -d "$pkg_dir/agents" ]; then
    log_error "$pkg_name missing agents/"
    errors=$((errors + 1))
  fi

  # Check required: hooks/hooks.json
  if [ ! -f "$pkg_dir/hooks/hooks.json" ]; then
    log_error "$pkg_name missing hooks/hooks.json"
    errors=$((errors + 1))
  fi

  # Check no development artifacts leaked into package
  local dev_dirs
  dev_dirs=$(find "$pkg_dir/skills" -type d \( -name "evals" -o -name "templates" -o -name "references" \) 2>/dev/null || true)
  if [ -n "$dev_dirs" ]; then
    log_error "$pkg_name contains development artifacts: $dev_dirs"
    errors=$((errors + 1))
  fi

  if [ "$errors" -eq 0 ]; then
    log_ok "$pkg_name validated ($(count_files "$pkg_dir") files)"
  else
    log_error "$pkg_name has $errors validation error(s)"
  fi

  return "$errors"
}

# ---------------------------------------------------------------------------
# Build: Claude Code
# ---------------------------------------------------------------------------
build_claude_code() {
  local out="$DIST/claude-code"
  log_info "Building Claude Code package..."

  rm -rf "$out"
  mkdir -p "$out"

  copy_dir  "$ROOT/agents"                "$out/agents"
  copy_dir  "$ROOT/skills"                "$out/skills"
  remove_skill_dev_artifacts               "$out/skills"
  copy_dir  "$ROOT/.claude-plugin"        "$out/.claude-plugin"
  copy_file "$ROOT/hooks/hooks.json"      "$out/hooks/hooks.json"
  copy_file "$ROOT/settings.json"         "$out/settings.json"
  copy_file "$ROOT/LICENSE"               "$out/LICENSE"

  # Sync version from package.json into plugin manifest
  sync_version "$out/.claude-plugin/plugin.json"

  validate_package "$out" "claude-code"
}

# ---------------------------------------------------------------------------
# Build: Copilot CLI
# ---------------------------------------------------------------------------
build_copilot_cli() {
  local out="$DIST/copilot-cli"
  log_info "Building Copilot CLI package..."

  rm -rf "$out"
  mkdir -p "$out"

  # Copilot agents come from .github/agents/ (*.agent.md format)
  copy_dir  "$ROOT/.github/agents"        "$out/agents"
  copy_dir  "$ROOT/skills"                "$out/skills"
  remove_skill_dev_artifacts               "$out/skills"
  copy_file "$ROOT/hooks/hooks.json"      "$out/hooks/hooks.json"
  copy_file "$ROOT/settings.json"         "$out/settings.json"
  copy_file "$ROOT/LICENSE"               "$out/LICENSE"

  # Copy plugin.json and update agents path from ".github/agents/" to "agents/"
  sed 's|".github/agents/"|"agents/"|g' "$ROOT/plugin.json" > "$out/plugin.json"

  # Sync version from package.json into plugin manifest
  sync_version "$out/plugin.json"

  validate_package "$out" "copilot-cli"
}

# ---------------------------------------------------------------------------
# Build: VS Code variant (shared logic)
# ---------------------------------------------------------------------------
build_vscode_variant() {
  local variant="$1"  # "claude" or "copilot"
  local vsix_name="vscode-${variant}"
  local pkg_file="$ROOT/package.${variant}.json"
  local ignore_file="$ROOT/.vscodeignore.${variant}"

  log_info "Building VS Code ($variant) package..."

  if [ ! -f "$pkg_file" ]; then
    log_error "Missing $pkg_file"
    return 1
  fi

  if [ ! -f "$ignore_file" ]; then
    log_error "Missing $ignore_file"
    return 1
  fi

  # Backup originals
  local orig_pkg="$ROOT/package.json"
  local orig_ignore="$ROOT/.vscodeignore"
  local backup_pkg="$ROOT/.package.json.bak"
  local backup_ignore=""

  cp "$orig_pkg" "$backup_pkg"
  if [ -f "$orig_ignore" ]; then
    backup_ignore="$ROOT/.vscodeignore.bak"
    cp "$orig_ignore" "$backup_ignore"
  fi

  # For claude variant: translate tool names, clean skills, stage rules
  local staged_claude=false
  if [ "$variant" = "claude" ]; then
    # Backup agents and translate tool names for VS Code
    rm -rf "$ROOT/agents.vscode.bak"
    cp -r "$ROOT/agents" "$ROOT/agents.vscode.bak"
    translate_claude_tools_for_vscode "$ROOT/agents"

    # Backup skills and remove excluded content for VSIX
    rm -rf "$ROOT/skills.vscode.bak"
    cp -r "$ROOT/skills" "$ROOT/skills.vscode.bak"
    remove_skill_dev_artifacts "$ROOT/skills"

    # Stage .claude/rules/ as rules/ for VSIX packaging
    if [ -d "$ROOT/.claude/rules" ]; then
      mkdir -p "$ROOT/rules"
      cp -r "$ROOT/.claude/rules/." "$ROOT/rules/"
    fi
    staged_claude=true
  fi

  # For copilot variant: stage .github/agents/ as agents/ temporarily
  local staged_agents=false
  if [ "$variant" = "copilot" ]; then
    if [ -d "$ROOT/agents" ]; then
      mv "$ROOT/agents" "$ROOT/agents.claude.bak"
    fi
    mkdir -p "$ROOT/agents"
    cp -r "$ROOT/.github/agents/." "$ROOT/agents/"
    staged_agents=true
  fi

  # Swap manifests
  cp "$pkg_file" "$orig_pkg"
  # Sync version into variant manifest
  sync_version "$orig_pkg"
  cp "$ignore_file" "$orig_ignore"

  # Build .vsix
  local exit_code=0
  if command -v npx > /dev/null 2>&1; then
    log_info "Running: npx @vscode/vsce package -o dist/${vsix_name}.vsix"
    mkdir -p "$DIST"
    (cd "$ROOT" && npx @vscode/vsce package -o "dist/${vsix_name}.vsix" --skip-license 2>&1) || exit_code=$?
    if [ "$exit_code" -eq 0 ] && [ -f "$DIST/${vsix_name}.vsix" ]; then
      log_ok "Built dist/${vsix_name}.vsix"
    else
      log_error "vsce package failed for $variant (exit code: $exit_code)"
    fi
  else
    log_warn "npx not found — skipping VS Code build for $variant"
    log_warn "Install Node.js and run: npx @vscode/vsce package -o dist/${vsix_name}.vsix"
    exit_code=0  # Not a fatal error
  fi

  # Restore originals
  cp "$backup_pkg" "$orig_pkg"
  rm -f "$backup_pkg"
  if [ -n "$backup_ignore" ] && [ -f "$backup_ignore" ]; then
    cp "$backup_ignore" "$orig_ignore"
    rm -f "$backup_ignore"
  elif [ -z "$backup_ignore" ]; then
    rm -f "$orig_ignore"
  fi

  # Restore agents for copilot variant
  if [ "$staged_agents" = true ]; then
    rm -rf "$ROOT/agents"
    if [ -d "$ROOT/agents.claude.bak" ]; then
      mv "$ROOT/agents.claude.bak" "$ROOT/agents"
    fi
  fi

  # Restore agents, skills for claude variant
  if [ "$staged_claude" = true ]; then
    rm -rf "$ROOT/agents"
    mv "$ROOT/agents.vscode.bak" "$ROOT/agents"
    rm -rf "$ROOT/skills"
    mv "$ROOT/skills.vscode.bak" "$ROOT/skills"
    rm -rf "$ROOT/rules"
  fi

  # Keep variant source file version in sync
  sync_version "$pkg_file"

  return "$exit_code"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
  log_info "=== Agent Workflow Distribution Builder ==="
  log_info "Root: $ROOT"
  log_info "Target: $TARGET"
  echo ""

  local errors=0

  # Sync version into root plugin manifests (source of truth for installs)
  sync_version "$ROOT/.claude-plugin/plugin.json"
  sync_version "$ROOT/plugin.json"

  case "$TARGET" in
    claude-code)
      build_claude_code || errors=$((errors + 1))
      ;;
    copilot-cli)
      build_copilot_cli || errors=$((errors + 1))
      ;;
    vscode-claude)
      build_vscode_variant "claude" || errors=$((errors + 1))
      ;;
    vscode-copilot)
      build_vscode_variant "copilot" || errors=$((errors + 1))
      ;;
    all)
      build_claude_code   || errors=$((errors + 1))
      build_copilot_cli   || errors=$((errors + 1))
      build_vscode_variant "claude"  || errors=$((errors + 1))
      build_vscode_variant "copilot" || errors=$((errors + 1))
      ;;
    *)
      log_error "Unknown target: $TARGET"
      print_help
      exit 1
      ;;
  esac

  # ---------------------------------------------------------------------------
  # Sync to packages/ (git-tracked, for remote installs via git-subdir)
  # ---------------------------------------------------------------------------
  local PACKAGES="$ROOT/packages"
  if [ -d "$DIST/claude-code" ]; then
    log_info "Syncing packages/claude-code/ (git-tracked)..."
    rm -rf "$PACKAGES/claude-code"
    mkdir -p "$PACKAGES/claude-code"
    cp -r "$DIST/claude-code/." "$PACKAGES/claude-code/"
    log_ok "packages/claude-code/ synced"
  fi
  if [ -d "$DIST/copilot-cli" ]; then
    log_info "Syncing packages/copilot-cli/ (git-tracked)..."
    rm -rf "$PACKAGES/copilot-cli"
    mkdir -p "$PACKAGES/copilot-cli"
    cp -r "$DIST/copilot-cli/." "$PACKAGES/copilot-cli/"
    log_ok "packages/copilot-cli/ synced"
  fi

  # ---------------------------------------------------------------------------
  # Summary
  # ---------------------------------------------------------------------------
  echo ""
  log_info "=== Build Summary ==="

  if [ -d "$DIST/claude-code" ]; then
    log_ok "claude-code:    $(count_files "$DIST/claude-code") files"
  fi
  if [ -d "$DIST/copilot-cli" ]; then
    log_ok "copilot-cli:    $(count_files "$DIST/copilot-cli") files"
  fi
  if [ -f "$DIST/vscode-claude.vsix" ]; then
    local size
    size=$(wc -c < "$DIST/vscode-claude.vsix" | tr -d ' ')
    log_ok "vscode-claude:  $DIST/vscode-claude.vsix (${size} bytes)"
  fi
  if [ -f "$DIST/vscode-copilot.vsix" ]; then
    local size
    size=$(wc -c < "$DIST/vscode-copilot.vsix" | tr -d ' ')
    log_ok "vscode-copilot: $DIST/vscode-copilot.vsix (${size} bytes)"
  fi

  if [ "$errors" -gt 0 ]; then
    echo ""
    log_error "Build completed with $errors error(s)"
    exit 1
  fi

  echo ""
  log_ok "All builds completed successfully!"
}

main
