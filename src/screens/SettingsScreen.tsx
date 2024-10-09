// src/screens/SettingsScreen.tsx
import { commonStyles } from '../styles/commonStyles';

import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import RecordAudioModal from './modals/RecordAudioModal';
import SceneBuilderModal from './modals/SceneBuilderModal';
import AudioManagerModal from './modals/AudioManagerModal';
import SceneManagerModal from './modals/SceneManagerModal';
import { IntervalContext } from '../contexts/SceneProvider';
import RNFS from 'react-native-fs';

const SettingsScreen: React.FC = () => {
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [sceneBuilderModalVisible, setSceneBuilderModalVisible] = useState(false);
  const [audioManagerVisible, setAudioModalVisible] = useState(false);
  const [sceneManagerVisible, setSceneManagerVisible] = useState(false);

  const openRecordAudioModal = () => {
    setRecordModalVisible(true);
  };

  const openSceneBuilderModal = () => {
    setSceneBuilderModalVisible(true);
  };

  const openAudioManager = () => {
    setAudioModalVisible(true);
  };

  const openSceneManager = () => {
    setSceneManagerVisible(true);
  };

  const { states } = useContext(IntervalContext);

  const deleteCustomAudioFiles = async () => {
    try {
      for (const state of states) {
        const stateDir = `${RNFS.DocumentDirectoryPath}/${state}`;
        const dirExists = await RNFS.exists(stateDir);

        if (dirExists) {
          const files = await RNFS.readDir(stateDir);
          for (const file of files) {
            if (file.isFile() && file.name.endsWith('.mp3')) {
              const filePath = file.path;
              await RNFS.unlink(filePath);
              console.log(`Deleted custom audio file: ${filePath}`);
            }
          }
        }
      }
      Alert.alert('Success', 'Custom audio files deleted successfully.');
    } catch (error) {
      console.error('Error during audio file cleanup:', error);
      Alert.alert('Error', 'Failed to delete custom audio files.');
    }
  };

  const handleDeleteAudioPress = () => {
    Alert.alert(
      'Delete Audio Files',
      'Are you sure you want to delete all custom audio files?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: deleteCustomAudioFiles },
      ]
    );
  };

  return (
    <View style={commonStyles.container}>
      <TouchableOpacity onPress={openRecordAudioModal} style={commonStyles.menuItem}>
        <Text style={commonStyles.menuText}>Record Audios</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openSceneBuilderModal} style={commonStyles.menuItem}>
        <Text style={commonStyles.menuText}>Scene Builder</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDeleteAudioPress} style={commonStyles.menuItem}>
        <Text style={commonStyles.menuText}>Delete Custom Audios</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openAudioManager} style={commonStyles.menuItem}>
        <Text style={commonStyles.menuText}>Manage Audio Files</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openSceneManager} style={commonStyles.menuItem}>
        <Text style={commonStyles.menuText}>Scene Management</Text>
      </TouchableOpacity>

      <RecordAudioModal
        visible={recordModalVisible}
        onClose={() => setRecordModalVisible(false)}
      />

      <SceneBuilderModal
        visible={sceneBuilderModalVisible}
        onClose={() => setSceneBuilderModalVisible(false)}
      />

      <AudioManagerModal
        visible={audioManagerVisible}
        onClose={() => setAudioModalVisible(false)}
      />

      <SceneManagerModal
        visible={sceneManagerVisible}
        onClose={() => setSceneManagerVisible(false)}
      />

    </View>
  );
};

export default SettingsScreen;
