import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "../types";

/**
 * Displays a screenshot image with an optional caption.
 * The image springs in with a subtle scale + fade animation.
 */
export const ScreenshotScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { screenshotContent } = scene;

  const bgColor = screenshotContent?.backgroundColor ?? "#0f0f0f";

  const imageProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    delay: 8,
    config: { damping: 30, stiffness: 180 },
  });

  const captionProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    delay: 25,
    config: { damping: 28, stiffness: 160 },
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: bgColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: screenshotContent?.caption ? "60px 80px 40px" : "60px 80px",
        boxSizing: "border-box",
        gap: 32,
      }}
    >
      {screenshotContent?.imageFile ? (
        <div
        style={{
          opacity: imageProgress,
          transform: `scale(${interpolate(imageProgress, [0, 1], [0.94, 1])})`,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          overflow: "hidden",
          borderRadius: 16,
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
          <Img
            src={staticFile(screenshotContent.imageFile)}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 16,
            }}
          />
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.3)",
            fontSize: 28,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          No image — set screenshotContent.imageFile
        </div>
      )}

      {screenshotContent?.caption && (
        <div
          style={{
            opacity: captionProgress,
            transform: `translateY(${interpolate(captionProgress, [0, 1], [12, 0])}px)`,
            color: "rgba(255,255,255,0.6)",
            fontSize: 28,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            textAlign: "center",
            maxWidth: 1000,
            lineHeight: 1.5,
          }}
        >
          {screenshotContent.caption}
        </div>
      )}
    </div>
  );
};
