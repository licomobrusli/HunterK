import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import RecordAudioModal from './modals/RecordAudioModal';
import SceneBuilderModal from './modals/SceneBuilderModal';
import AudioManagerModal from './modals/AudioManagerModal';
import RNFS from 'react-native-fs';

const SettingsScreen: React.FC = () => {
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [sceneBuilderModalVisible, setSceneBuilderModalVisible] = useState(false);
  const [audioManagerVisible, setAudioModalVisible] = useState(false);

  const openRecordAudioModal = () => {
    setRecordModalVisible(true);
  };

  const openSceneBuilderModal = () => {
    setSceneBuilderModalVisible(true);
  };

  const openAudioManager = () => {
    setAudioModalVisible(true);
  };

  const deleteCustomAudioFiles = async () => {
    const states = ['Active', 'Spotted', 'Proximity', 'Trigger'];
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
    <View style={styles.container}>
      <TouchableOpacity onPress={openRecordAudioModal} style={styles.menuItem}>
        <Text style={styles.menuText}>Record Audios</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openSceneBuilderModal} style={styles.menuItem}>
        <Text style={styles.menuText}>Scene Builder</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDeleteAudioPress} style={styles.menuItem}>
        <Text style={styles.menuText}>Delete Custom Audios</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openAudioManager} style={styles.menuItem}>
        <Text style={styles.menuText}>Manage Audio Files</Text>
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

    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#004225', // British Racing Green
  },
  menuItem: {
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 18,
    color: '#fff', // change to a cream colour off-white
  },
});
