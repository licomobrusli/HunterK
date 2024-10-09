// src/contexts/SceneProvider.tsx
import React, { useState, useEffect, createContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Scene } from '../types/Scene';
import { PlaybackMode } from '../types/PlaybackMode';

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
  loadSceneData: (scene: Scene) => void;
  states: string[]; // Add states to context type
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
  loadSceneData: () => {},
  states: ['Active', 'Spotted', 'Proximity', 'Trigger'], // Provide default states
});

type SceneProviderProps = {
  children: ReactNode;
};

const SceneProvider: React.FC<SceneProviderProps> = ({ children }) => {
  // Replace fixed STATES array with state variable
  const [states, setStates] = useState<string[]>([
    'Active',
    'Spotted',
    'Proximity',
    'Trigger',
  ]);

  const [intervals, setIntervals] = useState<{ [key: string]: number }>(() => {
    const initialIntervals: { [key: string]: number } = {};
    states.forEach((state) => {
      initialIntervals[state.toLowerCase()] = 5000; // Use default intervals or your initial values
    });
    return initialIntervals;
  });

  const [selectedAudios, setSelectedAudios] = useState<{
    [key: string]: { audios: string[]; mode: PlaybackMode };
  }>(() => {
    const initialSelectedAudios: {
      [key: string]: { audios: string[]; mode: PlaybackMode };
    } = {};
    states.forEach((state) => {
      initialSelectedAudios[state.toLowerCase()] = { audios: [], mode: 'Selected' };
    });
    return initialSelectedAudios;
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
    states.forEach((state) => {
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
        const storedStates = await AsyncStorage.getItem('@states');
        if (storedStates) {
          setStates(JSON.parse(storedStates));
        }

        const loadedIntervals: { [key: string]: number } = {};
        const loadedSelectedAudios: {
          [key: string]: { audios: string[]; mode: PlaybackMode };
        } = {};

        for (const state of states) {
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
  }, [states]);

  return (
    <IntervalContext.Provider
      value={{
        intervals,
        setIntervalForState,
        selectedAudios,
        setSelectedAudiosForState,
        loadSceneData,
        states, // Provide states in context
      }}
    >
      {children}
    </IntervalContext.Provider>
  );
};

export default SceneProvider;
