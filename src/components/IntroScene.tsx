import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "../types";

/**
 * Animated intro scene: project name + tagline + optional badge on a dark
 * gradient background. All elements spring in sequentially.
 */
export const IntroScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { introContent } = scene;

  const accentColor = introContent?.accentColor ?? "#6366f1";

  const titleProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    delay: 10,
    config: { damping: 30, stiffness: 200 },
  });
  const taglineProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    delay: 28,
    config: { damping: 30, stiffness: 180 },
  });
  const badgeProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    delay: 5,
    config: { damping: 30, stiffness: 200 },
  });
  const lineProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    delay: 40,
    config: { damping: 28, stiffness: 160 },
  });

  // Slow ambient rotation for the background glow
  const gradientAngle = interpolate(frame, [0, 300], [0, 60], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(ellipse at 50% 40%, ${accentColor}20 0%, #0f0f0f 65%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow blob */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}12 0%, transparent 70%)`,
          transform: `rotate(${gradientAngle}deg)`,
          top: "50%",
          left: "50%",
          marginTop: -450,
          marginLeft: -450,
          pointerEvents: "none",
        }}
      />

      {/* Badge */}
      {introContent?.badge && (
        <div
          style={{
            opacity: badgeProgress,
            transform: `translateY(${interpolate(badgeProgress, [0, 1], [16, 0])}px)`,
            marginBottom: 36,
            background: `${accentColor}1a`,
            border: `1px solid ${accentColor}55`,
            borderRadius: 999,
            padding: "8px 28px",
            color: accentColor,
            fontSize: 20,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            letterSpacing: "0.07em",
            textTransform: "uppercase" as const,
          }}
        >
          {introContent.badge}
        </div>
      )}

      {/* Project name */}
      <div
        style={{
          opacity: titleProgress,
          transform: `translateY(${interpolate(titleProgress, [0, 1], [32, 0])}px)`,
          color: "#ffffff",
          fontSize: 96,
          fontWeight: 800,
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          textAlign: "center",
          maxWidth: 1400,
        }}
      >
        {introContent?.projectName ?? scene.title}
      </div>

      {/* Tagline */}
      {introContent?.tagline && (
        <div
          style={{
            opacity: taglineProgress,
            transform: `translateY(${interpolate(taglineProgress, [0, 1], [20, 0])}px)`,
            color: "rgba(255,255,255,0.6)",
            fontSize: 36,
            fontWeight: 400,
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginTop: 28,
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.5,
          }}
        >
          {introContent.tagline}
        </div>
      )}

      {/* Accent underline */}
      <div
        style={{
          marginTop: 52,
          width: interpolate(lineProgress, [0, 1], [0, 100]),
          height: 4,
          background: accentColor,
          borderRadius: 2,
        }}
      />
    </div>
  );
};
