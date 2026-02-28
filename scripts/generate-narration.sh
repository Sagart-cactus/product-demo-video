#!/usr/bin/env bash
# scripts/generate-narration.sh
#
# Generates a single narration MP3 from text.
# Uses macOS 'say' by default; falls back to OpenAI TTS or ElevenLabs if
# the corresponding API key is set.
#
# Usage:
#   ./scripts/generate-narration.sh "Text to narrate" output.mp3
#
# Environment variables:
#   OPENAI_API_KEY      — Use OpenAI TTS (tts-1, voice: alloy)
#   ELEVENLABS_API_KEY  — Use ElevenLabs TTS (Rachel voice)
#   (neither set)       — Use macOS 'say' + ffmpeg (no API key required)

set -euo pipefail

TEXT="${1:-}"
OUTPUT="${2:-}"

if [[ -z "$TEXT" || -z "$OUTPUT" ]]; then
  echo "Usage: $0 \"<text to narrate>\" <output.mp3>" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT")"

if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  echo "Using OpenAI TTS..."
  # Escape text for JSON
  ESCAPED=$(python3 -c "import json, sys; print(json.dumps(sys.argv[1]))" "$TEXT")
  curl -s -X POST "https://api.openai.com/v1/audio/speech" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"tts-1\",\"input\":${ESCAPED},\"voice\":\"alloy\"}" \
    -o "$OUTPUT"

elif [[ -n "${ELEVENLABS_API_KEY:-}" ]]; then
  echo "Using ElevenLabs TTS..."
  ESCAPED=$(python3 -c "import json, sys; print(json.dumps(sys.argv[1]))" "$TEXT")
  curl -s -X POST "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM" \
    -H "xi-api-key: $ELEVENLABS_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"text\":${ESCAPED},\"model_id\":\"eleven_monolingual_v1\"}" \
    -o "$OUTPUT"

else
  echo "Using macOS 'say' (set OPENAI_API_KEY or ELEVENLABS_API_KEY for cloud TTS)..."
  if ! command -v say &>/dev/null; then
    echo "Error: 'say' not found. Install on macOS or set OPENAI_API_KEY." >&2
    exit 1
  fi
  if ! command -v ffmpeg &>/dev/null; then
    echo "Error: 'ffmpeg' not found. Install with: brew install ffmpeg" >&2
    exit 1
  fi
  TMP_AIFF="$(mktemp /tmp/narration-XXXXXX.aiff)"
  trap 'rm -f "$TMP_AIFF"' EXIT
  say -v Samantha -r 175 -o "$TMP_AIFF" "$TEXT"
  ffmpeg -y -i "$TMP_AIFF" -codec:a libmp3lame -q:a 2 "$OUTPUT" 2>/dev/null
fi

echo "✓ Generated: $OUTPUT"
