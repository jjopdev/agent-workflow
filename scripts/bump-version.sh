#!/usr/bin/env bash
# bump-version.sh — Bump the project version across all manifests.
# Compatible with: Windows (Git Bash/MSYS2), macOS, Linux
# Usage: bash scripts/bump-version.sh <patch|minor|major|X.Y.Z>

set -euo pipefail

# ---------------------------------------------------------------------------
# Resolve repo root (script lives in scripts/)
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
log_info()  { echo "[INFO]  $1"; }
log_ok()    { echo "[OK]    $1"; }
log_error() { echo "[ERROR] $1" >&2; }

die() { log_error "$1"; exit 1; }

# ---------------------------------------------------------------------------
# Parse current version from package.json (single source of truth)
# ---------------------------------------------------------------------------
CURRENT=$(grep '"version"' "$ROOT/package.json" | head -1 \
  | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

[ -n "$CURRENT" ] || die "Could not read current version from package.json"
log_info "Current version: $CURRENT"

# Split current version into parts
IFS='.' read -r CUR_MAJOR CUR_MINOR CUR_PATCH <<< "$CURRENT"

# ---------------------------------------------------------------------------
# Compute new version
# ---------------------------------------------------------------------------
[ $# -ge 1 ] || die "Usage: bash scripts/bump-version.sh <patch|minor|major|X.Y.Z>"

ARG="$1"

case "$ARG" in
  patch)
    NEW_VERSION="${CUR_MAJOR}.${CUR_MINOR}.$((CUR_PATCH + 1))"
    ;;
  minor)
    NEW_VERSION="${CUR_MAJOR}.$((CUR_MINOR + 1)).0"
    ;;
  major)
    NEW_VERSION="$((CUR_MAJOR + 1)).0.0"
    ;;
  *)
    # Validate explicit semver format
    if echo "$ARG" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
      NEW_VERSION="$ARG"
    else
      die "Invalid argument '$ARG'. Use: patch, minor, major, or X.Y.Z"
    fi
    ;;
esac

log_info "New version:     $NEW_VERSION"

if [ "$CURRENT" = "$NEW_VERSION" ]; then
  die "New version is the same as current ($CURRENT). Nothing to do."
fi

# ---------------------------------------------------------------------------
# Manifest files to update (relative to ROOT)
# ---------------------------------------------------------------------------
MANIFESTS=(
  "package.json"
  "package.claude.json"
  "package.copilot.json"
  "plugin.json"
  ".claude-plugin/plugin.json"
)

# ---------------------------------------------------------------------------
# Update version in all manifests
# ---------------------------------------------------------------------------
for manifest in "${MANIFESTS[@]}"; do
  filepath="$ROOT/$manifest"
  if [ ! -f "$filepath" ]; then
    log_error "Manifest not found: $manifest (skipping)"
    continue
  fi
  sed -i '' "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" "$filepath"
  log_ok "Updated $manifest → $NEW_VERSION"
done

# ---------------------------------------------------------------------------
# Add CHANGELOG.md template entry (idempotent — skip if version already exists)
# ---------------------------------------------------------------------------
CHANGELOG="$ROOT/CHANGELOG.md"
TODAY=$(date +%Y-%m-%d)

if grep -qF "## [$NEW_VERSION]" "$CHANGELOG" 2>/dev/null; then
  log_info "CHANGELOG.md already has entry for $NEW_VERSION — skipping"
else
  # Insert new entry after the header block (line starting with "## [")
  TEMPLATE="## [$NEW_VERSION] - $TODAY\n\n### Added\n\n### Changed\n\n### Fixed\n"
  # Find the first release heading and insert before it
  sed -i '' "0,/^## \[/s|^## \[|${TEMPLATE}\n## [|" "$CHANGELOG"
  log_ok "Added CHANGELOG.md template for $NEW_VERSION"
fi

# ---------------------------------------------------------------------------
# Run validate-manifests.py if available
# ---------------------------------------------------------------------------
VALIDATOR="$ROOT/scripts/validate-manifests.py"
PYTHON=""
if command -v python3 &>/dev/null && python3 --version &>/dev/null; then
  PYTHON="python3"
elif command -v python &>/dev/null && python --version &>/dev/null; then
  PYTHON="python"
fi

if [ -f "$VALIDATOR" ] && [ -n "$PYTHON" ]; then
  log_info "Running validate-manifests.py..."
  $PYTHON "$VALIDATOR"
else
  log_info "Skipping validation (python not found or validator missing)"
fi

echo ""
log_ok "Version bumped: $CURRENT → $NEW_VERSION"
