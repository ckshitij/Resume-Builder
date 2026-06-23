#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
RELEASE="$ROOT/release"
ZIP="$RELEASE/resume-builder-extension.zip"

echo "Building extension…"
npm run build --prefix "$ROOT"

for file in manifest.json sidepanel.html icons/icon128.png; do
  if [[ ! -f "$DIST/$file" ]]; then
    echo "Missing required file: dist/$file" >&2
    exit 1
  fi
done

mkdir -p "$RELEASE"
rm -f "$ZIP"

VERSION="$(node -pe "JSON.parse(require('fs').readFileSync('$DIST/manifest.json','utf8')).version")"
echo "Packaging v${VERSION}..."

(cd "$DIST" && zip -r -q "$ZIP" .)

SIZE="$(du -h "$ZIP" | cut -f1)"
echo ""
echo "Store package ready: $ZIP ($SIZE)"
echo "Upload at https://chrome.google.com/webstore/devconsole"
