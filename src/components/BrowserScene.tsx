import React from "react";
import { OffthreadVideo, staticFile } from "remotion";
import type { Scene } from "../types";
import { ZoomContainer } from "./ZoomContainer";

/**
 * Renders a browser/screen recording captured by Playwright.
 *
 * Playwright records as .webm — convert to .mp4 with:
 *   ffmpeg -i recording.webm -c:v libx264 -pix_fmt yuv420p recording.mp4
 *
 * The recording file should be placed in public/recordings/ and the
 * `recordingFile` field should be the path relative to public/.
 *
 * Uses <OffthreadVideo> (recommended over <Video> for rendering) so that
 * each frame is extracted at the correct timestamp regardless of playback rate.
 *
 * Keep zoom scale ≤ 2.5x to avoid noticeable pixel softening in MP4 recordings.
 */
export const BrowserScene: React.FC<{ scene: Scene }> = ({ scene }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      backgroundColor: "#f0f0f0",
    }}
  >
    <ZoomContainer zoomKeyframes={scene.zoomKeyframes}>
      <OffthreadVideo
        src={staticFile(scene.recordingFile)}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </ZoomContainer>
  </div>
);
