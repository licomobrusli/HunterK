// src/utils/timeUtils.ts

export const convertMsToMinutesSeconds = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  export const convertMinutesSecondsToMs = (time: string): number => {
    const [minutes, seconds] = time.split(':').map(Number);
    if (isNaN(minutes) || isNaN(seconds)) {
      return NaN;
    }
    return minutes * 60000 + seconds * 1000;
  };
