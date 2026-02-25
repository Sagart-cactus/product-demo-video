import React from "react";
import { OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useEffect, useRef } from "react";
import type { Scene } from "../types";
import { ZoomContainer } from "./ZoomContainer";

/**
 * Side-by-side layout: terminal recording on the left, browser recording on the right.
 *
 * `recordingFile`          → asciinema .cast (left pane)
 * `secondaryRecordingFile` → Playwright .mp4 (right pane)
 *
 * ZoomContainer wraps the entire split frame, so zoomKeyframes should use
 * coordinates relative to the full 1920×1080 frame.
 */
export const SplitScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    import("asciinema-player").then((AsciinemaPlayer) => {
      if (containerRef.current) containerRef.current.innerHTML = "";
      playerRef.current = AsciinemaPlayer.create(
        `/${scene.recordingFile}`,
        containerRef.current!,
        { autoPlay: false, controls: false, fit: "both", theme: "monokai" }
      );
    });
  }, [scene.recordingFile]);

  useEffect(() => {
    playerRef.current?.seek?.(frame / fps);
  }, [frame, fps]);

  return (
    <ZoomContainer zoomKeyframes={scene.zoomKeyframes}>
      <div style={{ display: "flex", width: "100%", height: "100%", backgroundColor: "#111" }}>
        {/* Left: terminal */}
        <div
          style={{
            flex: 1,
            borderRight: "2px solid #333",
            backgroundColor: "#1e1e1e",
          }}
        >
          <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
        </div>

        {/* Right: browser */}
        <div style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
          {scene.secondaryRecordingFile ? (
            <OffthreadVideo
              src={staticFile(scene.secondaryRecordingFile)}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontFamily: "monospace",
                fontSize: 18,
              }}
            >
              No browser recording
            </div>
          )}
        </div>
      </div>
    </ZoomContainer>
  );
};
