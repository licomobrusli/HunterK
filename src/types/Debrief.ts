// src/types/Debrief.ts

export type DebriefElementType =
  | 'text'
  | 'multipleChoice'
  | 'dropdown'
  | 'scale'
  // Add more types as needed

export interface DebriefElement {
  id: string;
  type: DebriefElementType;
  prompt: string;
  options?: string[]; // For multipleChoice, dropdown
  scale?: {
    min: number;
    max: number;
    step?: number;
    labels?: { min: string; max: string };
  }; // For scale
  // Add more properties based on the element type
}

export interface Debriefing {
  id: string;
  name: string;
  elements: DebriefElement[];
  // Add more properties like rules, order, etc.
}
