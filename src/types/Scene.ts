// src/types/Scene.ts
import { PlaybackMode } from './PlaybackMode';

export interface Scene {
    name: string;
    states: string[];
    intervals: { [key: string]: number };
    selectedAudios: {
    [key: string]: {
      audios: string[];
      mode: PlaybackMode;
    };
  };
  // Add any other properties your Scene might have
}
