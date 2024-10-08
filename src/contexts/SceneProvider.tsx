// src/contexts/SceneProvider.tsx
import React, { useState, useEffect, createContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type IntervalContextType = {
  intervals: { [key: string]: number };
  setIntervalForState: (stateName: string, interval: number) => void;
  selectedAudios: { [key: string]: string | null };
  setSelectedAudioForState: (stateName: string, audioPath: string | null) => void;
};

export const IntervalContext = createContext<IntervalContextType>({
  intervals: {
    active: 5000,
    spotted: 6000,
    proximity: 7000,
    trigger: 8000,
  },
  setIntervalForState: () => {},
  selectedAudios: {
    active: null,
    spotted: null,
    proximity: null,
    trigger: null,
  },
  setSelectedAudioForState: () => {},
});

type SceneProviderProps = {
  children: ReactNode;
};

const STATES = ['Active', 'Spotted', 'Proximity', 'Trigger'];

const SceneProvider: React.FC<SceneProviderProps> = ({ children }) => {
  const [intervals, setIntervals] = useState<{ [key: string]: number }>({
    active: 5000,
    spotted: 6000,
    proximity: 7000,
    trigger: 8000,
  });

  const [selectedAudios, setSelectedAudios] = useState<{ [key: string]: string | null }>({
    active: null,
    spotted: null,
    proximity: null,
    trigger: null,
  });

  const setIntervalForState = (stateName: string, interval: number) => {
    setIntervals((prev) => ({
      ...prev,
      [stateName.toLowerCase()]: interval,
    }));
  };

  const setSelectedAudioForState = (stateName: string, audioPath: string | null) => {
    setSelectedAudios((prev) => ({
      ...prev,
      [stateName.toLowerCase()]: audioPath,
    }));
    // Save to AsyncStorage
    AsyncStorage.setItem(`@selectedAudio_${stateName.toLowerCase()}`, audioPath || '');
  };

  // Load intervals and selected audios from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedIntervals: { [key: string]: number } = {};
        const loadedSelectedAudios: { [key: string]: string | null } = {};

        for (const state of STATES) {
          const storedInterval = await AsyncStorage.getItem(
            `@interval_${state.toLowerCase()}`
          );
          if (storedInterval !== null) {
            const parsedInterval = parseInt(storedInterval, 10);
            if (!isNaN(parsedInterval)) {
              loadedIntervals[state.toLowerCase()] = parsedInterval;
            }
          }

          const storedAudio = await AsyncStorage.getItem(
            `@selectedAudio_${state.toLowerCase()}`
          );
          if (storedAudio !== null && storedAudio !== '') {
            loadedSelectedAudios[state.toLowerCase()] = storedAudio;
          } else {
            loadedSelectedAudios[state.toLowerCase()] = null;
          }
        }

        setIntervals((prev) => ({ ...prev, ...loadedIntervals }));
        setSelectedAudios((prev) => ({ ...prev, ...loadedSelectedAudios }));
      } catch (error) {
        console.error('Failed to load data', error);
      }
    };

    loadData();
  }, []);

  return (
    <IntervalContext.Provider
      value={{
        intervals,
        setIntervalForState,
        selectedAudios,
        setSelectedAudioForState,
      }}
    >
      {children}
    </IntervalContext.Provider>
  );
};

export default SceneProvider;
