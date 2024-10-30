// src/utils/SceneStorage.ts

import RNFS from 'react-native-fs';
import { zip, unzip } from 'react-native-zip-archive';
import Share from 'react-native-share';
import DocumentPicker from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Scene } from '../types/Scene';
import { sanitizeFileName } from '../config/sanitizer';

const AUDIOS_DIR = `${RNFS.DocumentDirectoryPath}/audios`;
const DEBRIEFS_DIR = `${RNFS.DocumentDirectoryPath}/debriefs`;

export const saveScene = async (scene: Scene): Promise<void> => {
  try {
    const sanitizedSceneName = sanitizeFileName(scene.name);

    if (sanitizedSceneName.length === 0) {
      throw new Error('Scene name is invalid after sanitization.');
    }

    const sceneKey = `@scene_${sanitizedSceneName}`;
    const sceneData = JSON.stringify(scene);

    // Save the scene data to AsyncStorage
    await AsyncStorage.setItem(sceneKey, sceneData);
  } catch (error) {
    console.error('Error saving scene:', error);
    throw error;
  }
};

export const loadScene = async (sceneName: string): Promise<Scene> => {
  try {
    const sanitizedSceneName = sanitizeFileName(sceneName);

    if (sanitizedSceneName.length === 0) {
      throw new Error('Scene name is invalid after sanitization.');
    }

    const sceneKey = `@scene_${sanitizedSceneName}`;
    const sceneDataString = await AsyncStorage.getItem(sceneKey);
    if (!sceneDataString) {
      throw new Error('Scene does not exist');
    }
    const scene: Scene = JSON.parse(sceneDataString);
    return scene;
  } catch (error) {
    console.error('Error loading scene:', error);
    throw error;
  }
};

export const getSceneList = async (): Promise<string[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const sceneKeys = keys.filter((key) => key.startsWith('@scene_'));
    const sceneNames = sceneKeys.map((key) => key.replace('@scene_', ''));
    return sceneNames;
  } catch (error) {
    console.error('Error getting scene list:', error);
    throw error;
  }
};

export const deleteScene = async (sceneName: string): Promise<void> => {
  try {
    const sanitizedSceneName = sanitizeFileName(sceneName);

    if (sanitizedSceneName.length === 0) {
      throw new Error('Scene name is invalid after sanitization.');
    }

    const sceneKey = `@scene_${sanitizedSceneName}`;
    await AsyncStorage.removeItem(sceneKey);
  } catch (error) {
    console.error('Error deleting scene:', error);
    throw error;
  }
};

export const exportScene = async (sceneName: string): Promise<void> => {
  try {
    const sanitizedSceneName = sanitizeFileName(sceneName);

    if (sanitizedSceneName.length === 0) {
      throw new Error('Scene name is invalid after sanitization.');
    }

    // Read the scene data from AsyncStorage
    const sceneKey = `@scene_${sanitizedSceneName}`;
    const sceneDataString = await AsyncStorage.getItem(sceneKey);
    if (!sceneDataString) {
      throw new Error('Scene does not exist in AsyncStorage');
    }
    const sceneData: Scene = JSON.parse(sceneDataString);

    // Create a temporary directory
    const tempDir = `${RNFS.TemporaryDirectoryPath}/${sanitizedSceneName}_${Date.now()}`;
    await RNFS.mkdir(tempDir);

    // Write scene JSON file to temp directory
    const tempScenePath = `${tempDir}/scene.json`;
    await RNFS.writeFile(tempScenePath, sceneDataString, 'utf8');

    // Copy associated audio files to temp directory
    for (const state of sceneData.states) {
      const lowerState = state.toLowerCase();
      const audiosInfo = sceneData.selectedAudios[lowerState];
      if (audiosInfo && audiosInfo.audios) {
        for (let audioFileName of audiosInfo.audios) {
          // Ensure that audioFileName is just the file name
          if (audioFileName.includes('/')) {
            audioFileName = audioFileName.substring(audioFileName.lastIndexOf('/') + 1);
          }

          const sourceAudioPath = `${AUDIOS_DIR}/${lowerState}/${audioFileName}`;
          const destAudioDir = `${tempDir}/audios/${lowerState}`;
          const destAudioPath = `${destAudioDir}/${audioFileName}`;

          // Ensure destination directory exists
          await RNFS.mkdir(destAudioDir);

          const audioExists = await RNFS.exists(sourceAudioPath);
          if (audioExists) {
            await RNFS.copyFile(sourceAudioPath, destAudioPath);
          } else {
            console.warn(`Audio file does not exist: ${sourceAudioPath}`);
          }
        }
      }
    }

    // Copy associated debrief files to temp directory
    for (const state of sceneData.states) {
      const lowerState = state.toLowerCase();
      const selectedDebriefName = sceneData.selectedDebriefs[lowerState];
      if (selectedDebriefName) {
        const sourceDebriefPath = `${DEBRIEFS_DIR}/${selectedDebriefName}`;
        const destDebriefDir = `${tempDir}/debriefs`;
        const destDebriefPath = `${destDebriefDir}/${selectedDebriefName}`;

        // Ensure destination directory exists
        await RNFS.mkdir(destDebriefDir);

        const debriefExists = await RNFS.exists(sourceDebriefPath);
        if (debriefExists) {
          await RNFS.copyFile(sourceDebriefPath, destDebriefPath);
        } else {
          console.warn(`Debrief file does not exist: ${sourceDebriefPath}`);
        }
      }
    }

    // Create a zip archive of the temp directory
    const zipFilePath = `${RNFS.DocumentDirectoryPath}/${sanitizedSceneName}.zip`;
    await zip(tempDir, zipFilePath);

    // Share the zip file
    await Share.open({
      url: `file://${zipFilePath}`,
      type: 'application/zip',
      filename: `${sanitizedSceneName}.zip`,
    });

    // Cleanup
    await RNFS.unlink(tempDir);
    await RNFS.unlink(zipFilePath);
  } catch (error) {
    console.error('Error exporting scene:', error);
    throw error;
  }
};

