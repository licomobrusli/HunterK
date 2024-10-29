// src/types/Debriefing.ts

export type DebriefElementType = 'prompt' | 'radials';

export interface DebriefElement {
  id: string;
  type: DebriefElementType;
  prompt: string;
  options?: string[]; // For radials
}

export interface Debriefing {
  id: string;
  name: string;
  elements: DebriefElement[];
}
