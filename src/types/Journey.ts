// src/types/Journey.ts

export interface StateLog {
    stateName: string;
    startTime: number; // Unix timestamp in milliseconds
    endTime: number;
    duration: number; // Duration in milliseconds
  }

  export interface DebriefLog {
    debriefName: string;
    startTime: number;
    endTime: number;
    duration: number;
    responses: { [key: string]: any };
  }

  export interface Journey {
    id: string;
    sceneName: string;
    startTime: number;
    endTime: number;
    duration: number;
    stateLogs: StateLog[];
    debriefLog?: DebriefLog;
  }
