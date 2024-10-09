// src/types/Scene.ts
import { PlaybackMode } from './PlaybackMode';

export type Scene = {
  name: string;
  intervals: { [stateName: string]: number };
  selectedAudios: {
    [stateName: string]: {
      audios: string[];
      mode: PlaybackMode;
    };
  };
};
