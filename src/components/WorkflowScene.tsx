import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "../types";

/**
 * Animated workflow scene that visualizes each pipeline step as a node in a
 * left-to-right process map with animated connectors and progress pulse.
 */
export const WorkflowScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const workflow = scene.workflowContent;

  const steps = workflow?.steps ?? [];
  const revealStart = 16;
  const revealGap = 14;
  const activeProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    delay: revealStart,
    config: { damping: 24, stiffness: 110 },
    durationInFrames: Math.max(100, steps.length * revealGap + 40),
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background:
          "radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.24) 0%, transparent 45%), radial-gradient(ellipse at 80% 70%, rgba(56,189,248,0.16) 0%, transparent 45%), #090d19",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "70px 80px",
        boxSizing: "border-box",
        gap: 44,
      }}
    >
      <div
        style={{
          opacity: spring({
            frame,
            fps,
            from: 0,
            to: 1,
            delay: 5,
            config: { damping: 28, stiffness: 180 },
          }),
          transform: `translateY(${interpolate(frame, [0, 35], [30, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: "#f8fafc",
            fontSize: 64,
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {workflow?.headline ?? "AI Workflow"}
        </div>
        {workflow?.subheadline ? (
          <div
            style={{
              color: "rgba(226,232,240,0.8)",
              fontSize: 28,
              marginTop: 14,
              fontWeight: 400,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {workflow.subheadline}
          </div>
        ) : null}
      </div>

      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 24,
        }}
      >
        {steps.map((step, i) => {
          const stepProgress = spring({
            frame,
            fps,
            from: 0,
            to: 1,
            delay: revealStart + i * revealGap,
            config: { damping: 24, stiffness: 150 },
          });

          const connectorProgress =
            i === 0
              ? 0
              : spring({
                  frame,
                  fps,
                  from: 0,
                  to: 1,
                  delay: revealStart + (i - 1) * revealGap + 8,
                  config: { damping: 30, stiffness: 140 },
                });

          return (
            <div
              key={`${scene.id}-step-${i}`}
              style={{
                position: "relative",
                opacity: stepProgress,
                transform: `translateY(${interpolate(stepProgress, [0, 1], [22, 0])}px)`,
              }}
            >
              {i > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: -24,
                    width: 24,
                    height: 2,
                    transform: "translateY(-50%)",
                    background:
                      "linear-gradient(90deg, rgba(14,165,233,0) 0%, rgba(14,165,233,0.7) 100%)",
                    opacity: connectorProgress,
                  }}
                />
              ) : null}

              <div
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(148,163,184,0.25)",
                  background:
                    "linear-gradient(160deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.65) 100%)",
                  minHeight: 140,
                  padding: "18px 20px",
                  boxShadow: "0 16px 38px rgba(2,6,23,0.45)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    color: "rgba(125,211,252,0.95)",
                    fontSize: 18,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  Step {i + 1}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    color: "#e2e8f0",
                    fontSize: 28,
                    lineHeight: 1.25,
                    fontWeight: 600,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  {step}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 1600,
          height: 10,
          borderRadius: 999,
          background: "rgba(148,163,184,0.22)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.max(6, activeProgress * 100)}%`,
            height: "100%",
            background:
              "linear-gradient(90deg, rgba(14,165,233,0.9) 0%, rgba(99,102,241,0.95) 100%)",
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
};
