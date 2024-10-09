// src/utils/SceneStorage.ts
import RNFS from 'react-native-fs';
import { Scene } from '../types/Scene';
import { sanitizeFileName } from './sanitizer';

const SCENES_FOLDER = `${RNFS.DocumentDirectoryPath}/scenes`;

export const saveScene = async (scene: Scene): Promise<void> => {
  try {
    // Ensure the scenes folder exists
    const folderExists = await RNFS.exists(SCENES_FOLDER);
    if (!folderExists) {
      await RNFS.mkdir(SCENES_FOLDER);
    }

    const sanitizedSceneName = sanitizeFileName(scene.name);

    if (sanitizedSceneName.length === 0) {
      throw new Error('Scene name is invalid after sanitization.');
    }

    const scenePath = `${SCENES_FOLDER}/${sanitizedSceneName}.json`;
    const sceneData = JSON.stringify(scene);
    await RNFS.writeFile(scenePath, sceneData, 'utf8');
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

    const scenePath = `${SCENES_FOLDER}/${sanitizedSceneName}.json`;
    const fileExists = await RNFS.exists(scenePath);
    if (!fileExists) {
      throw new Error('Scene file does not exist');
    }
    const sceneData = await RNFS.readFile(scenePath, 'utf8');
    const scene: Scene = JSON.parse(sceneData);
    return scene;
  } catch (error) {
    console.error('Error loading scene:', error);
    throw error;
  }
};

export const getSceneList = async (): Promise<string[]> => {
  try {
    const folderExists = await RNFS.exists(SCENES_FOLDER);
    if (!folderExists) {
      return [];
    }
    const files = await RNFS.readDir(SCENES_FOLDER);
    const sceneFiles = files.filter((file) => file.isFile() && file.name.endsWith('.json'));
    const sceneNames = sceneFiles.map((file) => file.name.replace('.json', ''));
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

    const scenePath = `${SCENES_FOLDER}/${sanitizedSceneName}.json`;
    const fileExists = await RNFS.exists(scenePath);
    if (fileExists) {
      await RNFS.unlink(scenePath);
    }
  } catch (error) {
    console.error('Error deleting scene:', error);
    throw error;
  }
};
