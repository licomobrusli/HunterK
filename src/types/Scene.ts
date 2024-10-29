// src/types/Scene.ts

import { PlaybackMode } from './PlaybackMode';

export interface Scene {
  selectedDebriefs: any;
  name: string;
  states: string[];
  intervals: { [key: string]: number | null };
  selectedAudios: {
    [key: string]: {
      audios: string[];
      mode: PlaybackMode;
      repetitions?: number | null;
    };
  };
  // Add any other properties your Scene might have
}
