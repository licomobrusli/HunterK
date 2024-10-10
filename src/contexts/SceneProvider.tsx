// src/contexts/SceneProvider.tsx

import React, { useState, useEffect, createContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Scene } from '../types/Scene';
import { PlaybackMode } from '../types/PlaybackMode';

type IntervalContextType = {
  intervals: { [key: string]: number };
  setIntervals: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  setIntervalForState: (stateName: string, interval: number) => void;
  selectedAudios: {
    [key: string]: {
      audios: string[];
      mode: PlaybackMode;
    };
  };
  setSelectedAudios: React.Dispatch<
    React.SetStateAction<{
      [key: string]: { audios: string[]; mode: PlaybackMode };
    }>
  >;
  setSelectedAudiosForState: (
    stateName: string,
    data: { audios: string[]; mode: PlaybackMode }
  ) => void;
  loadSceneData: (scene: Scene) => void;
  states: string[];
  setStates: React.Dispatch<React.SetStateAction<string[]>>;
};

export const IntervalContext = createContext<IntervalContextType>({
  intervals: {},
  setIntervals: () => {},
  setIntervalForState: () => {},
  selectedAudios: {},
  setSelectedAudios: () => {},
  setSelectedAudiosForState: () => {},
  loadSceneData: () => {},
  states: [],
  setStates: () => {},
});

type SceneProviderProps = {
  children: ReactNode;
};

