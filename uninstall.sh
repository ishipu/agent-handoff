#!/usr/bin/env sh
set -eu

PACKAGE_NAME="agent-handoff"

info() {
  printf '%s\n' "==> $*"
}

die() {
  printf '%s\n' "agent-handoff uninstall: $*" >&2
  exit 1
}

command -v npm >/dev/null 2>&1 || die "missing required command: npm"

NPM_PREFIX="$(npm prefix -g 2>/dev/null || true)"
BIN_PATH=""
if [ -n "$NPM_PREFIX" ]; then
  BIN_PATH="$NPM_PREFIX/bin/agent-handoff"
fi

if npm list -g "$PACKAGE_NAME" --depth=0 >/dev/null 2>&1; then
  info "Uninstalling $PACKAGE_NAME globally"
  npm uninstall -g "$PACKAGE_NAME" >/dev/null
else
  info "$PACKAGE_NAME is not installed globally through this npm prefix"
fi

if [ -n "$BIN_PATH" ] && { [ -e "$BIN_PATH" ] || [ -L "$BIN_PATH" ]; }; then
  info "Removing stale executable: $BIN_PATH"
  rm -f "$BIN_PATH" || die "could not remove stale executable: $BIN_PATH"
fi

if command -v agent-handoff >/dev/null 2>&1; then
  info "agent-handoff is still available at: $(command -v agent-handoff)"
  info "If this is another npm prefix, rerun with that prefix, for example: npm_config_prefix=\"\$HOME/.npm-global\" sh uninstall.sh"
else
  info "Uninstalled successfully"
fi
