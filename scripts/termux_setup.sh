#!/data/data/com.termux/files/usr/bin/bash
# Plug-and-play installer for the precompiled Android ARM64 build.
set -Eeuo pipefail

fail() {
    printf 'Error: %s\n' "$*" >&2
    exit 1
}

[ "$(uname -m)" = "aarch64" ] || fail "Este paquete es exclusivo para Android ARM64 (aarch64); detectado: $(uname -m)."
case "${PREFIX:-}" in
    */com.termux/files/usr) ;;
    *) fail "Ejecuta este instalador desde Termux en Android ARM64." ;;
esac

if ! command -v python >/dev/null 2>&1 && ! command -v python3 >/dev/null 2>&1; then
    command -v pkg >/dev/null 2>&1 || fail "Instala Python 3.10+ en Termux."
    pkg install -y python
fi
PYTHON="$(command -v python3 || command -v python)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# setup downloads and SHA-256-verifies the Android/Bionic aarch64 release.
exec "$PYTHON" "$SCRIPT_DIR/gdrive_skill.py" setup "$@"
