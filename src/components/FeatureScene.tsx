import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "../types";

/**
 * Feature highlight scene: large title + animated bullet points that reveal
 * one at a time. Supports centered or left-aligned layout.
 */
export const FeatureScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { featureContent } = scene;

  const bullets = featureContent?.bullets ?? [];
  const layout = featureContent?.layout ?? "centered";
  const isLeft = layout === "left";
  const accentColor = "#6366f1";

  const iconProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    delay: 5,
    config: { damping: 28, stiffness: 220 },
  });

  const titleProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    delay: 15,
    config: { damping: 28, stiffness: 180 },
  });

  // Each bullet reveals 18 frames after the previous
  const bulletProgresses = bullets.map((_, i) =>
    spring({
      frame,
      fps,
      from: 0,
      to: 1,
      delay: 35 + i * 18,
      config: { damping: 26, stiffness: 160 },
    })
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0f0f0f",
        display: "flex",
        flexDirection: "column",
        alignItems: isLeft ? "flex-start" : "center",
        justifyContent: "center",
        padding: isLeft ? "0 140px" : "0 100px",
        boxSizing: "border-box",
      }}
    >
      {/* Icon */}
      {featureContent?.icon && (
        <div
        style={{
          fontSize: 80,
          marginBottom: 28,
          opacity: iconProgress,
          transform: `scale(${interpolate(iconProgress, [0, 1], [0.4, 1])})`,
          lineHeight: 1,
        }}
      >
          {featureContent.icon}
        </div>
      )}

      {/* Feature title */}
      <div
        style={{
          opacity: titleProgress,
          transform: `translateY(${interpolate(titleProgress, [0, 1], [24, 0])}px)`,
          color: "#ffffff",
          fontSize: 72,
          fontWeight: 800,
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          textAlign: isLeft ? "left" : "center",
          marginBottom: 52,
          maxWidth: 1100,
        }}
      >
        {featureContent?.featureTitle ?? scene.title}
      </div>

      {/* Bullet points */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 22,
          alignItems: isLeft ? "flex-start" : "center",
        }}
      >
        {bullets.map((bullet, i) => (
          <div
            key={i}
            style={{
              opacity: bulletProgresses[i],
              transform: `translateX(${interpolate(
                bulletProgresses[i],
                [0, 1],
                [isLeft ? -24 : 0, 0]
              )}px) translateY(${interpolate(
                bulletProgresses[i],
                [0, 1],
                [isLeft ? 0 : 12, 0]
              )}px)`,
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: accentColor,
                flexShrink: 0,
                boxShadow: `0 0 12px ${accentColor}88`,
              }}
            />
            <span
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 34,
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 400,
                lineHeight: 1.4,
              }}
            >
              {bullet}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
