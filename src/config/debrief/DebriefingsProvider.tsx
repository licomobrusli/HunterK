// src/config/debrief/DebriefingsProvider.tsx

import React, { useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Debriefing } from '../../types/Debriefing';
import { DebriefingsContext } from './DebriefingsContext';
import RNFS from 'react-native-fs';
import { Alert } from 'react-native';

interface DebriefingsProviderProps {
  children: ReactNode;
}

const DEBRIEFINGS_STORAGE_KEY = '@debriefings_storage_key';
const DEBRIEFS_DIR = `${RNFS.DocumentDirectoryPath}/debriefs`;

export const DebriefingsProvider: React.FC<DebriefingsProviderProps> = ({ children }) => {
  const [debriefings, setDebriefings] = useState<Debriefing[]>([]);

  // Load debriefings from AsyncStorage and ensure directory exists
  useEffect(() => {
    const loadDebriefings = async () => {
      try {
        // Ensure the 'debriefs' directory exists
        const debriefsDirExists = await RNFS.exists(DEBRIEFS_DIR);
        if (!debriefsDirExists) {
          await RNFS.mkdir(DEBRIEFS_DIR);
        }

        const storedDebriefings = await AsyncStorage.getItem(DEBRIEFINGS_STORAGE_KEY);
        if (storedDebriefings !== null) {
          setDebriefings(JSON.parse(storedDebriefings));
        }
      } catch (error) {
        console.error('Failed to load debriefings from storage:', error);
        Alert.alert('Error', 'Failed to load debriefings.');
      }
    };

    loadDebriefings();
  }, []);

  // Function to save debriefings to both AsyncStorage and a file in 'debriefs' directory
  const saveDebriefingsToStorage = async (debriefingsToSave: Debriefing[]) => {
    try {
      await AsyncStorage.setItem(DEBRIEFINGS_STORAGE_KEY, JSON.stringify(debriefingsToSave));
      // Optionally, save a file for each debriefing in the 'debriefs' directory
      for (const debriefing of debriefingsToSave) {
        const filePath = `${DEBRIEFS_DIR}/${debriefing.id}.json`;
        await RNFS.writeFile(filePath, JSON.stringify(debriefing), 'utf8');
      }
    } catch (error) {
      console.error('Failed to save debriefings to storage:', error);
      Alert.alert('Error', 'Failed to save debriefings.');
    }
  };

  // Function to add a new debriefing
  const addDebriefing = async (debriefing: Debriefing) => {
    const updatedDebriefings = [...debriefings, debriefing];
    setDebriefings(updatedDebriefings);
    await saveDebriefingsToStorage(updatedDebriefings);
  };

  // Function to remove a debriefing by ID
  const removeDebriefing = async (id: string) => {
    const updatedDebriefings = debriefings.filter((deb) => deb.id !== id);
    setDebriefings(updatedDebriefings);
    await saveDebriefingsToStorage(updatedDebriefings);

    // Remove the specific debriefing file from the 'debriefs' directory
    const filePath = `${DEBRIEFS_DIR}/${id}.json`;
    const fileExists = await RNFS.exists(filePath);
    if (fileExists) {
      await RNFS.unlink(filePath);
    }
  };

  return (
    <DebriefingsContext.Provider value={{ debriefings, addDebriefing, removeDebriefing }}>
      {children}
    </DebriefingsContext.Provider>
  );
};
