// src/types/Scene.ts

import { PlaybackMode } from './PlaybackMode';

export interface Scene {
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
  selectedDebriefs: { [key: string]: string | null }; // Updated to include selectedDebriefs
}
