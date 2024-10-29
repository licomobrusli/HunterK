// src/config/debrief/DebriefingsProvider.tsx

import React, { useState, useEffect, ReactNode } from 'react';
import RNFS from 'react-native-fs';
import { Debriefing } from '../../types/Debriefing';
import { DebriefingsContext } from './DebriefingsContext';
import { Alert } from 'react-native';

interface DebriefingsProviderProps {
  children: ReactNode;
}

const DEBRIEFS_DIR = `${RNFS.DocumentDirectoryPath}/debriefs`;

export const DebriefingsProvider: React.FC<DebriefingsProviderProps> = ({ children }) => {
  const [debriefings, setDebriefings] = useState<Debriefing[]>([]);

  useEffect(() => {
    const loadDebriefings = async () => {
      try {
        const debriefsDirExists = await RNFS.exists(DEBRIEFS_DIR);
        if (!debriefsDirExists) {
          await RNFS.mkdir(DEBRIEFS_DIR);
        }

        // Load debriefs from filesystem
        const files = await RNFS.readDir(DEBRIEFS_DIR);
        const debriefingFiles = files.filter(file => file.name.endsWith('.json'));

        const loadedDebriefings = [];
        for (const file of debriefingFiles) {
          const content = await RNFS.readFile(file.path, 'utf8');
          loadedDebriefings.push(JSON.parse(content));
        }

        setDebriefings(loadedDebriefings);
      } catch (error) {
        console.error('Failed to load debriefings from filesystem:', error);
        Alert.alert('Error', 'Failed to load debriefings.');
      }
    };

    loadDebriefings();
  }, []);

  const addDebriefing = async (debriefing: Debriefing) => {
    const updatedDebriefings = [...debriefings, debriefing];
    setDebriefings(updatedDebriefings);

    // Save each debriefing to its own file in the filesystem
    const filePath = `${DEBRIEFS_DIR}/${debriefing.id}.json`;
    await RNFS.writeFile(filePath, JSON.stringify(debriefing), 'utf8');
  };

  const removeDebriefing = async (id: string) => {
    const updatedDebriefings = debriefings.filter((deb) => deb.id !== id);
    setDebriefings(updatedDebriefings);

    // Remove the specific debriefing file from the filesystem
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