export const importScene = async (): Promise<void> => {
  try {
    // Allow the user to pick a zip file
    const res = await DocumentPicker.pickSingle({
      type: [DocumentPicker.types.allFiles],
      copyTo: 'cachesDirectory',
    });

    const zipFilePath = res.fileCopyUri || res.uri;

    // Create a temporary directory
    const tempDir = `${RNFS.TemporaryDirectoryPath}/import_${Date.now()}`;
    await RNFS.mkdir(tempDir);

    // Extract the zip file to the temporary directory
    const extractedPath = await unzip(zipFilePath, tempDir);

    // Read scene.json
    const sceneJsonPath = `${extractedPath}/scene.json`;
    const sceneJsonExists = await RNFS.exists(sceneJsonPath);
    if (!sceneJsonExists) {
      throw new Error('scene.json not found in the zip archive');
    }

    const sceneDataString = await RNFS.readFile(sceneJsonPath, 'utf8');
    const sceneData: Scene = JSON.parse(sceneDataString);

    // Save scene data to AsyncStorage
    const sanitizedSceneName = sanitizeFileName(sceneData.name);
    const sceneKey = `@scene_${sanitizedSceneName}`;
    await AsyncStorage.setItem(sceneKey, sceneDataString);

    // Copy audio files to AUDIOS_DIR
    const audiosDirPath = `${extractedPath}/audios`;
    const audiosDirExists = await RNFS.exists(audiosDirPath);
    if (audiosDirExists) {
      const stateDirs = await RNFS.readDir(audiosDirPath);
      for (const stateDir of stateDirs) {
        if (stateDir.isDirectory()) {
          const stateName = stateDir.name;
          const audioFiles = await RNFS.readDir(stateDir.path);
          for (const audioFile of audioFiles) {
            if (audioFile.isFile()) {
              const destAudioDir = `${AUDIOS_DIR}/${stateName}`;
              const destAudioPath = `${destAudioDir}/${audioFile.name}`;

              // Ensure destination directory exists
              await RNFS.mkdir(destAudioDir);

              await RNFS.copyFile(audioFile.path, destAudioPath);
            }
          }
        }
      }
    }

    // Copy debrief files to DEBRIEFS_DIR
    const debriefsDirPath = `${extractedPath}/debriefs`;
    const debriefsDirExists = await RNFS.exists(debriefsDirPath);
    if (debriefsDirExists) {
      const debriefFiles = await RNFS.readDir(debriefsDirPath);
      for (const debriefFile of debriefFiles) {
        if (debriefFile.isFile()) {
          const destDebriefPath = `${DEBRIEFS_DIR}/${debriefFile.name}`;

          // Ensure destination directory exists
          await RNFS.mkdir(DEBRIEFS_DIR);

          await RNFS.copyFile(debriefFile.path, destDebriefPath);
        }
      }
    }

    // Cleanup
    await RNFS.unlink(tempDir);
  } catch (error) {
    if (!DocumentPicker.isCancel(error)) {
      console.error('Error importing scene:', error);
      throw error;
    }
    // If the user canceled the picker, do nothing
  }
};
