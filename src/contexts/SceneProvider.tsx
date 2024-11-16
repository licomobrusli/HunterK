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
  selectedDebriefs: { [key: string]: string | null };
  setSelectedDebriefsForState: (stateName: string, debrief: string | null) => void;
  loadSceneData: (scene: Scene) => void;
  states: string[];
  setStates: React.Dispatch<React.SetStateAction<string[]>>;

  // New additions for audio item intervals
  audioIntervals: { [stateName: string]: { [audioName: string]: number | null } };
  setAudioIntervals: React.Dispatch<
    React.SetStateAction<{ [stateName: string]: { [audioName: string]: number | null } }>
  >;
  setAudioIntervalForAudio: (stateName: string, audioName: string, interval: number | null) => void;
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
  // New additions
  audioIntervals: {},
  setAudioIntervals: () => {},
  setAudioIntervalForAudio: () => {},
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
  const [selectedDebriefs, setSelectedDebriefs] = useState<{ [key: string]: string | null }>({});
  const [audioIntervals, setAudioIntervals] = useState<{
    [stateName: string]: { [audioName: string]: number | null };
  }>({});
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

  const setSelectedDebriefsForState = (stateName: string, debrief: string | null) => {
    setSelectedDebriefs((prev) => ({
      ...prev,
      [stateName.toLowerCase()]: debrief,
    }));
  };

  const setAudioIntervalForAudio = (
    stateName: string,
    audioName: string,
    interval: number | null
  ) => {
    setAudioIntervals((prev) => ({
      ...prev,
      [stateName.toLowerCase()]: {
        ...prev[stateName.toLowerCase()],
        [audioName.toLowerCase()]: interval,
      },
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

    // Load audio intervals if present in the scene
    if (scene.audioIntervals) {
      setAudioIntervals(scene.audioIntervals);
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
        let parsedStates: string[] = ['Active', 'Spotted', 'Proximity', 'Trigger']; // Default states

        if (storedStates) {
          parsedStates = JSON.parse(storedStates);
          if (parsedStates.length > 0) {
            setStates(parsedStates);
          }
        }

        const loadedIntervals: { [key: string]: number | null } = {};
        const loadedSelectedAudios: {
          [key: string]: { audios: string[]; mode: PlaybackMode; repetitions?: number | null };
        } = {};
        const loadedSelectedDebriefs: { [key: string]: string | null } = {};
        const loadedAudioIntervals: {
          [key: string]: { [audioName: string]: number | null };
        } = {};

        for (const state of parsedStates) {
          const lowerState = state.toLowerCase();

          // Load intervals
          const storedInterval = await AsyncStorage.getItem(`@interval_${lowerState}`);
          loadedIntervals[lowerState] =
            storedInterval === 'null' ? null : parseInt(storedInterval || '0', 10);

          // Load selected audios
          const storedAudios = await AsyncStorage.getItem(`@selectedAudios_${lowerState}`);
          if (storedAudios) {
            loadedSelectedAudios[lowerState] = JSON.parse(storedAudios);
          }

          // Load selected debriefs
          const storedDebrief = await AsyncStorage.getItem(`@selectedDebriefs_${lowerState}`);
          if (storedDebrief) {
            loadedSelectedDebriefs[lowerState] =
              storedDebrief === 'null' ? null : storedDebrief;
          } else {
            loadedSelectedDebriefs[lowerState] = null;
          }

          // Load audio intervals
          const storedAudioIntervals = await AsyncStorage.getItem(
            `@audioIntervals_${lowerState}`
          );
          if (storedAudioIntervals) {
            const parsedAudioIntervals = JSON.parse(storedAudioIntervals);
            // Ensure that null values are correctly parsed
            const audioIntervalsForState: { [audioName: string]: number | null } = {};
            Object.entries(parsedAudioIntervals).forEach(([audioName, interval]) => {
              audioIntervalsForState[audioName] =
                interval === null ? null : Number(interval);
            });
            loadedAudioIntervals[lowerState] = audioIntervalsForState;
          } else {
            loadedAudioIntervals[lowerState] = {};
          }
        }

        setIntervals(loadedIntervals);
        setSelectedAudios(loadedSelectedAudios);
        setSelectedDebriefs(loadedSelectedDebriefs);
        setAudioIntervals(loadedAudioIntervals);

        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, [dataLoaded]);

  // Save states to AsyncStorage
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

  // Save intervals to AsyncStorage
  useEffect(() => {
    if (dataLoaded) {
      const timer = setTimeout(() => {
        Object.entries(intervals).forEach(([state, interval]) => {
          console.log(`Saving interval for state: ${state}`, interval); // Debug log
          AsyncStorage.setItem(
            `@interval_${state}`,
            interval === null ? 'null' : interval.toString()
          ).catch((error) => {
            console.error(`Failed to save interval for "${state}":`, error);
          });
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [intervals, dataLoaded]);

  // Save selected audios to AsyncStorage
  useEffect(() => {
    if (dataLoaded) {
      const timer = setTimeout(() => {
        Object.entries(selectedAudios).forEach(([state, data]) => {
          console.log(`Saving selectedAudios for state: ${state}`, data); // Debug log
          AsyncStorage.setItem(`@selectedAudios_${state}`, JSON.stringify(data)).catch(
            (error) => {
              console.error(`Failed to save selected audios for "${state}":`, error);
            }
          );
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedAudios, dataLoaded]);

  // Save selected debriefs to AsyncStorage
  useEffect(() => {
    if (dataLoaded) {
      const timer = setTimeout(() => {
        Object.entries(selectedDebriefs).forEach(([state, debrief]) => {
          console.log(`Saving selectedDebriefs for state: ${state}`, debrief); // Debug log
          AsyncStorage.setItem(
            `@selectedDebriefs_${state}`,
            debrief === null ? 'null' : debrief
          ).catch((error) => {
            console.error(`Failed to save selected debrief for "${state}":`, error);
          });
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedDebriefs, dataLoaded]);

  // Save audio intervals to AsyncStorage
  useEffect(() => {
    if (dataLoaded) {
      const timer = setTimeout(() => {
        Object.entries(audioIntervals).forEach(([state, audioMap]) => {
          console.log(`Saving audioIntervals for state: ${state}`, audioMap); // Debug log

          // Convert audioMap to an object where null values are preserved
          const serializableAudioMap = Object.fromEntries(
            Object.entries(audioMap).map(([audioName, interval]) => [audioName, interval])
          );

          AsyncStorage.setItem(
            `@audioIntervals_${state}`,
            JSON.stringify(serializableAudioMap)
          ).catch((error) => {
            console.error(`Failed to save audio intervals for "${state}":`, error);
          });
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [audioIntervals, dataLoaded]);

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
        // New additions
        audioIntervals,
        setAudioIntervals,
        setAudioIntervalForAudio,
      }}
    >
      {children}
    </IntervalContext.Provider>
  );
};

export default SceneProvider;
