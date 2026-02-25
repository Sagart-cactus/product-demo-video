import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { storyboard } from "./storyboard";
import { TerminalScene } from "./components/TerminalScene";
import { BrowserScene } from "./components/BrowserScene";
import { SplitScene } from "./components/SplitScene";
import { TitleCard } from "./components/TitleCard";

/**
 * Main Remotion composition.
 *
 * Sequences all scenes from the storyboard with a 20-frame crossfade
 * between each one. Each scene gets a TitleCard overlay in its first
 * 80 frames.
 */
export const DemoVideo: React.FC = () => {
  const fps = storyboard.fps ?? 30;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {storyboard.scenes.flatMap((scene, i) => {
          const durationInFrames = Math.ceil(scene.durationInSeconds * fps);
          const sceneElement = (
            <TransitionSeries.Sequence
              key={scene.id}
              durationInFrames={durationInFrames}
            >
              <AbsoluteFill>
                {scene.type === "terminal" && <TerminalScene scene={scene} />}
                {scene.type === "browser"  && <BrowserScene  scene={scene} />}
                {scene.type === "split"    && <SplitScene    scene={scene} />}
                <TitleCard title={scene.title} subtitle={scene.description} />
              </AbsoluteFill>
            </TransitionSeries.Sequence>
          );

          const transitionElement =
            i < storyboard.scenes.length - 1 ? (
              <TransitionSeries.Transition
                key={`transition-${i}`}
                timing={linearTiming({ durationInFrames: 20 })}
                presentation={fade()}
              />
            ) : null;

          return transitionElement
            ? [sceneElement, transitionElement]
            : [sceneElement];
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
