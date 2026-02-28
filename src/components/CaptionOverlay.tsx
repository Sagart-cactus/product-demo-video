import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface Props {
  narration?: string;
  durationInFrames: number;
}

/**
 * Renders narration text as a subtitle overlay at the bottom of the frame.
 * Fades in over the first 15 frames and out over the last 15 frames.
 */
export const CaptionOverlay: React.FC<Props> = ({ narration, durationInFrames }) => {
  const frame = useCurrentFrame();

  if (!narration) return null;

  const fadeEnd = Math.max(durationInFrames - 15, 16);
  const opacity = interpolate(
    frame,
    [0, 15, fadeEnd, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        opacity,
        padding: "80px 160px 52px",
        background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
        pointerEvents: "none",
      }}
    >
      <p
        style={{
          color: "#ffffff",
          fontSize: 30,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 400,
          lineHeight: 1.5,
          textShadow: "0 2px 8px rgba(0,0,0,0.9)",
          textAlign: "center",
          margin: 0,
        }}
      >
        {narration}
      </p>
    </div>
  );
};
