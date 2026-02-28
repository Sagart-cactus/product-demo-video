# product-demo-video

A Remotion video project and **Claude Code plugin** for creating polished product demo videos
— fully programmatic, no recordings required.

## What this plugin does

When you type `/demo-video` from any project in Claude Code, Claude will:
1. Analyze your project (README, source code, tech stack)
2. Ask which features to demo, preferred length, tone, and brand color
3. Design a scene-by-scene storyboard with animated React scenes
4. Generate TTS narration (`scripts/generate-narration.sh`) using macOS `say` or cloud APIs
5. Write `src/storyboard.ts` with all scene content, animations, and narration references
6. Guide you to preview and render with Remotion

No asciinema, no Playwright, no screen recording required.

## Quick Start (after `/demo-video` has been run)

```bash
# 1. Preview in Remotion Studio (hot-reloads on storyboard edits)
cd /path/to/product-demo-video
npx remotion studio

# 2. Render final video
npx remotion render DemoVideo output/demo.mp4
```

## Scene Types

| Type | Purpose |
|------|---------|
| `intro` | Animated project name + tagline + optional badge |
| `feature` | Feature title + animated bullet points (revealed one at a time) |
| `workflow` | Animated multi-step process map |
| `code` | Syntax-highlighted code with optional line-by-line reveal |
| `screenshot` | Static image with optional caption |
| `comparison` | Side-by-side before/after panels |
| `outro` | CTA + links with branded styling |

## Key Files

| File | Purpose |
|------|---------|
| `src/storyboard.ts` | **Your demo data** — scenes, content, narration references. Edit to tweak. |
| `src/types.ts` | TypeScript interfaces: `Storyboard`, `Scene` |
| `src/components/IntroScene.tsx` | Animated title + tagline |
| `src/components/FeatureScene.tsx` | Feature title + bullet points |
| `src/components/WorkflowScene.tsx` | Animated process flow scene |
| `src/components/CodeScene.tsx` | Prism.js syntax highlighting |
| `src/components/ScreenshotScene.tsx` | Image display |
| `src/components/ComparisonScene.tsx` | Side-by-side comparison |
| `src/components/OutroScene.tsx` | CTA + links |
| `src/components/CaptionOverlay.tsx` | Narration subtitles at bottom of frame |
| `scripts/generate-narration.sh` | TTS generator (macOS `say` / OpenAI / ElevenLabs) |

## TTS Narration

```bash
# macOS (no API key needed)
./scripts/generate-narration.sh

# Higher quality: set env var before running
OPENAI_API_KEY=sk-... ./scripts/generate-narration.sh
ELEVENLABS_API_KEY=... ./scripts/generate-narration.sh
```

Narration MP3s land in `public/narration/` and are auto-referenced in the storyboard.

## Plugin Installation in Other Projects

Add to the target project's `CLAUDE.md`:
```
The product-demo-video plugin is at: /path/to/product-demo-video
```

Or install globally:
```bash
ln -s /path/to/product-demo-video/.claude/commands/demo-video.md ~/.claude/commands/
```

## Dependencies

For rendering:
- Node.js ≥ 18
- `npm install` in this directory

For narration (one of):
- macOS `say` + `ffmpeg` — `brew install ffmpeg`
- `OPENAI_API_KEY` set — uses OpenAI TTS
- `ELEVENLABS_API_KEY` set — uses ElevenLabs TTS
