import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { storyboard } from "./storyboard";
import { IntroScene } from "./components/IntroScene";
import { FeatureScene } from "./components/FeatureScene";
import { WorkflowScene } from "./components/WorkflowScene";
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
  const transitionOverlap = 20;
  const sceneDurations = storyboard.scenes.map((scene) =>
    Math.ceil(scene.durationInSeconds * fps)
  );
  const sceneStarts: number[] = [];
  for (let i = 0; i < sceneDurations.length; i++) {
    if (i === 0) {
      sceneStarts.push(0);
    } else {
      sceneStarts.push(
        sceneStarts[i - 1] + sceneDurations[i - 1] - transitionOverlap
      );
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      <TransitionSeries name="DemoVideoTransitionSeries">
        {storyboard.scenes.map((scene, i) => {
          const durationInFrames = Math.ceil(scene.durationInSeconds * fps);
          const isLast = i === storyboard.scenes.length - 1;

          return (
            <React.Fragment key={scene.id}>
              <TransitionSeries.Sequence durationInFrames={durationInFrames}>
                <AbsoluteFill>
                  {scene.type === "intro"      && <IntroScene      scene={scene} />}
                  {scene.type === "feature"    && <FeatureScene    scene={scene} />}
                  {scene.type === "workflow"   && <WorkflowScene   scene={scene} />}
                  {scene.type === "code"       && <CodeScene       scene={scene} />}
                  {scene.type === "screenshot" && <ScreenshotScene scene={scene} />}
                  {scene.type === "comparison" && <ComparisonScene scene={scene} />}
                  {scene.type === "outro"      && <OutroScene      scene={scene} />}

                  <CaptionOverlay
                    narration={scene.narration}
                    durationInFrames={durationInFrames}
                  />
                </AbsoluteFill>
              </TransitionSeries.Sequence>

              {!isLast && (
                <TransitionSeries.Transition
                  timing={linearTiming({ durationInFrames: 20 })}
                  presentation={fade()}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      {storyboard.scenes.map((scene, i) => {
        if (!scene.narrationAudioFile) {
          return null;
        }

        return (
          <Sequence
            key={`audio-${scene.id}`}
            from={sceneStarts[i]}
            durationInFrames={sceneDurations[i]}
            layout="none"
          >
            <Audio
              src={staticFile(scene.narrationAudioFile)}
              volume={1}
              pauseWhenBuffering={false}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
