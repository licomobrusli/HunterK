// src/utils/storageUtils.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadFromStorage = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return null;
  }
};

export const saveToStorage = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

export const deleteFromStorage = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error deleting ${key} from storage:`, error);
  }
};
