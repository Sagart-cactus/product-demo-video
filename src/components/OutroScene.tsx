import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "../types";
import { ZoomContainer } from "./ZoomContainer";

/**
 * Closing scene with a headline, optional CTA, and optional links.
 * Elements spring in sequentially with a branded accent color.
 */
export const OutroScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { outroContent, zoomKeyframes } = scene;

  const accentColor = outroContent?.accentColor ?? "#6366f1";

  const headlineProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    delay: 10,
    config: { damping: 30, stiffness: 200 },
  });
  const ctaProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    delay: 30,
    config: { damping: 28, stiffness: 180 },
  });
  const linksProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    delay: 48,
    config: { damping: 26, stiffness: 160 },
  });

  return (
    <ZoomContainer zoomKeyframes={zoomKeyframes}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(ellipse at 50% 60%, ${accentColor}18 0%, #0f0f0f 65%)`,
          padding: "0 100px",
          boxSizing: "border-box",
          gap: 0,
        }}
      >
        {/* Headline */}
        <div
          style={{
            opacity: headlineProgress,
            transform: `translateY(${interpolate(headlineProgress, [0, 1], [32, 0])}px)`,
            color: "#ffffff",
            fontSize: 88,
            fontWeight: 800,
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            textAlign: "center",
            maxWidth: 1200,
          }}
        >
          {outroContent?.headline ?? scene.title}
        </div>

        {/* CTA button */}
        {outroContent?.cta && (
          <div
            style={{
              opacity: ctaProgress,
              transform: `translateY(${interpolate(ctaProgress, [0, 1], [20, 0])}px)`,
              marginTop: 52,
              background: accentColor,
              borderRadius: 999,
              padding: "20px 56px",
              color: "#ffffff",
              fontSize: 32,
              fontWeight: 700,
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: "-0.01em",
              boxShadow: `0 0 40px ${accentColor}55, 0 8px 24px rgba(0,0,0,0.4)`,
            }}
          >
            {outroContent.cta}
          </div>
        )}

        {/* Links */}
        {outroContent?.links && outroContent.links.length > 0 && (
          <div
            style={{
              opacity: linksProgress,
              transform: `translateY(${interpolate(linksProgress, [0, 1], [16, 0])}px)`,
              marginTop: 44,
              display: "flex",
              gap: 40,
              alignItems: "center",
            }}
          >
            {outroContent.links.map((link, i) => (
              <div
                key={i}
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 26,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 400,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    color: accentColor,
                    fontSize: 20,
                    opacity: 0.8,
                  }}
                >
                  →
                </span>
                {link.label}
              </div>
            ))}
          </div>
        )}

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: interpolate(ctaProgress, [0.5, 1], [0, 0.4]),
            width: 80,
            height: 3,
            background: accentColor,
            borderRadius: 2,
          }}
        />
      </div>
    </ZoomContainer>
  );
};
