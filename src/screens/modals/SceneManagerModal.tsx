// src/screens/modals/SceneManagerModal.tsx

import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commonStyles } from '../../styles/commonStyles';
import { IntervalContext } from '../../contexts/SceneProvider';
import { Scene } from '../../types/Scene';
import { sanitizeFileName } from '../../config/sanitizer';
import AppModal from '../../styles/AppModal'; // Correct import path

type SceneManagerModalProps = {
  visible: boolean;
  onClose: () => void;
};

const SceneManagerModal: React.FC<SceneManagerModalProps> = ({ visible, onClose }) => {
  const { states, loadSceneData, intervals, selectedAudios } = useContext(IntervalContext);
  const [sceneName, setSceneName] = useState<string>('');
  const [sceneList, setSceneList] = useState<string[]>([]);

  // Function to get scene list
  const getSceneList = async (): Promise<string[]> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const sceneKeys = keys.filter((key) => key.startsWith('@scene_'));
      const sceneNames = sceneKeys.map((key) => key.replace('@scene_', ''));
      return sceneNames;
    } catch (error) {
      console.error('Error retrieving scene list:', error);
      return [];
    }
  };

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
      // Proceed to overwrite
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
      await AsyncStorage.setItem(`@scene_${sanitizedSceneName}`, JSON.stringify(sceneToSave));
      console.log(`Scene "${sanitizedSceneName}" saved successfully.`);
      fetchSceneList();
      setSceneName('');

      // Optionally, show a success message within the modal
      // You can integrate a message component similar to RecordAudioModal
    } catch (error) {
      console.error(`Error saving scene "${sanitizedSceneName}":`, error);
      // Optionally, show an error message within the modal
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
      console.log(`Attempting to delete scene: "${sceneNameToDelete}".`);
      await AsyncStorage.removeItem(`@scene_${sceneNameToDelete}`);
      console.log(`Scene "${sceneNameToDelete}" deleted successfully.`);
      fetchSceneList();
    } catch (error) {
      console.error(`Error deleting scene "${sceneNameToDelete}":`, error);
    }
  };

  const renderSceneItem = ({ item }: { item: string }) => (
    <View style={styles.sceneItemContainer}>
      <TouchableOpacity onPress={() => handleLoadScene(item)} style={commonStyles.sceneItem}>
        <Text style={commonStyles.itemText}>{item}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDeleteScene(item)} style={styles.deleteButton}>
        <Icon name="trash-2" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <AppModal isVisible={visible} onClose={onClose}>
      {/* Removed the extra View; content is directly inside AppModal */}
      <Text style={commonStyles.title}>Scene Management</Text>

      {/* Save Scene Section */}
      <View style={styles.section}>
        <TextInput
          style={commonStyles.textInput} // Use commonStyles instead of local styles
          placeholder="Enter scene name"
          value={sceneName}
          onChangeText={setSceneName}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity onPress={handleSaveScene} style={commonStyles.button}>
          <Text style={commonStyles.buttonText}>Save Current Scene</Text>
        </TouchableOpacity>
      </View>

      {/* Load Scene Section */}
      <View style={styles.section}>
        <Text style={commonStyles.modalTitle}>Saved Scenes:</Text>
        <FlatList
          data={sceneList}
          keyExtractor={(item) => item}
          renderItem={renderSceneItem}
          ListEmptyComponent={<Text style={commonStyles.text}>No saved scenes.</Text>}
        />
      </View>

      {/* Close Button */}
      <TouchableOpacity onPress={onClose} style={commonStyles.closeButton}>
        <Text style={commonStyles.buttonText}>Close</Text>
      </TouchableOpacity>
    </AppModal>
  );
};

const styles = StyleSheet.create({
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
  deleteButton: {
    backgroundColor: '#ff4d4d',
    padding: 5,
    borderRadius: 5,
  },
});

export default SceneManagerModal;
