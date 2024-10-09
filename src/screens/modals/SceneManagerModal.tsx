// src/screens/modals/SceneManagerModal.tsx
import { commonStyles } from '../../styles/commonStyles';

import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { IntervalContext } from '../../contexts/SceneProvider';
import { saveScene, loadScene, getSceneList, deleteScene } from '../../config/SceneStorage';
import { Scene } from '../../types/Scene';
import { sanitizeFileName } from '../../config/sanitizer';

type SceneManagerModalProps = {
  visible: boolean;
  onClose: () => void;
};

const SceneManagerModal: React.FC<SceneManagerModalProps> = ({ visible, onClose }) => {
  const [sceneName, setSceneName] = useState('');
  const [sceneList, setSceneList] = useState<string[]>([]);
  const { intervals, selectedAudios, loadSceneData } = useContext(IntervalContext);

  useEffect(() => {
    if (visible) {
      fetchSceneList();
    }
  }, [visible]);

  const fetchSceneList = async () => {
    try {
      const scenes = await getSceneList();
      setSceneList(scenes);
    } catch (error) {
      console.error('Error fetching scene list:', error);
    }
  };

  const handleSaveScene = async () => {
    if (!sceneName.trim()) {
      Alert.alert('Invalid Name', 'Please enter a valid scene name.');
      return;
    }

    // Sanitize scene name
    const trimmedName = sceneName.trim();
    const sanitizedSceneName = sanitizeFileName(trimmedName);

    if (sanitizedSceneName.length === 0) {
      Alert.alert('Invalid Name', 'Scene name contains invalid characters.');
      return;
    }

    if (sceneList.includes(sanitizedSceneName)) {
      Alert.alert(
        'Scene Exists',
        `A scene named '${sanitizedSceneName}' already exists. Overwrite?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Overwrite',
            style: 'destructive',
            onPress: async () => {
              await saveSceneData(sanitizedSceneName);
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      await saveSceneData(sanitizedSceneName);
    }
  };

  const saveSceneData = async (name: string) => {
    const scene: Scene = {
      name,
      intervals,
      selectedAudios,
    };
    try {
      await saveScene(scene);
      Alert.alert('Scene Saved', `Scene '${name}' has been saved.`);
      setSceneName('');
      fetchSceneList();
    } catch (error) {
      Alert.alert('Error', 'Failed to save the scene.');
    }
  };

  const handleLoadScene = async (selectedSceneName: string) => {
    try {
      const scene = await loadScene(selectedSceneName);
      loadSceneData(scene);
      Alert.alert('Scene Loaded', `Scene '${selectedSceneName}' has been loaded.`);
      onClose(); // Close the modal after loading the scene
    } catch (error) {
      Alert.alert('Error', 'Failed to load the scene.');
    }
  };

  const handleDeleteScene = (sceneNameToDelete: string) => {
    Alert.alert(
      'Delete Scene',
      `Are you sure you want to delete the scene '${sceneNameToDelete}'?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteScene(sceneNameToDelete);
              fetchSceneList();
              Alert.alert('Scene Deleted', `Scene '${sceneNameToDelete}' has been deleted.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete the scene.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderSceneItem = ({ item }: { item: string }) => (
    <View style={commonStyles.sceneItemContainer}>
      <TouchableOpacity
        onPress={() => handleLoadScene(item)}
        style={commonStyles.sceneItem}
      >
        <Text style={commonStyles.itemText}>{item}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleDeleteScene(item)}
        style={commonStyles.deleteButton}
      >
        <Text style={commonStyles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={commonStyles.modalContainer}>
        <Text style={commonStyles.title}>Scene Management</Text>

        {/* Save Scene Section */}
        <View style={commonStyles.section}>
          <TextInput
            style={commonStyles.input}
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
        <View style={commonStyles.section}>
          <Text style={commonStyles.modalTitle}>Saved Scenes:</Text>
          <FlatList
            data={sceneList}
            keyExtractor={(item) => item}
            renderItem={renderSceneItem}
          />
        </View>

        {/* Close Button */}
        <TouchableOpacity onPress={onClose} style={commonStyles.closeButton}>
          <Text style={commonStyles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default SceneManagerModal;
