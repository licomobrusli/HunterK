// src/screens/modals/SceneManagerModal.tsx

import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { commonStyles } from '../../styles/commonStyles';
import { IntervalContext } from '../../contexts/SceneProvider';
import { Scene } from '../../types/Scene';
import { sanitizeFileName } from '../../config/sanitizer';
import AppModal from '../../styles/AppModal'; // Correct import path
import { getSceneList, exportScene, importScene } from '../../config/SceneStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SceneManagerModalProps = {
  visible: boolean;
  onClose: () => void;
};

const SceneManagerModal: React.FC<SceneManagerModalProps> = ({ visible, onClose }) => {
  const { states, intervals, selectedAudios, loadSceneData } = useContext(IntervalContext);
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

    // Check if scene already exists
    if (sceneList.includes(sanitizedSceneName)) {
      console.log(`Scene "${sanitizedSceneName}" already exists. Overwriting.`);
      // Optionally, prompt the user before overwriting
    } else {
      console.log(`Saving new scene: "${sanitizedSceneName}".`);
    }

    const sceneToSave: Scene = {
      name: sanitizedSceneName,
      states: states,
      intervals: intervals,
      selectedAudios: selectedAudios,
    };

    console.log('Scene to save:', sceneToSave);

    try {
      // Save the scene using saveScene function
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

  // Handle export
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

  // Handle import
  const handleImportScene = async () => {
    try {
      console.log('Importing scene...');
      await importScene();
      console.log('Scene imported successfully.');
      fetchSceneList(); // Refresh the scene list
    } catch (error) {
      console.error('Error importing scene:', error);
      Alert.alert('Import Error', 'Failed to import scene.');
    }
  };

  const renderSceneItem = ({ item }: { item: string }) => (
    <View style={styles.sceneItemContainer}>
      <TouchableOpacity onPress={() => handleLoadScene(item)} style={commonStyles.sceneItem}>
        <Text style={commonStyles.itemText}>{item}</Text>
      </TouchableOpacity>
      <View style={styles.sceneItemButtons}>
        <TouchableOpacity onPress={() => handleExportScene(item)} style={styles.exportButton}>
          <Icon name="upload" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteScene(item)} style={styles.deleteButton}>
          <Icon name="trash-2" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <AppModal
      isVisible={visible}
      onClose={onClose}
      animationIn="fadeIn"
      animationOut="fadeOut"
    >
      <Text style={commonStyles.title}>Scene Management</Text>

      {/* Save Scene Section */}
      <View style={styles.inputRow}>
        <TextInput
          style={commonStyles.textInput}
          placeholder="Enter scene name"
          value={sceneName}
          onChangeText={setSceneName}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity
          onPress={handleSaveScene}
          style={styles.saveButton}
          accessibilityLabel="Save current scene"
          accessibilityRole="button"
        >
          <Icon name="save" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Import Button */}
      <TouchableOpacity onPress={handleImportScene} style={styles.importButton}>
        <Icon name="download" size={24} color="#fff" />
        <Text style={styles.buttonText}>Import Scene</Text>
      </TouchableOpacity>

      {/* Load Scene Section */}
      <View style={styles.section}>
        <Text style={commonStyles.modalTitle}>Saved Scenes:</Text>
        <FlatList
          data={sceneList}
          keyExtractor={(item) => item}
          renderItem={renderSceneItem}
          ListEmptyComponent={<Text style={commonStyles.text}>No saved scenes.</Text>}
          style={styles.flatList}
        />
      </View>

      {/* Removed the Close button since "X" is now in the header */}
    </AppModal>
  );
};

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  saveButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#008000', // Same as commonStyles.button background color
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  sceneItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    width: '100%',
    justifyContent: 'space-between',
  },
  sceneItemButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportButton: {
    backgroundColor: '#007BFF',
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    padding: 5,
    borderRadius: 5,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
  },
  flatList: {
    width: '100%',
  },
});

export default SceneManagerModal;
