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

  useContext(IntervalContext);

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
      console.log('Initiating deletion of all audio files in the main directory.');

      // Set the main directory path (e.g., DocumentDirectoryPath)
      const parentDirectoryPath = `${RNFS.DocumentDirectoryPath}`;

      // Function to delete all .mp3 files in a directory and its subdirectories
      const deleteMp3FilesInDirectory = async (directoryPath: string) => {
        const exists = await RNFS.exists(directoryPath);
        if (exists) {
          console.log(`Directory exists: ${directoryPath}`);
          const directoryItems = await RNFS.readDir(directoryPath);
          console.log(`Items in directory ${directoryPath}:`, directoryItems);

          for (const item of directoryItems) {
            if (item.isFile() && item.name.toLowerCase().endsWith('.mp3')) {
              try {
                await RNFS.unlink(item.path);
                console.log(`Deleted custom audio file: ${item.path}`);
              } catch (unlinkError) {
                console.error(`Failed to delete file: ${item.path}`, unlinkError);
              }
            } else if (item.isDirectory()) {
              console.log(`Entering directory: ${item.path}`);
              await deleteMp3FilesInDirectory(item.path);

              // Check if directory is empty after deleting files
              const remainingItems = await RNFS.readDir(item.path);
              if (remainingItems.length === 0) {
                try {
                  await RNFS.unlink(item.path);
                  console.log(`Deleted empty directory: ${item.path}`);
                } catch (unlinkError) {
                  console.error(`Failed to delete directory: ${item.path}`, unlinkError);
                }
              }
            }
          }
        } else {
          console.log('Directory does not exist:', directoryPath);
        }
      };

      // Start the deletion process from the main directory
      const rootItems = await RNFS.readDir(parentDirectoryPath);
      for (const item of rootItems) {
        if (item.isDirectory()) {
          await deleteMp3FilesInDirectory(item.path);
        }
      }

      // Attempt to delete any remaining empty directories in the root
      for (const item of rootItems) {
        if (item.isDirectory()) {
          const remainingItems = await RNFS.readDir(item.path);
          if (remainingItems.length === 0) {
            try {
              await RNFS.unlink(item.path);
              console.log(`Deleted empty root directory: ${item.path}`);
            } catch (unlinkError) {
              console.error(`Failed to delete root directory: ${item.path}`, unlinkError);
            }
          }
        }
      }

      console.log('All custom audio files and empty directories deleted successfully.');
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
