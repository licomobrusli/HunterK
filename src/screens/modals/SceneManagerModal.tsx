// src/screens/modals/SceneManagerModal.tsx

import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { IntervalContext } from '../../contexts/SceneProvider';
import { Scene } from '../../types/Scene';
import { sanitizeFileName } from '../../config/sanitizer';
import AppModal from '../../styles/AppModal';
import { getSceneList, exportScene, importScene } from '../../config/SceneStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commonStyles } from '../../styles/commonStyles';
import { textStyles } from '../../styles/textStyles';
import { containerStyles } from '../../styles/containerStyles';
import { buttonStyles } from '../../styles/buttonStyles';
import Bin from '../../assets/icons/bin.svg';
import Download from '../../assets/icons/download.svg';
import Upload from '../../assets/icons/upload.svg';
import Save from '../../assets/icons/save.svg';

type SceneManagerModalProps = {
  visible: boolean;
  onClose: () => void;
};

const SceneManagerModal: React.FC<SceneManagerModalProps> = ({ visible, onClose }) => {
  const {
    states,
    intervals,
    selectedAudios,
    selectedDebriefs,
    loadSceneData,
  } = useContext(IntervalContext);

  const [sceneName, setSceneName] = useState<string>('');
  const [sceneList, setSceneList] = useState<string[]>([]);

  // Memoized fetchSceneList function
  const fetchSceneList = useCallback(async () => {
    try {
      const scenes = await getSceneList();
      console.log('Fetched scene list:', scenes);
      setSceneList(scenes);
    } catch (error) {
      console.error('Error fetching scene list:', error);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchSceneList();
    }
  }, [visible, fetchSceneList]);

  const handleSaveScene = async () => {
    if (!sceneName.trim()) {
      console.log('Scene name is empty. Aborting save.');
      return;
    }

    const trimmedName = sceneName.trim();
    const sanitizedSceneName = sanitizeFileName(trimmedName);

    if (sanitizedSceneName.length === 0) {
      console.log('Scene name contains invalid characters. Aborting save.');
      return;
    }

    if (sceneList.includes(sanitizedSceneName)) {
      console.log(`Scene "${sanitizedSceneName}" already exists. Overwriting.`);
    } else {
      console.log(`Saving new scene: "${sanitizedSceneName}".`);
    }

    const sceneToSave: Scene = {
      name: sanitizedSceneName,
      states: states,
      intervals: intervals,
      selectedAudios: selectedAudios,
      selectedDebriefs: selectedDebriefs,
    };

    console.log('Scene to save:', sceneToSave);

    try {
      await AsyncStorage.setItem(`@scene_${sanitizedSceneName}`, JSON.stringify(sceneToSave));
      console.log(`Scene "${sanitizedSceneName}" saved successfully.`);
      fetchSceneList();
      setSceneName('');
    } catch (error) {
      console.error(`Error saving scene "${sanitizedSceneName}":`, error);
    }
  };

  const handleLoadScene = async (selectedSceneName: string) => {
    try {
      console.log(`Attempting to load scene: "${selectedSceneName}".`);
      const sceneDataString = await AsyncStorage.getItem(`@scene_${selectedSceneName}`);
      if (sceneDataString) {
        const sceneData: Scene = JSON.parse(sceneDataString);
        console.log('Loaded scene data:', sceneData);
        loadSceneData(sceneData);
        console.log(`Scene "${selectedSceneName}" loaded successfully.`);
      } else {
        console.log(`Scene "${selectedSceneName}" does not exist.`);
      }
    } catch (error) {
      console.error(`Error loading scene "${selectedSceneName}":`, error);
    }
  };

  const handleDeleteScene = async (sceneNameToDelete: string) => {
    try {
      Alert.alert(
        'Delete Scene',
        `Are you sure you want to delete the scene "${sceneNameToDelete}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              console.log(`Attempting to delete scene: "${sceneNameToDelete}".`);
              await AsyncStorage.removeItem(`@scene_${sceneNameToDelete}`);
              console.log(`Scene "${sceneNameToDelete}" deleted successfully.`);
              fetchSceneList();
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error(`Error deleting scene "${sceneNameToDelete}":`, error);
    }
  };

  const handleExportScene = async (selectedSceneName: string) => {
    try {
      console.log(`Exporting scene: ${selectedSceneName}`);
      await exportScene(selectedSceneName);
      console.log(`Scene "${selectedSceneName}" exported successfully.`);
    } catch (error) {
      console.error(`Error exporting scene "${selectedSceneName}":`, error);
      Alert.alert('Export Error', `Failed to export scene "${selectedSceneName}".`);
    }
  };

  const handleImportScene = async () => {
    try {
      console.log('Importing scene...');
      await importScene();
      console.log('Scene imported successfully.');
      fetchSceneList();
    } catch (error) {
      console.error('Error importing scene:', error);
      Alert.alert('Import Error', 'Failed to import scene.');
    }
  };

  const renderSceneItem = ({ item }: { item: string }) => (
    <View style={containerStyles.itemContainer}>
      <TouchableOpacity onPress={() => handleLoadScene(item)} style={containerStyles.list}>
        <Text style={textStyles.text0}>{item}</Text>
      </TouchableOpacity>
      <View style={containerStyles.containerRight}>
        <TouchableOpacity onPress={() => handleExportScene(item)} style={buttonStyles.iconButton}>
          <Upload width={18} height={18} fill="#fff" stroke="#004225" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteScene(item)} style={buttonStyles.iconButton}>
          <Bin width={18} height={18} fill="#fff" stroke="#004225" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <AppModal isVisible={visible} onClose={onClose}>
      <Text style={textStyles.boldText0}>Scene Management</Text>

      {/* Save Scene Section */}
      <View style={containerStyles.itemContainer}>
        <TextInput
          style={[commonStyles.textInput, containerStyles.list]}
          placeholder="Enter scene name"
          value={sceneName}
          onChangeText={setSceneName}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity
          onPress={handleSaveScene}
          style={buttonStyles.iconButton}
          accessibilityLabel="Save current scene"
          accessibilityRole="button"
        >
          <View style={buttonStyles.iconButton}>
            <Save width={18} height={18} fill="#fff" stroke="#004225" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Import Button */}
      <View style={containerStyles.itemContainer}>
        <Text style={[textStyles.boldText0, containerStyles.list]}>Import Scene</Text>
        <TouchableOpacity onPress={handleImportScene} style={buttonStyles.iconButton}>
          <Download width={18} height={18} fill="#fff" stroke="#004225" />
        </TouchableOpacity>
      </View>

      {/* Load Scene Section */}
      <View style={containerStyles.container}>
        <Text style={textStyles.boldText1}>Saved Scenes:</Text>
        <FlatList
          data={sceneList}
          keyExtractor={(item) => item}
          renderItem={renderSceneItem}
          ListEmptyComponent={<Text style={textStyles.text0}>No saved scenes.</Text>}
          style={containerStyles.list}
        />
      </View>
    </AppModal>
  );
};

export default SceneManagerModal;
