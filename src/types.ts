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

export type SceneType = "terminal" | "browser" | "split";

export interface Scene {
  id: string;
  title: string;
  description?: string;
  type: SceneType;
  durationInSeconds: number;

  /**
   * Path relative to the `public/` directory.
   * terminal: .cast file (asciinema) or .mp4 (converted via agg)
   * browser:  .webm or .mp4 (recorded by Playwright)
   * split:    recordingFile = terminal side, secondaryRecordingFile = browser side
   */
  recordingFile: string;
  secondaryRecordingFile?: string;

  zoomKeyframes: ZoomKeyframe[];
}

export interface Storyboard {
  projectName: string;
  projectType: "terminal" | "browser" | "mixed";
  outputFile: string;
  fps: number;
  width: number;
  height: number;
  scenes: Scene[];
}
