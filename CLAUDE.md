# product-demo-video

A Remotion video project and **Claude Code plugin** for creating polished product demo videos with smooth zoom-into-region effects.

## What this plugin does

When you type `/demo-video` from any project in Claude Code, Claude will:
1. Analyze your project (README, source code, tech stack)
2. Ask which features to demo
3. Generate a scene-by-scene storyboard with zoom annotations
4. Generate a recording script (`scripts/record-demo.sh`) that uses:
   - **asciinema** → for terminal/CLI features
   - **Playwright** → for browser/web app features
5. Update this Remotion composition with your storyboard
6. Guide you through recording and rendering the final video

## Quick Start (after `/demo-video` has been run)

```bash
# 1. Record your demo scenes
chmod +x scripts/record-demo.sh && ./scripts/record-demo.sh

# 2. Preview in Remotion Studio (hot-reloads storyboard edits)
npx remotion studio

# 3. Render final video
npx remotion render DemoVideo output/demo.mp4
```

## Key Files

| File | Purpose |
|------|---------|
| `src/storyboard.ts` | **Your demo data** — scenes, zoom keyframes. Edit this to tweak timing. |
| `src/components/ZoomContainer.tsx` | Core zoom engine — `transformOrigin` + Bezier-eased `scale()` |
| `src/components/TerminalScene.tsx` | Renders asciinema `.cast` files synced to Remotion's frame clock |
| `src/components/BrowserScene.tsx` | Renders Playwright `.mp4` screen recordings |
| `src/components/SplitScene.tsx` | Side-by-side terminal + browser layout |
| `scripts/convert-cast.sh` | Converts asciinema `.cast` → `.mp4` via `agg` + `ffmpeg` |

## Zoom Effect

The `ZoomContainer` component zooms into any rectangular region of the frame:

```typescript
zoomKeyframes: [
  {
    startFrame: 90,   // absolute frame within this scene
    endFrame: 210,
    fromScale: 1.0,
    toScale: 2.5,
    region: { x: 0.05, y: 0.75, width: 0.6, height: 0.18 }, // fractions 0–1
    label: "Result appears here",
  },
  // Always add a matching zoom-out:
  { startFrame: 210, endFrame: 270, fromScale: 2.5, toScale: 1.0,
    region: { x: 0.05, y: 0.75, width: 0.6, height: 0.18 } },
]
```

`transformOrigin` is set to the **center** of the region automatically, so CSS scale zooms directly toward the area of interest with no translate math needed.

## Plugin Installation in Other Projects

Add this to the target project's `CLAUDE.md` (or tell Claude the path):
```
The product-demo-video plugin is at: /path/to/remotion-demo-video
```

Or install globally by symlinking `.claude/commands/demo-video.md` to `~/.claude/commands/`.

## Dependencies

For rendering:
- Node.js ≥ 18
- `npm install` in this directory

For recording:
- `asciinema` — `brew install asciinema`
- `agg` — `cargo install --git https://github.com/asciinema/agg`
- `ffmpeg` — `brew install ffmpeg`
- `playwright` — `npx playwright install chromium`
