import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { storyboard } from "./storyboard";
import { IntroScene } from "./components/IntroScene";
import { FeatureScene } from "./components/FeatureScene";
import { CodeScene } from "./components/CodeScene";
import { ScreenshotScene } from "./components/ScreenshotScene";
import { ComparisonScene } from "./components/ComparisonScene";
import { OutroScene } from "./components/OutroScene";
import { CaptionOverlay } from "./components/CaptionOverlay";

/**
 * Main Remotion composition.
 *
 * Dispatches each scene to the appropriate component based on scene.type,
 * adds a CaptionOverlay for narration text, and plays optional TTS audio.
 * Scenes are connected with a 20-frame crossfade transition.
 */
export const DemoVideo: React.FC = () => {
  const fps = storyboard.fps ?? 30;
  const bgColor = storyboard.theme?.backgroundColor ?? "#0f0f0f";

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      <TransitionSeries>
        {storyboard.scenes.flatMap((scene, i) => {
          const durationInFrames = Math.ceil(scene.durationInSeconds * fps);

          const sceneElement = (
            <TransitionSeries.Sequence
              key={scene.id}
              durationInFrames={durationInFrames}
            >
              <AbsoluteFill>
                {scene.type === "intro"      && <IntroScene      scene={scene} />}
                {scene.type === "feature"    && <FeatureScene    scene={scene} />}
                {scene.type === "code"       && <CodeScene       scene={scene} />}
                {scene.type === "screenshot" && <ScreenshotScene scene={scene} />}
                {scene.type === "comparison" && <ComparisonScene scene={scene} />}
                {scene.type === "outro"      && <OutroScene      scene={scene} />}

                <CaptionOverlay
                  narration={scene.narration}
                  durationInFrames={durationInFrames}
                />

                {scene.narrationAudioFile && (
                  <Audio src={staticFile(scene.narrationAudioFile)} />
                )}
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
