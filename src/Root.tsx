import React from "react";
import { Composition } from "remotion";
import { DemoVideo } from "./DemoVideo";
import { storyboard } from "./storyboard";

/**
 * Registers the DemoVideo composition with dimensions and duration
 * derived from the active storyboard.
 *
 * Total frames = sum of each scene's durationInSeconds × fps,
 * minus the 20-frame overlap per crossfade transition.
 */
export const RemotionRoot: React.FC = () => {
  const fps = storyboard.fps ?? 30;
  const transitionOverlap = 20; // frames, must match DemoVideo.tsx
  const sceneFrames = storyboard.scenes.reduce(
    (acc, s) => acc + Math.ceil(s.durationInSeconds * fps),
    0
  );
  const transitionFrames =
    Math.max(0, storyboard.scenes.length - 1) * transitionOverlap;
  const totalFrames = Math.max(1, sceneFrames - transitionFrames);

  return (
    <Composition
      id="DemoVideo"
      component={DemoVideo}
      durationInFrames={totalFrames}
      fps={fps}
      width={storyboard.width ?? 1920}
      height={storyboard.height ?? 1080}
    />
  );
};
