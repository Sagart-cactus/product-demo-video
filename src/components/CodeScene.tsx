import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-json";
import type { Scene } from "../types";

// Dark theme token colors
const TOKEN_COLORS: Record<string, string> = {
  comment: "#6b7280",
  prolog: "#6b7280",
  doctype: "#6b7280",
  cdata: "#6b7280",
  punctuation: "#9ca3af",
  property: "#93c5fd",
  number: "#fb923c",
  boolean: "#fb923c",
  constant: "#fbbf24",
  symbol: "#fbbf24",
  deleted: "#f87171",
  selector: "#86efac",
  "attr-name": "#86efac",
  string: "#86efac",
  char: "#86efac",
  builtin: "#86efac",
  inserted: "#86efac",
  operator: "#e2e8f0",
  url: "#93c5fd",
  variable: "#f9a8d4",
  atrule: "#c084fc",
  "attr-value": "#86efac",
  function: "#60a5fa",
  "class-name": "#fbbf24",
  keyword: "#c084fc",
  regex: "#fb923c",
  important: "#fb923c",
  tag: "#f87171",
};

function tokenColor(types: string[]): string {
  for (const t of types) {
    if (TOKEN_COLORS[t]) return TOKEN_COLORS[t];
  }
  return "#e2e8f0";
}

type PToken = string | Prism.Token;

/**
 * Flatten Prism token tree into an array-of-lines, where each line
 * is an array of <span> elements with appropriate colors.
 */
function flattenToLines(tokens: PToken[]): React.ReactNode[][] {
  const lines: React.ReactNode[][] = [[]];
  let lineIdx = 0;
  let keyIdx = 0;

  function walk(token: PToken, types: string[]) {
    if (typeof token === "string") {
      const parts = token.split("\n");
      parts.forEach((part, i) => {
        if (i > 0) {
          lineIdx++;
          lines.push([]);
        }
        if (part) {
          const color = tokenColor(types);
          lines[lineIdx].push(
            <span key={keyIdx++} style={{ color }}>
              {part}
            </span>
          );
        }
      });
    } else {
      const childTypes = [...types, token.type];
      const content = Array.isArray(token.content) ? token.content : [token.content];
      content.forEach((child) => walk(child as PToken, childTypes));
    }
  }

  tokens.forEach((t) => walk(t, []));
  return lines;
}

/**
 * Syntax-highlighted code viewer with optional line-by-line reveal animation,
 * line numbers, and per-line highlighting.
 */
export const CodeScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { codeContent } = scene;

  const code = codeContent?.code ?? "// No code — set codeContent.code";
  const language = codeContent?.language ?? "typescript";
  const filename = codeContent?.filename;
  const highlightLines = new Set(codeContent?.highlightLines ?? []);
  const revealByLine = codeContent?.revealByLine ?? false;

  const grammar = Prism.languages[language] ?? Prism.languages.javascript;
  const tokens = Prism.tokenize(code, grammar);
  const codeLines = flattenToLines(tokens);

  const containerProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    delay: 5,
    config: { damping: 30, stiffness: 200 },
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0f0f0f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 80px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          opacity: containerProgress,
          transform: `translateY(${interpolate(containerProgress, [0, 1], [20, 0])}px)`,
          width: "100%",
          maxWidth: 1440,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 28px 80px rgba(0,0,0,0.65)",
        }}
      >
        {/* Window chrome */}
        <div
          style={{
            background: "#161625",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#28ca41" }} />
          {filename && (
            <span
              style={{
                marginLeft: 20,
                color: "rgba(255,255,255,0.45)",
                fontSize: 19,
                fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
              }}
            >
              {filename}
            </span>
          )}
        </div>

        {/* Code area */}
        <div
          style={{
            background: "#1e1e2e",
            padding: "28px 0 28px",
            fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
            fontSize: 23,
            lineHeight: 1.75,
            overflowX: "hidden",
          }}
        >
          {codeLines.map((lineNodes, i) => {
            const lineNum = i + 1;
            const isHighlighted = highlightLines.has(lineNum);
            const lineOpacity = revealByLine
              ? spring({
                  frame,
                  fps,
                  from: 0,
                  to: 1,
                  delay: 18 + i * 4,
                  config: { damping: 22, stiffness: 140 },
                })
              : 1;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  background: isHighlighted ? "rgba(251,191,36,0.07)" : "transparent",
                  borderLeft: isHighlighted ? "3px solid #fbbf24" : "3px solid transparent",
                  paddingRight: 32,
                  opacity: lineOpacity,
                  minHeight: "1.75em",
                }}
              >
                <span
                  style={{
                    color: "#374151",
                    minWidth: 52,
                    userSelect: "none",
                    paddingLeft: 20,
                    paddingRight: 20,
                    textAlign: "right",
                    flexShrink: 0,
                    fontSize: 18,
                  }}
                >
                  {lineNum}
                </span>
                <span style={{ whiteSpace: "pre" }}>{lineNodes}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
