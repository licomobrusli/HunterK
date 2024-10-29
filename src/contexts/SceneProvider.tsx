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
      repetitions?: number | null;
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
  selectedDebriefs: { [key: string]: string[] };
  setSelectedDebriefsForState: (stateName: string, debriefs: string[]) => void;
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
  selectedDebriefs: {},
  setSelectedDebriefsForState: () => {},
  loadSceneData: () => {},
  states: [],
  setStates: () => {},
});

type SceneProviderProps = {
  children: ReactNode;
};

const SceneProvider: React.FC<SceneProviderProps> = ({ children }) => {
  const [states, setStates] = useState<string[]>(['Active', 'Spotted', 'Proximity', 'Trigger']);
  const [intervals, setIntervals] = useState<{ [key: string]: number | null }>({});
  const [selectedAudios, setSelectedAudios] = useState<{
    [key: string]: { audios: string[]; mode: PlaybackMode; repetitions?: number | null };
  }>({});
  const [selectedDebriefs, setSelectedDebriefs] = useState<{ [key: string]: string[] }>({});
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  const setIntervalForState = (stateName: string, interval: number | null) => {
    setIntervals((prev) => ({
      ...prev,
      [stateName.toLowerCase()]: interval,
    }));
  };

  const setSelectedAudiosForState = (
    stateName: string,
    data: { audios: string[]; mode: PlaybackMode; repetitions?: number | null }
  ) => {
    setSelectedAudios((prev) => ({
      ...prev,
      [stateName.toLowerCase()]: data,
    }));
  };

  const setSelectedDebriefsForState = (stateName: string, debriefs: string[]) => {
    setSelectedDebriefs((prev) => ({
      ...prev,
      [stateName.toLowerCase()]: debriefs,
    }));
  };

  const loadSceneData = (scene: Scene) => {
    console.log('Loading scene data:', scene);

    if (scene.states && scene.states.length > 0) {
      setStates(scene.states);
    }

    if (scene.intervals) {
      setIntervals(scene.intervals);
    }

    if (scene.selectedAudios) {
      setSelectedAudios(scene.selectedAudios);
    }

    if (scene.selectedDebriefs) {
      setSelectedDebriefs(scene.selectedDebriefs);
    }

    setDataLoaded(true);
  };

  useEffect(() => {
    if (dataLoaded) {
      return;
    }

    const loadData = async () => {
      try {
        const storedStates = await AsyncStorage.getItem('@states');
        if (storedStates) {
          const parsedStates: string[] = JSON.parse(storedStates);
          if (parsedStates.length > 0) {setStates(parsedStates);}
        }

        const loadedIntervals: { [key: string]: number | null } = {};
        for (const state of states) {
          const lowerState = state.toLowerCase();
          const storedInterval = await AsyncStorage.getItem(`@interval_${lowerState}`);
          loadedIntervals[lowerState] = storedInterval === 'null' ? null : parseInt(storedInterval || '0', 10);
        }
        setIntervals(loadedIntervals);

        const loadedSelectedAudios: {
          [key: string]: { audios: string[]; mode: PlaybackMode; repetitions?: number | null };
        } = {};
        for (const state of states) {
          const lowerState = state.toLowerCase();
          const storedAudios = await AsyncStorage.getItem(`@selectedAudios_${lowerState}`);
          if (storedAudios) {
            loadedSelectedAudios[lowerState] = JSON.parse(storedAudios);
          }
        }
        setSelectedAudios(loadedSelectedAudios);

        const loadedSelectedDebriefs: { [key: string]: string[] } = {};
        for (const state of states) {
          const lowerState = state.toLowerCase();
          const storedDebriefs = await AsyncStorage.getItem(`@selectedDebriefs_${lowerState}`);
          if (storedDebriefs) {
            loadedSelectedDebriefs[lowerState] = JSON.parse(storedDebriefs);
          }
        }
        setSelectedDebriefs(loadedSelectedDebriefs);

        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, [dataLoaded, states]);

  useEffect(() => {
    if (dataLoaded && states.length > 0) {
      const timer = setTimeout(() => {
        AsyncStorage.setItem('@states', JSON.stringify(states)).catch((error) => {
          console.error('Failed to save states:', error);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [states, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      const timer = setTimeout(() => {
        Object.entries(intervals).forEach(([state, interval]) => {
          AsyncStorage.setItem(`@interval_${state}`, interval === null ? 'null' : interval.toString()).catch((error) => {
            console.error(`Failed to save interval for "${state}":`, error);
          });
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [intervals, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      const timer = setTimeout(() => {
        Object.entries(selectedAudios).forEach(([state, data]) => {
          AsyncStorage.setItem(`@selectedAudios_${state}`, JSON.stringify(data)).catch((error) => {
            console.error(`Failed to save selected audios for "${state}":`, error);
          });
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedAudios, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      const timer = setTimeout(() => {
        Object.entries(selectedDebriefs).forEach(([state, debriefs]) => {
          AsyncStorage.setItem(`@selectedDebriefs_${state}`, JSON.stringify(debriefs)).catch((error) => {
            console.error(`Failed to save selected debriefs for "${state}":`, error);
          });
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedDebriefs, dataLoaded]);

  return (
    <IntervalContext.Provider
      value={{
        intervals,
        setIntervals,
        setIntervalForState,
        selectedAudios,
        setSelectedAudios,
        setSelectedAudiosForState,
        selectedDebriefs,
        setSelectedDebriefsForState,
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
