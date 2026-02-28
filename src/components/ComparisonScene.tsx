import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import type { Scene } from "../types";

// Inline dark theme for prism-highlighted HTML
const PRISM_DARK_CSS = `
.token.comment,.token.prolog,.token.doctype,.token.cdata{color:#6b7280}
.token.punctuation{color:#9ca3af}
.token.property,.token.tag{color:#93c5fd}
.token.boolean,.token.number,.token.constant,.token.symbol{color:#fb923c}
.token.selector,.token.attr-name,.token.string,.token.char,.token.builtin,.token.inserted{color:#86efac}
.token.operator,.token.entity,.token.url{color:#e2e8f0}
.token.atrule,.token.attr-value,.token.keyword{color:#c084fc}
.token.function,.token.class-name{color:#60a5fa}
.token.regex,.token.important,.token.variable{color:#f9a8d4}
.token.deleted{color:#f87171}
`;

interface PanelProps {
  label: string;
  content: string;
  language?: string;
  progress: number;
  side: "left" | "right";
}

const Panel: React.FC<PanelProps> = ({ label, content, language, progress, side }) => {
  const highlighted =
    language && Prism.languages[language]
      ? Prism.highlight(content, Prism.languages[language], language)
      : content;

  const translateX = interpolate(progress, [0, 1], [side === "left" ? -32 : 32, 0]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        opacity: progress,
        transform: `translateX(${translateX}px)`,
        overflow: "hidden",
        borderRadius: 14,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}
    >
      {/* Panel header */}
      <div
        style={{
          background: "#161625",
          padding: "12px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
        <span
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 20,
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      </div>

      {/* Code / text body */}
      <div
        style={{
          flex: 1,
          background: "#1e1e2e",
          padding: "28px 32px",
          fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
          fontSize: 22,
          lineHeight: 1.7,
          color: "#e2e8f0",
          overflowY: "auto",
          whiteSpace: "pre-wrap" as const,
          wordBreak: "break-word" as const,
        }}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
};

/**
 * Side-by-side comparison scene: left pane (before/problem) vs right pane
 * (after/solution). Both panels animate in from their respective sides.
 */
export const ComparisonScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { comparisonContent } = scene;

  const leftProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    delay: 8,
    config: { damping: 28, stiffness: 180 },
  });
  const rightProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    delay: 22,
    config: { damping: 28, stiffness: 180 },
  });

  return (
    <>
      {/* Inject prism dark theme CSS */}
      <style dangerouslySetInnerHTML={{ __html: PRISM_DARK_CSS }} />

      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0f0f0f",
          display: "flex",
          flexDirection: "column",
          padding: "60px 80px",
          boxSizing: "border-box",
          gap: 24,
        }}
      >
        {comparisonContent ? (
          <div
        style={{
          flex: 1,
          display: "flex",
          gap: 28,
          overflow: "hidden",
        }}
      >
          <Panel
            label={comparisonContent.leftLabel}
            content={comparisonContent.leftContent}
            language={comparisonContent.language}
            progress={leftProgress}
            side="left"
          />
          <Panel
            label={comparisonContent.rightLabel}
            content={comparisonContent.rightContent}
            language={comparisonContent.language}
            progress={rightProgress}
            side="right"
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
          No content — set comparisonContent
        </div>
      )}
      </div>
    </>
  );
};
