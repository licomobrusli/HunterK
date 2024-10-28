// src/contexts/SceneProvider.tsx

import React, { useState, useEffect, createContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Scene } from '../types/Scene';
import { PlaybackMode } from '../types/PlaybackMode';

type IntervalContextType = {
  intervals: { [key: string]: number | null };
  setIntervals: React.Dispatch<React.SetStateAction<{ [key: string]: number | null }>>;
  setIntervalForState: (stateName: string, interval: number | null) => void;
  selectedAudios: {
    [key: string]: {
      audios: string[];
      mode: PlaybackMode;
      repetitions?: number | null; // Include repetitions here
    };
  };
  setSelectedAudios: React.Dispatch<
    React.SetStateAction<{
      [key: string]: { audios: string[]; mode: PlaybackMode; repetitions?: number | null };
    }>
  >;
  setSelectedAudiosForState: (
    stateName: string,
    data: { audios: string[]; mode: PlaybackMode; repetitions?: number | null }
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

  const [intervals, setIntervals] = useState<{ [key: string]: number | null }>({});
  const [selectedAudios, setSelectedAudios] = useState<{
    [key: string]: { audios: string[]; mode: PlaybackMode };
  }>({});

  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  const setIntervalForState = (stateName: string, interval: number | null) => {
    setIntervals((prev) => {
      const newIntervals = { ...prev, [stateName.toLowerCase()]: interval };
      if (prev[stateName.toLowerCase()] !== interval) {
        console.log(`Set interval for "${stateName}": ${interval === null ? 'null' : interval + ' ms'}`);
      }
      return newIntervals;
    });
  };

  const setSelectedAudiosForState = (
    stateName: string,
    data: { audios: string[]; mode: PlaybackMode; repetitions?: number | null }
  ) => {
    setSelectedAudios((prev) => {
      const newSelectedAudios = { ...prev, [stateName.toLowerCase()]: data };
      if (JSON.stringify(prev[stateName.toLowerCase()]) !== JSON.stringify(data)) {
        console.log(`Set selected audios for "${stateName}"`);
      }
      return newSelectedAudios;
    });
  };

  const loadSceneData = (scene: Scene) => {
    console.log('Loading scene data:', scene);

    // Update states
    if (scene.states && scene.states.length > 0) {
      setStates(scene.states);
    }

    // Update intervals
    if (scene.intervals) {
      setIntervals(scene.intervals);
    }

    // Update selectedAudios
    if (scene.selectedAudios) {
      setSelectedAudios(scene.selectedAudios);
    }

    // Optionally, persist the loaded scene data to AsyncStorage
    setDataLoaded(true);
  };

  // Load data on mount
  useEffect(() => {
    if (dataLoaded) {
      return;
    }

    console.log('SceneProvider useEffect running, dataLoaded:', dataLoaded);

    const loadData = async () => {
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
        const loadedIntervals: { [key: string]: number | null } = {};
        for (const state of states) {
          const lowerState = state.toLowerCase();
          const storedInterval = await AsyncStorage.getItem(`@interval_${lowerState}`);
          loadedIntervals[lowerState] =
            storedInterval === 'null' ? null : parseInt(storedInterval || '0', 10);
          console.log(
            `Loaded interval for "${lowerState}": ${loadedIntervals[lowerState] === null ? 'null' : loadedIntervals[lowerState] + ' ms'}`
          );
        }
        setIntervals(loadedIntervals);

        // Load selectedAudios
        const loadedSelectedAudios: {
          [key: string]: { audios: string[]; mode: PlaybackMode };
        } = {};
        for (const state of states) {
          const lowerState = state.toLowerCase();
          const storedAudios = await AsyncStorage.getItem(`@selectedAudios_${lowerState}`);
          if (storedAudios) {
            loadedSelectedAudios[lowerState] = JSON.parse(storedAudios);
            console.log(`Loaded selectedAudios for "${lowerState}":`, loadedSelectedAudios[lowerState]);
          }
        }
        setSelectedAudios(loadedSelectedAudios);

        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, [dataLoaded, states]);

  // Save states when they change, with debounce
  useEffect(() => {
    if (dataLoaded && states.length > 0) {
      const timer = setTimeout(() => {
        AsyncStorage.setItem('@states', JSON.stringify(states))
          .then(() => {
            console.log('States saved to AsyncStorage:', states);
          })
          .catch((error) => {
            console.error('Failed to save states:', error);
          });
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timer);
    }
  }, [states, dataLoaded]);

  // Save intervals when they change, with debounce
  useEffect(() => {
    if (dataLoaded) {
      const timer = setTimeout(() => {
        Object.entries(intervals).forEach(([state, interval]) => {
          const intervalValue = interval === null ? 'null' : interval.toString();
          AsyncStorage.setItem(`@interval_${state}`, intervalValue)
            .then(() => {
              console.log(`Interval for "${state}" saved to AsyncStorage: ${intervalValue}`);
            })
            .catch((error) => {
              console.error(`Failed to save interval for "${state}":`, error);
            });
        });
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timer);
    }
  }, [intervals, dataLoaded]);

  // Save selectedAudios when they change, with debounce
  useEffect(() => {
    if (dataLoaded) {
      const timer = setTimeout(() => {
        Object.entries(selectedAudios).forEach(([state, data]) => {
          AsyncStorage.setItem(`@selectedAudios_${state}`, JSON.stringify(data))
            .then(() => {
              console.log(`Selected audios for "${state}" saved to AsyncStorage.`);
            })
            .catch((error) => {
              console.error(`Failed to save selected audios for "${state}":`, error);
            });
        });
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timer);
    }
  }, [selectedAudios, dataLoaded]);

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
