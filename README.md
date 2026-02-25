# product-demo-video

A **Claude Code plugin** that turns any software project into a polished product demo video — automatically.

Type `/demo-video` from any project and Claude will analyze your code, ask which features to showcase, plan a storyboard, record the demo (using **asciinema** for terminal tools and **Playwright** for web apps), and composite everything into a 1080p video with smooth **zoom-into-region** effects using [Remotion](https://www.remotion.dev).

---

## How it works

```
/demo-video (Claude Code)
      │
      ├─ 1. Reads your project (README, source, deps)
      ├─ 2. Asks which features to demo
      ├─ 3. Generates storyboard.json  ──► scene list + zoom annotations
      ├─ 4. Generates scripts/record-demo.sh
      │        ├─ terminal features → asciinema rec + agg → .mp4
      │        └─ browser features  → Playwright + ffmpeg  → .mp4
      ├─ 5. Updates src/storyboard.ts in this repo
      └─ 6. Guides you through recording + rendering
```

The final render pipeline:

```
recordings/*.mp4
      │
      └─ Remotion (React)
            ├─ ZoomContainer (transformOrigin + CSS scale)
            ├─ Scene sequencing with crossfade transitions
            └─ TitleCard overlays
                     │
                     ▼
              output/demo.mp4  (1920×1080 @ 30fps)
```

---

## Installation

### Option A — Per-project (recommended)

Add one line to your project's `CLAUDE.md`:

```markdown
The product-demo-video plugin is at: /path/to/product-demo-video
```

Claude Code will pick up the `/demo-video` slash command automatically when you work in that project.

### Option B — Global (available in every project)

Symlink the slash command into your global Claude commands directory:

```bash
mkdir -p ~/.claude/commands
ln -s /path/to/product-demo-video/.claude/commands/demo-video.md \
      ~/.claude/commands/demo-video.md
```

### Setup this repo

```bash
git clone https://github.com/Sagart-cactus/remotion-demo-video
cd remotion-demo-video
npm install
```

---

## Usage

### 1. Run the slash command

From your **target project** directory in Claude Code:

```
/demo-video
```

Claude will walk you through 6 steps interactively:

| Step | What happens |
|------|-------------|
| **1. Context** | Claude reads your README, `package.json`/`Cargo.toml`/etc., and scans your source tree to understand the project |
| **2. Features** | Claude summarizes what it found and asks which features to include in the demo |
| **3. Storyboard** | Claude generates `storyboard.json` with scenes, durations, and zoom annotations — shows it to you for approval |
| **4. Record script** | Claude writes `scripts/record-demo.sh` tailored to your features (asciinema for CLI, Playwright for browser) |
| **5. Remotion update** | Claude writes `src/storyboard.ts` in this repo so Remotion knows what to render |
| **6. Guide** | Claude prints the exact commands to run to record and render |

### 2. Record your demo

```bash
chmod +x scripts/record-demo.sh && ./scripts/record-demo.sh
```

Follow the prompts for each scene. The script handles everything: starting recordings, stopping them, and converting to the formats Remotion needs.

### 3. Preview in Remotion Studio

```bash
cd /path/to/product-demo-video
npx remotion studio
```

Open [http://localhost:3000](http://localhost:3000) to scrub through the video, check zoom timing, and tweak keyframes. The studio **hot-reloads** whenever you edit `src/storyboard.ts`.

### 4. Render the final video

```bash
npx remotion render DemoVideo output/demo.mp4
```

Output: `output/demo.mp4` at 1920×1080, 30fps.

---

## Zoom effect

The core of this plugin is the `ZoomContainer` component, which zooms the camera into any rectangular region of the frame using CSS `transform: scale()` with `transformOrigin` set to the center of the target region.

### How it works

```
transformOrigin = center of region (as % strings)
scale           = animated with Bezier easing
```

When CSS scales an element around a specific origin point, the content grows outward from that point — no translate math required. This makes the animation extremely simple to define: just specify **where** to zoom and **how much**.

```
Zoom in:  Easing.bezier(0.4, 0, 0.2, 1)  ← Material standard curve
Zoom out: Easing.bezier(0.0, 0, 0.2, 1)  ← Decelerate curve
```

### Defining a zoom region

In `src/storyboard.ts`, each scene has a `zoomKeyframes` array. Regions use **fractions 0–1** of the video dimensions, so they work at any resolution.

```typescript
zoomKeyframes: [
  // Zoom IN to the bottom-left output area
  {
    startFrame: 90,   // frame within this scene (not the whole video)
    endFrame: 210,    // ~40 frames = 1.3 sec zoom-in
    fromScale: 1.0,
    toScale: 2.5,
    region: {
      x: 0.02,         // 2% from left edge
      y: 0.75,         // 75% from top
      width: 0.55,     // 55% of video width
      height: 0.20,    // 20% of video height
    },
    label: "Result appears here",   // optional callout text
  },
  // Always pair with a zoom OUT (same region, reversed scales)
  {
    startFrame: 210,
    endFrame: 260,    // ~17 frames = 0.6 sec zoom-out
    fromScale: 2.5,
    toScale: 1.0,
    region: { x: 0.02, y: 0.75, width: 0.55, height: 0.20 },
  },
],
```

**Scale guidelines:**
- Terminal scenes (SVG-based): `toScale` up to **3.0** — stays sharp at any zoom
- Browser recordings (pixel video): `toScale` up to **2.5** — higher values soften

### Visualizing your region

```
┌────────────────────────────────────────────────┐
│ x=0                                        x=1 │
│                                                 │
│  y=0.75 ┌──────────────────────────────────┐   │
│          │  region to zoom into             │   │
│  y=0.95  └──────────────────────────────────┘   │
│                                                 │
└────────────────────────────────────────────────┘
  region: { x: 0.02, y: 0.75, width: 0.55, height: 0.20 }
```

---

## Storyboard reference

The storyboard is the single source of truth for the video. Claude generates it, but you can edit `src/storyboard.ts` directly to tweak timing without re-recording.

### Full schema

```typescript
interface Storyboard {
  projectName: string;
  projectType: "terminal" | "browser" | "mixed";
  outputFile: string;       // e.g. "demo.mp4"
  fps: number;              // 30 recommended
  width: number;            // 1920
  height: number;           // 1080
  scenes: Scene[];
}

interface Scene {
  id: string;               // unique identifier, e.g. "scene-1"
  title: string;            // shown in TitleCard overlay
  description?: string;     // shown as subtitle in TitleCard
  type: "terminal" | "browser" | "split";
  durationInSeconds: number;
  recordingFile: string;    // relative to public/, e.g. "recordings/scene-1.mp4"
  secondaryRecordingFile?:  // split scenes only — right pane (browser)
    string;
  zoomKeyframes: ZoomKeyframe[];
}

interface ZoomKeyframe {
  startFrame: number;       // absolute frame within this scene
  endFrame: number;
  fromScale: number;        // starting scale (1.0 = full frame)
  toScale: number;          // ending scale
  region: {
    x: number;              // left edge, fraction of video width  (0–1)
    y: number;              // top edge,  fraction of video height (0–1)
    width: number;          // fraction of video width
    height: number;         // fraction of video height
  };
  label?: string;           // callout text shown during the zoom
}
```

---

## Recording pipeline

### Terminal scenes → asciinema

The generated `record-demo.sh` uses [`asciinema`](https://asciinema.org) to capture terminal sessions, then [`agg`](https://github.com/asciinema/agg) to render the `.cast` file to a GIF, and `ffmpeg` to convert the GIF to an MP4.

```
asciinema rec session.cast
      │
      └─ scripts/convert-cast.sh session.cast output.mp4
              │
              ├─ agg --cols 120 --rows 30 session.cast tmp.gif
              └─ ffmpeg -i tmp.gif -c:v libx264 -crf 18 output.mp4
```

`agg` renders with full font rendering (monospace, correct colors) so the terminal stays sharp even at 3× zoom. The `.cast` file is also preserved in `public/recordings/` for playback directly in `TerminalScene` (which uses `asciinema-player` synchronized to Remotion's frame clock).

### Browser scenes → Playwright

The generated `record-demo.sh` includes an inline Node.js script that:

1. Launches Chromium at 1920×1080 with `recordVideo` enabled
2. Performs the demo actions (navigations, clicks, form fills)
3. Closes the browser context (triggers the `.webm` save)
4. Converts the `.webm` to `.mp4` with `ffmpeg`

If **Playwright MCP** is available in your Claude Code session, Claude will use it to explore your running app and generate selectors automatically before writing the script.

### Split scenes

Side-by-side layout: terminal on the left, browser on the right. Both recordings are captured in the same script. `ZoomContainer` wraps the entire frame, so zoom regions span both panes.

---

## File reference

| File | Purpose |
|------|---------|
| `.claude/commands/demo-video.md` | The `/demo-video` slash command definition |
| `src/storyboard.ts` | **Your demo data** — generated by Claude, tweak here to adjust timing |
| `src/types.ts` | TypeScript interfaces: `Storyboard`, `Scene`, `ZoomKeyframe`, `ZoomRegion` |
| `src/components/ZoomContainer.tsx` | Core zoom engine: `transformOrigin` + Bezier-eased `scale()` |
| `src/components/TerminalScene.tsx` | Renders asciinema `.cast` synced to Remotion's frame clock |
| `src/components/BrowserScene.tsx` | Renders Playwright `.mp4` via `<OffthreadVideo>` |
| `src/components/SplitScene.tsx` | Side-by-side terminal + browser layout |
| `src/components/TitleCard.tsx` | Fade-in/out scene title overlay |
| `src/DemoVideo.tsx` | Sequences scenes with `<TransitionSeries>` + `fade()` crossfades |
| `src/Root.tsx` | Registers the `DemoVideo` Remotion composition |
| `scripts/convert-cast.sh` | Converts `.cast` → `.mp4` via `agg` + `ffmpeg` |
| `scripts/record-demo.sh.template` | Template for the per-project recording script |
| `public/recordings/` | Where recordings land (gitignored) |

---

## Manual storyboard editing

You don't need to re-run `/demo-video` to tweak timing. Edit `src/storyboard.ts` directly and Remotion Studio hot-reloads instantly.

**Common edits:**

```typescript
// Make a scene longer
durationInSeconds: 25,   // was 20

// Move a zoom earlier
startFrame: 60,   // was 90
endFrame: 180,    // was 210

// Adjust zoom intensity
toScale: 2.0,     // was 2.5 — slightly less aggressive

// Shift the region down
region: { x: 0.02, y: 0.80, width: 0.55, height: 0.15 }
//                     ↑ was 0.75
```

**Tips for zoom timing:**
- Scrub in Remotion Studio (`npx remotion studio`) to see the exact frame where content appears
- Use the frame counter in the Studio timeline to get precise `startFrame`/`endFrame` values
- A zoom-in of 30–45 frames (1–1.5 sec) feels natural; shorter feels abrupt
- Always end with a zoom-out before the scene ends so the next scene starts at full scale

---

## Dependencies

### For rendering (npm)

| Package | Purpose |
|---------|---------|
| `remotion` | Video composition framework |
| `@remotion/cli` | `remotion studio` and `remotion render` commands |
| `@remotion/transitions` | `TransitionSeries`, `linearTiming` |
| `@remotion/transitions/fade` | Crossfade presentation |
| `asciinema-player` | In-browser asciinema playback synced to Remotion |

### For recording (system tools)

| Tool | Install | Purpose |
|------|---------|---------|
| `asciinema` | `brew install asciinema` | Terminal session recorder |
| `agg` | `cargo install --git https://github.com/asciinema/agg` | `.cast` → GIF renderer |
| `ffmpeg` | `brew install ffmpeg` / `apt install ffmpeg` | Video conversion |
| `playwright` | `npx playwright install chromium` | Browser recording |
| Node.js ≥ 18 | [nodejs.org](https://nodejs.org) | Required by Remotion and Playwright |

---

## Project structure

```
product-demo-video/
├── .claude/
│   └── commands/
│       └── demo-video.md        # /demo-video slash command
├── src/
│   ├── index.ts                 # registerRoot entry point
│   ├── Root.tsx                 # Remotion composition registry
│   ├── DemoVideo.tsx            # Main composition (sequences scenes)
│   ├── storyboard.ts            # ← Generated by /demo-video (edit to tweak)
│   ├── types.ts                 # TypeScript type definitions
│   └── components/
│       ├── ZoomContainer.tsx    # Core zoom engine
│       ├── TerminalScene.tsx    # asciinema player
│       ├── BrowserScene.tsx     # Playwright recording player
│       ├── SplitScene.tsx       # Side-by-side layout
│       └── TitleCard.tsx        # Scene title overlay
├── scripts/
│   ├── convert-cast.sh          # .cast → .mp4 conversion
│   └── record-demo.sh.template  # Template for generated recording scripts
├── public/
│   └── recordings/              # Recordings land here (gitignored)
├── CLAUDE.md                    # Project context for Claude Code
├── remotion.config.ts
├── tsconfig.json
└── package.json
```

---

## License

MIT © Sagar Trivedi
