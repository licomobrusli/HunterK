// src/screens/SettingsScreen.tsx

import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import RecordAudioModal from './modals/RecordAudioModal';
import SceneBuilderModal from './modals/SceneBuilderModal';
import AudioManagerModal from './modals/AudioManagerModal';
import SceneManagerModal from './modals/SceneManagerModal';
import { IntervalContext } from '../contexts/SceneProvider';
import RNFS from 'react-native-fs';
import { commonStyles } from '../styles/commonStyles';
import AppModal from '../styles/AppModal'; // Ensure correct import path

const SettingsScreen: React.FC = () => {
  const [recordModalVisible, setRecordModalVisible] = useState<boolean>(false);
  const [sceneBuilderModalVisible, setSceneBuilderModalVisible] = useState<boolean>(false);
  const [audioManagerVisible, setAudioModalVisible] = useState<boolean>(false);
  const [sceneManagerVisible, setSceneManagerVisible] = useState<boolean>(false);
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState<boolean>(false);

  const { states } = useContext(IntervalContext);

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

  const handleDeleteAudioPress = () => {
    console.log('Initiating deletion of custom audio files.');
    setConfirmDeleteModalVisible(true);
  };

  const confirmDeleteAudioFiles = async () => {
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
      console.log('Custom audio files deleted successfully.');
    } catch (error) {
      console.error('Error during audio file cleanup:', error);
    } finally {
      setConfirmDeleteModalVisible(false);
    }
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

      {/* Confirmation Modal */}
      <AppModal
        isVisible={confirmDeleteModalVisible}
        onClose={() => setConfirmDeleteModalVisible(false)}
      >
        <Text style={commonStyles.modalText}>
          Are you sure you want to delete all custom audios?
        </Text>
        <View style={commonStyles.buttonContainer}>
          <TouchableOpacity
            onPress={confirmDeleteAudioFiles}
            style={commonStyles.deleteButton}
          >
            <Text style={commonStyles.buttonText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setConfirmDeleteModalVisible(false)}
            style={commonStyles.cancelButton}
          >
            <Text style={commonStyles.buttonText}>No</Text>
          </TouchableOpacity>
        </View>
      </AppModal>

      {/* Other Modals */}
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
