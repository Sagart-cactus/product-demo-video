import React from "react";
import { interpolate, Easing, useCurrentFrame } from "remotion";
import type { ZoomKeyframe } from "../types";

interface Props {
  zoomKeyframes: ZoomKeyframe[];
  children: React.ReactNode;
}

/**
 * Wraps its children and applies smooth zoom-into-region animations.
 *
 * How it works:
 *   - For each ZoomKeyframe, the `region` defines the rectangular area of interest.
 *   - The CSS `transformOrigin` is set to the CENTER of that region (as % strings),
 *     so the CSS scale naturally zooms toward/away from the region — no translate math.
 *   - Scale is animated with Bezier easing matching Material Design curves:
 *       Zoom in:  Easing.bezier(0.4, 0, 0.2, 1) — standard curve
 *       Zoom out: Easing.bezier(0.0, 0, 0.2, 1) — decelerate curve
 *   - Between keyframes the container stays at scale 1 with origin 50%/50%.
 */
export const ZoomContainer: React.FC<Props> = ({ zoomKeyframes, children }) => {
  const frame = useCurrentFrame();

  const active = zoomKeyframes.find(
    (kf) => frame >= kf.startFrame && frame <= kf.endFrame
  ) ?? null;

  let scale = 1;
  let originX = "50%";
  let originY = "50%";

  if (active) {
    const isZoomIn = active.fromScale < active.toScale;

    scale = interpolate(
      frame,
      [active.startFrame, active.endFrame],
      [active.fromScale, active.toScale],
      {
        easing: isZoomIn
          ? Easing.bezier(0.4, 0, 0.2, 1)
          : Easing.bezier(0.0, 0, 0.2, 1),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );

    // Center of the zoom region → CSS transformOrigin percentage
    const cx = (active.region.x + active.region.width / 2) * 100;
    const cy = (active.region.y + active.region.height / 2) * 100;
    originX = `${cx.toFixed(2)}%`;
    originY = `${cy.toFixed(2)}%`;
  }

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          transformOrigin: `${originX} ${originY}`,
          willChange: "transform",
        }}
      >
        {children}
      </div>

      {/* Label callout — shown during an active zoom */}
      {active?.label && scale > 1.05 && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0, 0, 0, 0.72)",
            color: "#fff",
            padding: "10px 28px",
            borderRadius: 8,
            fontSize: 26,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 600,
            letterSpacing: "0.01em",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {active.label}
        </div>
      )}
    </div>
  );
};
