#!/usr/bin/env bash
# convert-cast.sh — Convert an asciinema .cast file to .mp4
#
# Usage:
#   ./scripts/convert-cast.sh <input.cast> <output.mp4>
#
# Requirements:
#   agg    — cargo install --git https://github.com/asciinema/agg
#   ffmpeg — brew install ffmpeg / apt install ffmpeg
#
# agg renders the cast to a GIF with full terminal font rendering (SVG-quality),
# then ffmpeg converts the GIF to a compressed MP4 for use in Remotion.

set -euo pipefail

CAST="${1:-}"
OUT="${2:-}"

if [[ -z "$CAST" || -z "$OUT" ]]; then
  echo "Usage: $0 <input.cast> <output.mp4>" >&2
  exit 1
fi

if [[ ! -f "$CAST" ]]; then
  echo "Error: cast file not found: $CAST" >&2
  exit 1
fi

TMP="${OUT%.mp4}.tmp.$$.gif"

# Check dependencies
command -v agg >/dev/null 2>&1 || {
  echo "Error: 'agg' not found. Install with:" >&2
  echo "  cargo install --git https://github.com/asciinema/agg" >&2
  exit 1
}
command -v ffmpeg >/dev/null 2>&1 || {
  echo "Error: 'ffmpeg' not found. Install with: brew install ffmpeg / apt install ffmpeg" >&2
  exit 1
}

echo "→ Rendering cast to GIF: $CAST"
agg \
  --cols 120 \
  --rows 30 \
  --font-size 16 \
  --speed 1.0 \
  "$CAST" "$TMP"

echo "→ Converting GIF to MP4: $OUT"
ffmpeg -y \
  -i "$TMP" \
  -movflags faststart \
  -pix_fmt yuv420p \
  -vf "fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2" \
  -c:v libx264 \
  -crf 18 \
  "$OUT"

rm -f "$TMP"
echo "✓ Done: $OUT"
