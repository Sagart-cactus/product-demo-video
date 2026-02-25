---
description: Create a polished product demo video with animated zoom effects using asciinema (terminal) and Playwright (browser).
allowed-tools: Read, Write, Bash, Glob, Grep, mcp__playwright__browser_navigate, mcp__playwright__browser_screenshot, mcp__playwright__browser_click, mcp__playwright__browser_type, mcp__playwright__browser_scroll
---

# /demo-video — Product Demo Video Generator

You are helping the user create a polished product demo video for their software project.
The output is a Remotion composition that plays their recordings with smooth zoom-into-region effects.

The plugin lives at: **{{REMOTION_PLUGIN_DIR}}** (the directory containing this CLAUDE.md).
You will write generated files there AND in the user's target project directory.

---

## STEP 1 — Gather Project Context

The user is running this command from their **target project** directory (not this plugin repo).
Use your tools to understand the target project:

1. Read `README.md`, `docs/`, `CHANGELOG` (whichever exist)
2. Read dependency manifest: `package.json` / `Cargo.toml` / `pyproject.toml` / `go.mod`
3. Use `Glob` to list top-level `src/` or `lib/` structure, then `Read` key entry points
4. Detect project type:
   - **terminal** — CLI tool, daemon, script. Signs: `bin/`, `argv`, no HTML/frontend
   - **browser** — Web app. Signs: `index.html`, `next.config.*`, `vite.config.*`, `app/layout.tsx`
   - **mixed** — Has both a CLI and a web interface

Present a brief summary to the user:
- What the project does
- Key user-facing features you found
- Detected project type

---

## STEP 2 — Feature Selection

Ask the user:
> "Which features should I include in the demo? List them by name, or say 'all' to cover everything I found. Also, what total video length do you prefer? (default: 60–90 seconds)"

Wait for their answer. For each chosen feature, classify it as `terminal`, `browser`, or `split`.

---

## STEP 3 — Generate Storyboard

Create `storyboard.json` in the **target project root** (not the plugin dir). Use this schema:

```json
{
  "projectName": "<name>",
  "projectType": "terminal|browser|mixed",
  "outputFile": "demo.mp4",
  "fps": 30,
  "width": 1920,
  "height": 1080,
  "scenes": [
    {
      "id": "scene-1",
      "title": "Short Feature Name",
      "description": "One sentence: what the viewer sees in this scene",
      "type": "terminal|browser|split",
      "durationInSeconds": 15,
      "recordingFile": "recordings/scene-1.mp4",
      "secondaryRecordingFile": null,
      "zoomKeyframes": [
        {
          "startFrame": 90,
          "endFrame": 210,
          "fromScale": 1.0,
          "toScale": 2.5,
          "region": { "x": 0.05, "y": 0.75, "width": 0.6, "height": 0.18 },
          "label": "Output appears here"
        },
        {
          "startFrame": 210,
          "endFrame": 270,
          "fromScale": 2.5,
          "toScale": 1.0,
          "region": { "x": 0.05, "y": 0.75, "width": 0.6, "height": 0.18 },
          "label": null
        }
      ]
    }
  ]
}
```

**Zoom keyframe guidance:**
- Region values are fractions 0–1 of video dimensions (x=left, y=top, width, height)
- Always pair a zoom-in keyframe with a zoom-out keyframe (same region, scales reversed)
- Zoom-in duration: ~40 frames (≈1.3s). Zoom hold: as long as needed. Zoom-out: ~20 frames
- Good zoom targets: the line being typed in a terminal, a button being clicked, a results panel, a highlighted code block
- Keep `toScale` ≤ 3.0 for terminal (sharp SVG), ≤ 2.5 for browser (pixel-based video)
- `startFrame` / `endFrame` are **absolute** frame numbers from the START of that scene (not the whole video)

Show the storyboard to the user and ask for approval before proceeding. Allow the user to adjust scenes or zoom regions.

---

## STEP 4 — Generate Recording Script

Write `scripts/record-demo.sh` in the **target project root**. Make it executable.

For each scene:

### terminal scenes
```bash
echo "=== Scene N: <title> ==="
echo "Demo: <description>"
echo ""
echo "Instructions:"
echo "  <step-by-step instructions for what to type/run>"
echo ""
echo "Press ENTER to start asciinema recording (CTRL+D to stop)..."
read -r
asciinema rec --overwrite --title "<title>" "$RECORDINGS_DIR/scene-N.cast"
"$PLUGIN_DIR/scripts/convert-cast.sh" "$RECORDINGS_DIR/scene-N.cast" "$RECORDINGS_DIR/scene-N.mp4"
```

### browser scenes
Generate an inline Node.js Playwright script (heredoc) that:
1. Launches Chromium with `recordVideo: { dir: recordingsDir, size: { width: 1920, height: 1080 } }`
2. Performs the specific demo actions for this feature using Playwright API calls
   (goto, click, fill, waitForSelector, waitForTimeout, etc.)
3. Closes context (triggers video save), renames the .webm to `scene-N.webm`
4. Converts with: `ffmpeg -y -i scene-N.webm -c:v libx264 -pix_fmt yuv420p -movflags faststart scene-N.mp4`

The Playwright actions should faithfully reproduce what a user would do to demo this feature.
If you have Playwright MCP available, use it to explore the running app first to get correct selectors.

### split scenes
Run the terminal recording first, then the browser recording.

Set `PLUGIN_DIR` at the top of the script to the absolute path of this plugin repo.
Set `RECORDINGS_DIR` to `$PLUGIN_DIR/public/recordings`.

---

## STEP 5 — Update Remotion Storyboard

Write `src/storyboard.ts` in the **plugin directory** (`{{REMOTION_PLUGIN_DIR}}/src/storyboard.ts`).

This must be valid TypeScript that exports a `Storyboard` typed value.
Use the JSON from STEP 3 as the data, but write it as a TypeScript literal (not JSON syntax).

Example:
```typescript
import type { Storyboard } from "./types";

export const storyboard: Storyboard = {
  projectName: "My CLI Tool",
  projectType: "terminal",
  outputFile: "demo.mp4",
  fps: 30,
  width: 1920,
  height: 1080,
  scenes: [
    {
      id: "scene-1",
      title: "Install & First Run",
      description: "Show npm install and the first hello-world output",
      type: "terminal",
      durationInSeconds: 20,
      recordingFile: "recordings/scene-1.mp4",
      zoomKeyframes: [
        {
          startFrame: 300,
          endFrame: 420,
          fromScale: 1.0,
          toScale: 2.5,
          region: { x: 0.0, y: 0.8, width: 0.7, height: 0.15 },
          label: "Success output",
        },
        {
          startFrame: 420,
          endFrame: 480,
          fromScale: 2.5,
          toScale: 1.0,
          region: { x: 0.0, y: 0.8, width: 0.7, height: 0.15 },
        },
      ],
    },
  ],
};
```

---

## STEP 6 — Guide Execution

Print clear next steps:

```
✓ Storyboard generated: storyboard.json
✓ Recording script:     scripts/record-demo.sh
✓ Remotion updated:     [plugin-dir]/src/storyboard.ts

Next steps:
──────────────────────────────────────────────────────
1. Record your demo:
   chmod +x scripts/record-demo.sh && ./scripts/record-demo.sh

2. Preview the video (live, interactive):
   cd [plugin-dir] && npx remotion studio

3. Render the final video:
   npx remotion render DemoVideo output/demo.mp4

Tips:
  • In Remotion Studio, scrub the timeline to check zoom timing
  • Adjust zoomKeyframes in src/storyboard.ts and the studio hot-reloads
  • Re-run ./scripts/record-demo.sh to re-record any scene
──────────────────────────────────────────────────────
```

---

## Notes on Playwright MCP

If the project has a running web server (detected via `package.json` start scripts, a running
process on localhost, or the user mentions it), offer to use Playwright MCP to:
- Navigate the app and take screenshots to verify selectors before generating the script
- Help identify the exact CSS selectors / URLs needed for the Playwright recording script

---

## Quality Checklist

Before finishing, verify the generated storyboard:
- [ ] Each scene has at least one zoom-in + zoom-out pair (unless it's very short)
- [ ] Zoom regions are within bounds (all values 0–1)
- [ ] `endFrame` of zoom-out ≤ `durationInSeconds × fps` for that scene
- [ ] `recordingFile` paths match what `record-demo.sh` actually saves
- [ ] `totalDuration` = sum of all scene durations (minus 20×(scenes-1) for crossfades) ≤ user's requested length