const SceneProvider: React.FC<SceneProviderProps> = ({ children }) => {
  const [states, setStates] = useState<string[]>([
    'Active',
    'Spotted',
    'Proximity',
    'Trigger',
  ]);

  const [intervals, setIntervals] = useState<{ [key: string]: number }>({});
  const [selectedAudios, setSelectedAudios] = useState<{
    [key: string]: { audios: string[]; mode: PlaybackMode };
  }>({});

  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  const setIntervalForState = (stateName: string, interval: number) => {
    setIntervals((prev) => ({
      ...prev,
      [stateName.toLowerCase()]: interval,
    }));
    console.log(`Set interval for "${stateName}": ${interval} ms`);
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
    )
      .then(() => {
        console.log(`Selected audios for "${stateName}" saved to AsyncStorage.`);
      })
      .catch((error) => {
        console.error(`Failed to save selected audios for "${stateName}":`, error);
      });
  };

  const loadSceneData = (scene: Scene) => {
    console.log('Loading scene data:', scene);

    if (!scene.states || !Array.isArray(scene.states) || scene.states.length === 0) {
      console.error('Invalid scene data: states must be a non-empty array of strings.');
      return;
    }

    setStates(scene.states);
    console.log('States set to:', scene.states);

    // Synchronize intervals
    const newIntervals: { [key: string]: number } = {};
    scene.states.forEach((state: string) => {
      if (typeof state !== 'string') {
        console.error(`Invalid state name: ${state}`);
        return;
      }
      const lowerState = state.toLowerCase();
      newIntervals[lowerState] = scene.intervals[lowerState] || 5000; // Default to 5000 if not provided
      console.log(`Setting interval for "${lowerState}": ${newIntervals[lowerState]} ms`);
      AsyncStorage.setItem(`@interval_${lowerState}`, newIntervals[lowerState].toString())
        .then(() => {
          console.log(`Interval for "${lowerState}" saved to AsyncStorage.`);
        })
        .catch((error) => {
          console.error(`Failed to save interval for "${lowerState}":`, error);
        });
    });
    setIntervals(newIntervals);
    console.log('Intervals set to:', newIntervals);

    // Synchronize selectedAudios
    const newSelectedAudios: {
      [key: string]: { audios: string[]; mode: PlaybackMode };
    } = {};
    scene.states.forEach((state: string) => {
      if (typeof state !== 'string') {
        console.error(`Invalid state name: ${state}`);
        return;
      }
      const lowerState = state.toLowerCase();
      newSelectedAudios[lowerState] = scene.selectedAudios[lowerState] || {
        audios: [],
        mode: 'Selected',
      };
      console.log(`Setting selectedAudios for "${lowerState}":`, newSelectedAudios[lowerState]);
      AsyncStorage.setItem(
        `@selectedAudios_${lowerState}`,
        JSON.stringify(newSelectedAudios[lowerState])
      )
        .then(() => {
          console.log(`Selected audios for "${lowerState}" saved to AsyncStorage.`);
        })
        .catch((error) => {
          console.error(`Failed to save selected audios for "${lowerState}":`, error);
        });
    });
    setSelectedAudios(newSelectedAudios);
    console.log('Selected audios set to:', newSelectedAudios);

    setDataLoaded(true);
  };

  // Load data on mount
  useEffect(() => {
    console.log('useEffect running, dataLoaded:', dataLoaded);

    const loadData = async () => {
      if (dataLoaded) {
        // Data has already been loaded from a scene; skip loading from AsyncStorage
        return;
      }

      try {
        // Load states
        const storedStates = await AsyncStorage.getItem('@states');
        if (storedStates) {
          const parsedStates: string[] = JSON.parse(storedStates);
          if (parsedStates.length > 0) {
            setStates(parsedStates);
            console.log('Loaded states from AsyncStorage:', parsedStates);
          }
        }

        // Load intervals
        const loadedIntervals: { [key: string]: number } = {};
        for (const state of states) {
          if (!state || typeof state !== 'string') {
            console.error('Encountered invalid state:', state);
            continue;
          }
          const lowerState = state.toLowerCase();
          const storedInterval = await AsyncStorage.getItem(`@interval_${lowerState}`);
          if (storedInterval !== null) {
            const parsedInterval = parseInt(storedInterval, 10);
            if (!isNaN(parsedInterval)) {
              loadedIntervals[lowerState] = parsedInterval;
              console.log(`Loaded interval for "${lowerState}": ${parsedInterval} ms`);
            }
          }
        }
        setIntervals(loadedIntervals);
        console.log('Loaded intervals:', loadedIntervals);

        // Load selectedAudios
        const loadedSelectedAudios: {
          [key: string]: { audios: string[]; mode: PlaybackMode };
        } = {};
        for (const state of states) {
          if (!state || typeof state !== 'string') {
            console.error('Encountered invalid state:', state);
            continue;
          }
          const lowerState = state.toLowerCase();
          const storedAudios = await AsyncStorage.getItem(`@selectedAudios_${lowerState}`);
          if (storedAudios) {
            const parsedAudios = JSON.parse(storedAudios);
            loadedSelectedAudios[lowerState] = parsedAudios;
            console.log(`Loaded selectedAudios for "${lowerState}":`, parsedAudios);
          } else {
            loadedSelectedAudios[lowerState] = { audios: [], mode: 'Selected' };
            console.log(`No selectedAudios found for "${lowerState}", initializing to default.`);
          }
        }
        setSelectedAudios(loadedSelectedAudios);
        console.log('Loaded selectedAudios:', loadedSelectedAudios);

        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, [dataLoaded, states]);

  // Save states when they change
  useEffect(() => {
    if (states.length > 0) {
      AsyncStorage.setItem('@states', JSON.stringify(states))
        .then(() => {
          console.log('States saved to AsyncStorage:', states);
        })
        .catch((error) => {
          console.error('Failed to save states:', error);
        });
    }
  }, [states]);

  // Save intervals when they change
  useEffect(() => {
    Object.entries(intervals).forEach(([state, interval]) => {
      AsyncStorage.setItem(`@interval_${state}`, interval.toString())
        .then(() => {
          console.log(`Interval for "${state}" saved to AsyncStorage: ${interval} ms`);
        })
        .catch((error) => {
          console.error(`Failed to save interval for "${state}":`, error);
        });
    });
  }, [intervals]);

  // Save selectedAudios when they change
  useEffect(() => {
    Object.entries(selectedAudios).forEach(([state, data]) => {
      AsyncStorage.setItem(
        `@selectedAudios_${state}`,
        JSON.stringify(data)
      )
        .then(() => {
          console.log(`Selected audios for "${state}" saved to AsyncStorage.`);
        })
        .catch((error) => {
          console.error(`Failed to save selected audios for "${state}":`, error);
        });
    });
  }, [selectedAudios]);

  return (
    <IntervalContext.Provider
      value={{
        intervals,
        setIntervals,
        setIntervalForState,
        selectedAudios,
        setSelectedAudios,
        setSelectedAudiosForState,
        loadSceneData,
        states,
        setStates,
      }}
    >
      {children}
    </IntervalContext.Provider>
  );
};

export default SceneProvider;
