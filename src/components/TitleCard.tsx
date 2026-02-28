import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface Props {
  title: string;
  subtitle?: string;
  accentColor?: string;
}

/**
 * Scene title overlay — fades in over the first 20 frames,
 * holds for 60 frames, then fades out.
 */
export const TitleCard: React.FC<Props> = ({ title, subtitle, accentColor = "#6366f1" }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, 20, 60, 80],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const translateY = interpolate(
    frame,
    [0, 20],
    [12, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (opacity < 0.01) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 56,
        left: 56,
        opacity,
        transform: `translateY(${translateY}px)`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(8px)",
          borderLeft: `4px solid ${accentColor}`,
          borderRadius: "0 8px 8px 0",
          padding: "14px 28px",
          display: "inline-block",
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontSize: 32,
            fontWeight: 700,
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 20,
              fontWeight: 400,
              fontFamily: "system-ui, -apple-system, sans-serif",
              marginTop: 4,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
