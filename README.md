# product-demo-video

A **Claude Code plugin** that turns any software project into a polished product demo video
— fully programmatic, no screen recording required.

Type `/demo-video` from any project and Claude will analyze your code, ask which features to
showcase, write a storyboard, generate TTS narration, and render everything as a 1080p video
using [Remotion](https://www.remotion.dev).

---

## How it works

```
/demo-video (Claude Code)
      │
      ├─ 1. Reads your project (README, source, deps)
      ├─ 2. Asks: features, length, tone, brand color
      ├─ 3. Designs storyboard (intro → features → code → outro)
      ├─ 4. Generates scripts/generate-narration.sh → public/narration/*.mp3
      ├─ 5. Writes src/storyboard.ts (all scene content + animations)
      └─ 6. Guide: npx remotion studio → npx remotion render
```

The render pipeline:

```
src/storyboard.ts  (React scene data)
      │
      └─ Remotion (React components)
            ├─ IntroScene / FeatureScene / CodeScene / ...
            ├─ WorkflowScene (animated process map)
            ├─ CaptionOverlay (narration subtitles)
            └─ Audio (TTS narration MP3s)
                     │
                     ▼
              output/demo.mp4  (1920×1080 @ 30fps)
```

---

## Installation

### Option 1 — Marketplace (recommended)

```bash
claude plugin marketplace add https://github.com/Sagart-cactus/product-demo-video
claude plugin install demo-video@sagart-devtools
```

Then install npm dependencies in the plugin directory:

```bash
cd "$(claude plugin path demo-video@sagart-devtools)"
npm install
```

### Option 2 — Local clone

```bash
git clone https://github.com/Sagart-cactus/product-demo-video
cd product-demo-video
npm install
claude plugin marketplace add .
claude plugin install demo-video@sagart-devtools
```

Verify with `claude plugin list` — you should see `demo-video@sagart-devtools` enabled.

---

## Usage

### 1. Run the slash command

From your **target project** directory in Claude Code:

```
/demo-video
```

Claude walks you through 6 steps:

| Step | What happens |
|------|-------------|
| **1. Scan** | Claude reads your README, dependencies, and source tree |
| **2. Q&A** | Claude asks: features to demo, video length, tone, brand color |
| **3. Storyboard** | Claude designs scenes with narration text — shows you for approval |
| **4. Narration** | Claude generates `scripts/generate-narration.sh` and runs it |
| **5. Write storyboard** | Claude writes `src/storyboard.ts` with full scene content |
| **6. Guide** | Claude prints the exact commands to preview and render |

### 2. Preview in Remotion Studio

```bash
cd /path/to/product-demo-video
npx remotion studio
```

Open [http://localhost:3000](http://localhost:3000) to scrub through the video, check timing,
and tweak content. The studio **hot-reloads** whenever you edit `src/storyboard.ts`.

### 3. Render the final video

```bash
npx remotion render DemoVideo output/demo.mp4
```

Output: `output/demo.mp4` at 1920×1080, 30fps.

---

## Scene types

### `intro` — Animated project title

```typescript
{
  type: "intro",
  durationInSeconds: 8,
  introContent: {
    projectName: "MyLib",
    tagline: "Real-time sync for every JavaScript app",
    badge: "v2.0",          // optional pill label
    accentColor: "#6366f1",
  },
}
```

### `feature` — Bullet-point feature highlight

```typescript
{
  type: "feature",
  durationInSeconds: 10,
  featureContent: {
    featureTitle: "Real-time Events",
    bullets: ["Sub-millisecond delivery", "Auto-reconnect", "Presence tracking"],
    icon: "⚡",
    layout: "centered",    // or "left"
  },
}
```

### `workflow` — Animated process flow

```typescript
{
  type: "workflow",
  durationInSeconds: 12,
  workflowContent: {
    headline: "Six-step AI workflow",
    subheadline: "From scan to final render",
    steps: [
      "Scan project",
      "Ask key questions",
      "Design storyboard",
      "Generate narration",
      "Write storyboard.ts",
      "Preview and render",
    ],
  },
}
```

### `code` — Syntax-highlighted code snippet

```typescript
{
  type: "code",
  durationInSeconds: 12,
  codeContent: {
    code: `import { connect } from 'mylib';\nconst ch = connect({ apiKey: KEY });`,
    language: "typescript",    // typescript, python, bash, yaml, json, javascript
    filename: "example.ts",    // shown as tab label
    highlightLines: [2],       // 1-indexed lines to highlight
    revealByLine: true,        // animate line-by-line
  },
}
```

### `screenshot` — UI screenshot

```typescript
{
  type: "screenshot",
  durationInSeconds: 8,
  screenshotContent: {
    imageFile: "screenshots/dashboard.png",  // relative to public/
    caption: "The analytics dashboard",
  },
}
```

### `comparison` — Side-by-side before/after

```typescript
{
  type: "comparison",
  durationInSeconds: 12,
  comparisonContent: {
    leftLabel: "Without MyLib",
    leftContent: "// 50 lines of WebSocket boilerplate...",
    rightLabel: "With MyLib",
    rightContent: "const ch = connect({ apiKey: KEY });",
    language: "javascript",
  },
}
```

### `outro` — CTA + links

```typescript
{
  type: "outro",
  durationInSeconds: 7,
  outroContent: {
    headline: "Start building today",
    cta: "Get started free",
    links: [{ label: "mylib.dev", url: "https://mylib.dev" }],
    accentColor: "#6366f1",
  },
}
```

---

## TTS narration

Each scene can have a `narration` string and a `narrationAudioFile` pointing to an MP3 in
`public/narration/`. The `/demo-video` command generates both automatically.

```bash
# Regenerate after editing narration text:
./scripts/generate-narration.sh
```

**Voice options:**

| Setup | Voice quality |
|-------|--------------|
| macOS `say` + `ffmpeg` | Good (free, built-in Samantha voice) |
| `OPENAI_API_KEY` set | Very good (OpenAI TTS, Alloy voice) |
| `ELEVENLABS_API_KEY` set | Excellent (ElevenLabs, Rachel voice) |

---

## File reference

| File | Purpose |
|------|---------|
| `.claude/commands/demo-video.md` | The `/demo-video` slash command |
| `src/storyboard.ts` | Generated scene data — edit to tweak content and timing |
| `src/types.ts` | TypeScript interfaces for `Storyboard` and `Scene` |
| `src/DemoVideo.tsx` | Sequences scenes with `<TransitionSeries>` + fade crossfades |
| `src/Root.tsx` | Registers the Remotion composition |
| `src/components/IntroScene.tsx` | Animated title + tagline |
| `src/components/FeatureScene.tsx` | Feature title + animated bullets |
| `src/components/WorkflowScene.tsx` | Animated process flow scene |
| `src/components/CodeScene.tsx` | Prism.js syntax highlighting |
| `src/components/ScreenshotScene.tsx` | Image display with caption |
| `src/components/ComparisonScene.tsx` | Side-by-side panels |
| `src/components/OutroScene.tsx` | CTA + links |
| `src/components/CaptionOverlay.tsx` | Narration subtitle overlay |
| `src/components/TitleCard.tsx` | Optional scene title overlay (available for custom use) |
| `scripts/generate-narration.sh` | TTS audio generator |
| `public/narration/` | Generated MP3 narration files |

---

## Manual storyboard editing

You don't need to re-run `/demo-video` to tweak content. Edit `src/storyboard.ts` directly
and Remotion Studio hot-reloads instantly.

```typescript
// Extend a scene
durationInSeconds: 14,   // was 10

// Change accent color across all scenes
theme: { accentColor: "#ec4899", backgroundColor: "#0f0f0f" },

// Add a new scene
{
  id: "scene-new",
  type: "screenshot",
  title: "Dashboard",
  durationInSeconds: 8,
  screenshotContent: {
    imageFile: "screenshots/dashboard.png",
    caption: "Live analytics at a glance",
  },
}
```

---

## Dependencies

### npm (for rendering)

| Package | Purpose |
|---------|---------|
| `remotion` | Video composition framework |
| `@remotion/cli` | `remotion studio` and `remotion render` |
| `@remotion/transitions` | `TransitionSeries`, crossfade transitions |
| `prismjs` | Syntax highlighting for `CodeScene` and `ComparisonScene` |

### System (for narration, one of)

| Tool | Install |
|------|---------|
| `ffmpeg` | `brew install ffmpeg` (required for macOS `say` pipeline) |
| OpenAI TTS | Set `OPENAI_API_KEY` |
| ElevenLabs | Set `ELEVENLABS_API_KEY` |

---

## License

MIT © Sagar Trivedi
