/**
 * A rectangular region of the video frame to zoom into.
 * All values are fractions of video dimensions (0–1).
 */
export interface ZoomRegion {
  x: number;      // left edge as fraction of video width
  y: number;      // top edge as fraction of video height
  width: number;  // region width as fraction of video width
  height: number; // region height as fraction of video height
}

/**
 * Defines a zoom-in or zoom-out animation over a frame range.
 * Use fromScale=1 → toScale>1 to zoom in, and reverse to zoom out.
 */
export interface ZoomKeyframe {
  startFrame: number;
  endFrame: number;
  fromScale: number;
  toScale: number;
  region: ZoomRegion;   // center of this region becomes the transformOrigin
  label?: string;       // optional callout text shown during zoom
}

export type SceneType = "intro" | "feature" | "code" | "screenshot" | "comparison" | "outro";

export interface Scene {
  id: string;
  type: SceneType;
  title: string;
  durationInSeconds: number;

  // Narration: text for TTS generation + on-screen captions
  narration?: string;
  narrationAudioFile?: string;  // path relative to public/ — set after TTS generation

  // Zoom (reused from existing ZoomKeyframe/ZoomRegion — unchanged)
  zoomKeyframes: ZoomKeyframe[];

  // Type-specific content (only the relevant block is populated per type)
  introContent?: {
    projectName: string;
    tagline: string;
    badge?: string;               // e.g. "Open Source", "v2.0"
    accentColor?: string;
  };

  featureContent?: {
    featureTitle: string;
    bullets: string[];            // animated bullet points (revealed one at a time)
    icon?: string;                // emoji or single character used as visual anchor
    layout?: "centered" | "left"; // default: "centered"
  };

  codeContent?: {
    code: string;
    language: string;             // e.g. "typescript", "python", "bash"
    filename?: string;            // shown as tab label
    highlightLines?: number[];    // lines to highlight in yellow
    revealByLine?: boolean;       // animate line-by-line reveal (default: false)
  };

  screenshotContent?: {
    imageFile: string;            // path relative to public/
    caption?: string;             // shown below the image
    backgroundColor?: string;
  };

  comparisonContent?: {
    leftLabel: string;
    leftContent: string;          // code or text shown on left pane
    rightLabel: string;
    rightContent: string;         // code or text shown on right pane
    language?: string;
  };

  outroContent?: {
    headline: string;
    cta?: string;                 // e.g. "Try it now"
    links?: { label: string; url: string }[];
    accentColor?: string;
  };
}

export interface Storyboard {
  projectName: string;
  projectType: string;            // free-form archetype e.g. "api-library", "saas-app"
  outputFile: string;
  fps: number;
  width: number;
  height: number;
  theme: {
    accentColor: string;          // brand color (default: "#6366f1")
    backgroundColor: string;      // default: "#0f0f0f"
    fontFamily?: string;          // default: "system-ui, sans-serif"
  };
  scenes: Scene[];
}
