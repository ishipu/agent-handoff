#!/usr/bin/env sh
set -eu

PACKAGE_NAME="agent-handoff"
DEFAULT_REPO_URL="https://github.com/ishipu/agent-handoff.git"
REPO_URL="${AGENT_HANDOFF_REPO_URL:-$DEFAULT_REPO_URL}"
SOURCE_DIR="${AGENT_HANDOFF_SOURCE:-}"
TMP_DIR=""

info() {
  printf '%s\n' "==> $*"
}

die() {
  printf '%s\n' "agent-handoff install: $*" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"
}

cleanup() {
  if [ -n "$TMP_DIR" ] && [ -d "$TMP_DIR" ]; then
    rm -rf "$TMP_DIR"
  fi
}

trap cleanup EXIT INT TERM

OS_NAME="$(uname -s 2>/dev/null || printf unknown)"
case "$OS_NAME" in
  Darwin|Linux) ;;
  *) die "unsupported OS: $OS_NAME. This installer supports macOS and Linux." ;;
esac

need_cmd node
need_cmd npm

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || printf 0)"
case "$NODE_MAJOR" in
  ''|*[!0-9]*) die "could not determine Node.js version" ;;
esac

if [ "$NODE_MAJOR" -lt 20 ]; then
  die "Node.js 20 or newer is required. Current version: $(node -v)"
fi

if [ -z "$SOURCE_DIR" ] && [ -n "${0:-}" ] && [ -f "$0" ]; then
  SCRIPT_DIR="$(CDPATH= cd "$(dirname "$0")" && pwd -P)"
  if [ -f "$SCRIPT_DIR/package.json" ]; then
    SOURCE_DIR="$SCRIPT_DIR"
  fi
fi

if [ -z "$SOURCE_DIR" ]; then
  need_cmd git
  TMP_PARENT="${TMPDIR:-/tmp}"
  TMP_DIR="$(mktemp -d "$TMP_PARENT/agent-handoff.XXXXXX")"
  info "Cloning $REPO_URL"
  git clone --depth 1 "$REPO_URL" "$TMP_DIR/agent-handoff" >/dev/null
  SOURCE_DIR="$TMP_DIR/agent-handoff"
fi

[ -f "$SOURCE_DIR/package.json" ] || die "package.json not found in source: $SOURCE_DIR"

info "Preparing package from $SOURCE_DIR"
(
  cd "$SOURCE_DIR"
  if [ "${AGENT_HANDOFF_SKIP_DEPS:-}" = "1" ]; then
    info "Skipping dependency install because AGENT_HANDOFF_SKIP_DEPS=1"
  elif [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
  npm run build
)

info "Installing $PACKAGE_NAME globally"
if ! npm install -g --ignore-scripts "$SOURCE_DIR"; then
  die "npm global install failed. If this is a permissions issue, retry with: npm_config_prefix=\"$HOME/.npm-global\" sh install.sh"
fi

NPM_PREFIX="$(npm prefix -g 2>/dev/null || true)"
if [ -n "$NPM_PREFIX" ] && [ -d "$NPM_PREFIX/bin" ]; then
  PATH="$NPM_PREFIX/bin:$PATH"
fi

if ! command -v agent-handoff >/dev/null 2>&1; then
  die "installed, but agent-handoff is not on PATH. Add npm's global bin directory to PATH: $NPM_PREFIX/bin"
fi

agent-handoff --help >/dev/null
info "Installed successfully: $(command -v agent-handoff)"
info "Try: agent-handoff init /path/to/project"
