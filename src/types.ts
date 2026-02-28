export type SceneType = "intro" | "feature" | "workflow" | "code" | "screenshot" | "comparison" | "outro";

export interface Scene {
  id: string;
  type: SceneType;
  title: string;
  durationInSeconds: number;

  // Narration: text for TTS generation + on-screen captions
  narration?: string;
  narrationAudioFile?: string;  // path relative to public/ — set after TTS generation

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

  workflowContent?: {
    headline: string;
    subheadline?: string;
    steps: string[];
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
