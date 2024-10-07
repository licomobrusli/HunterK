// src/contexts/SceneProvider.tsx
import React, { useState, useEffect, createContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type IntervalContextType = {
  intervals: { [key: string]: number };
  setIntervalForState: (stateName: string, interval: number) => void;
};

export const IntervalContext = createContext<IntervalContextType>({
  intervals: {
    active: 5000,
    spotted: 6000,
    proximity: 7000,
    trigger: 8000,
  },
  setIntervalForState: () => {},
});

type SceneProviderProps = {
  children: ReactNode;
};

const STATES = ['Active', 'Spotted', 'Proximity', 'Trigger'];

const SceneProvider: React.FC<SceneProviderProps> = ({ children }) => {
  const [intervals, setIntervals] = useState({
    active: 5000,
    spotted: 6000,
    proximity: 7000,
    trigger: 8000,
  });

  const setIntervalForState = (stateName: string, interval: number) => {
    setIntervals((prev) => ({
      ...prev,
      [stateName.toLowerCase()]: interval,
    }));
  };

  // Load intervals from AsyncStorage on mount
  useEffect(() => {
    const loadIntervals = async () => {
      try {
        const loadedIntervals: { [key: string]: number } = {};
        for (const state of STATES) {
          const storedInterval = await AsyncStorage.getItem(`@interval_${state.toLowerCase()}`);
          if (storedInterval !== null) {
            const parsedInterval = parseInt(storedInterval, 10);
            if (!isNaN(parsedInterval)) {
              loadedIntervals[state.toLowerCase()] = parsedInterval;
            }
          }
        }
        setIntervals((prev) => ({ ...prev, ...loadedIntervals }));
      } catch (error) {
        console.error('Failed to load intervals', error);
      }
    };

    loadIntervals();
  }, []);


  return (
    <IntervalContext.Provider value={{ intervals, setIntervalForState }}>
      {children}
    </IntervalContext.Provider>
  );
};

export default SceneProvider;
