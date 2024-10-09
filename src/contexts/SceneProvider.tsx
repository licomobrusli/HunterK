// src/contexts/SceneProvider.tsx
import React, { useState, useEffect, createContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Scene } from '../types/Scene'; // Import Scene type
import { PlaybackMode } from '../types/PlaybackMode'; // Import PlaybackMode type

type IntervalContextType = {
  intervals: { [key: string]: number };
  setIntervalForState: (stateName: string, interval: number) => void;
  selectedAudios: {
    [key: string]: {
      audios: string[];
      mode: PlaybackMode;
    };
  };
  setSelectedAudiosForState: (
    stateName: string,
    data: { audios: string[]; mode: PlaybackMode }
  ) => void;
  loadSceneData: (scene: Scene) => void; // Include loadSceneData
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
    active: { audios: [], mode: 'Selected' },
    spotted: { audios: [], mode: 'Selected' },
    proximity: { audios: [], mode: 'Selected' },
    trigger: { audios: [], mode: 'Selected' },
  },
  setSelectedAudiosForState: () => {},
  loadSceneData: () => {}, // Provide a default implementation
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

  const [selectedAudios, setSelectedAudios] = useState<{
    [key: string]: { audios: string[]; mode: PlaybackMode };
  }>({
    active: { audios: [], mode: 'Selected' },
    spotted: { audios: [], mode: 'Selected' },
    proximity: { audios: [], mode: 'Selected' },
    trigger: { audios: [], mode: 'Selected' },
  });

  const setIntervalForState = (stateName: string, interval: number) => {
    setIntervals((prev) => ({
      ...prev,
      [stateName.toLowerCase()]: interval,
    }));
  };

  const setSelectedAudiosForState = (
    stateName: string,
    data: { audios: string[]; mode: PlaybackMode }
  ) => {
    setSelectedAudios((prev) => ({
      ...prev,
      [stateName.toLowerCase()]: data,
    }));
    // Save to AsyncStorage
    AsyncStorage.setItem(
      `@selectedAudios_${stateName.toLowerCase()}`,
      JSON.stringify(data)
    );
  };

  const loadSceneData = (scene: Scene) => {
    setIntervals(scene.intervals);
    setSelectedAudios(scene.selectedAudios);
    // Update AsyncStorage
    STATES.forEach((state) => {
      const lowerState = state.toLowerCase();
      const interval = scene.intervals[lowerState];
      if (interval !== undefined) {
        AsyncStorage.setItem(`@interval_${lowerState}`, interval.toString());
      }
      const selectedAudioData = scene.selectedAudios[lowerState];
      if (selectedAudioData) {
        AsyncStorage.setItem(
          `@selectedAudios_${lowerState}`,
          JSON.stringify(selectedAudioData)
        );
      }
    });
  };

  // Load intervals and selected audios from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedIntervals: { [key: string]: number } = {};
        const loadedSelectedAudios: {
          [key: string]: { audios: string[]; mode: PlaybackMode };
        } = {};

        for (const state of STATES) {
          const lowerState = state.toLowerCase();

          const storedInterval = await AsyncStorage.getItem(
            `@interval_${lowerState}`
          );
          if (storedInterval !== null) {
            const parsedInterval = parseInt(storedInterval, 10);
            if (!isNaN(parsedInterval)) {
              loadedIntervals[lowerState] = parsedInterval;
            }
          }

          const storedAudios = await AsyncStorage.getItem(
            `@selectedAudios_${lowerState}`
          );
          if (storedAudios !== null) {
            const parsedAudios = JSON.parse(storedAudios);
            loadedSelectedAudios[lowerState] = parsedAudios;
          } else {
            loadedSelectedAudios[lowerState] = { audios: [], mode: 'Selected' };
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
        setSelectedAudiosForState,
        loadSceneData, // Include loadSceneData in context
      }}
    >
      {children}
    </IntervalContext.Provider>
  );
};

export default SceneProvider;
