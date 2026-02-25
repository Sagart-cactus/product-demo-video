import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "../types";
import { ZoomContainer } from "./ZoomContainer";

/**
 * Renders an asciinema `.cast` recording synced to Remotion's frame clock.
 *
 * The asciinema-player is mounted once via a useEffect and its playback
 * position is seeked on every frame render so Remotion controls time.
 *
 * The recording file should be placed in public/recordings/ and the
 * `recordingFile` field should be the path relative to public/.
 *
 * For conversion-based workflows (agg → mp4), swap this component for
 * BrowserScene since both ultimately render a video file.
 */
export const TerminalScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Dynamically import to avoid SSR issues in Remotion's renderer
    import("asciinema-player").then((AsciinemaPlayer) => {
      // Unmount any previous instance before creating a new one
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      playerRef.current = AsciinemaPlayer.create(
        `/${scene.recordingFile}`,
        containerRef.current!,
        {
          autoPlay: false,
          controls: false,
          fit: "both",
          theme: "monokai",
          terminalFontSize: "medium",
        }
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.recordingFile]);

  // Sync player position to Remotion's frame clock
  useEffect(() => {
    const currentTime = frame / fps;
    if (playerRef.current?.seek) {
      playerRef.current.seek(currentTime);
    }
  }, [frame, fps]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#1e1e1e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ZoomContainer zoomKeyframes={scene.zoomKeyframes}>
        <div
          ref={containerRef}
          style={{ width: "100%", height: "100%" }}
        />
      </ZoomContainer>
    </div>
  );
};
