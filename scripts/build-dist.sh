#!/usr/bin/env bash
# build-dist.sh — Assemble clean distribution packages for each target platform.
# Compatible with: Windows (Git Bash/MSYS2), macOS, Linux
# Usage: bash scripts/build-dist.sh [--target TARGET] [--help]
# Targets: claude-code, copilot-cli, vscode-claude, vscode-copilot, all (default)

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

# Count files recursively in a directory
count_files() {
  local dir="$1"
  if [ -d "$dir" ]; then
    find "$dir" -type f | wc -l | tr -d ' '
  else
    echo "0"
  fi
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
  "hooks/hooks.dev.json"
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
  copy_dir  "$ROOT/.claude-plugin"        "$out/.claude-plugin"
  copy_file "$ROOT/hooks/hooks.json"      "$out/hooks/hooks.json"
  copy_file "$ROOT/settings.json"         "$out/settings.json"
  copy_file "$ROOT/LICENSE"               "$out/LICENSE"

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
  copy_file "$ROOT/hooks/hooks.json"      "$out/hooks/hooks.json"
  copy_file "$ROOT/settings.json"         "$out/settings.json"
  copy_file "$ROOT/LICENSE"               "$out/LICENSE"

  # Copy plugin.json and update agents path from ".github/agents/" to "agents/"
  sed 's|".github/agents/"|"agents/"|g' "$ROOT/plugin.json" > "$out/plugin.json"

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
