import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import RecordAudioModal from './modals/RecordAudioModal';
import UpdateIntervalsModal from './modals/UpdateIntervalsModal';
import RNFS from 'react-native-fs';

const SettingsScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [intervalsModalVisible, setIntervalsModalVisible] = useState(false);

  const openRecordAudioModal = () => {
    setModalVisible(true);
  };

  const openUpdateIntervalsModal = () => {
    setIntervalsModalVisible(true);
  };

  const deleteCustomAudioFiles = async () => {
    const states = ['Active', 'Spotted', 'Proximity', 'Trigger'];
    try {
      for (const state of states) {
        const filePath = `${RNFS.DocumentDirectoryPath}/${state}/${state.toLowerCase()}.mp3`;

        const fileExists = await RNFS.exists(filePath);
        if (fileExists) {
          await RNFS.unlink(filePath);
          console.log(`Deleted custom audio file: ${filePath}`);
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

      <TouchableOpacity onPress={openUpdateIntervalsModal} style={styles.menuItem}>
        <Text style={styles.menuText}>Update Intervals</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDeleteAudioPress} style={styles.menuItem}>
        <Text style={styles.menuText}>Delete Custom Audios</Text>
      </TouchableOpacity>

      <RecordAudioModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <UpdateIntervalsModal
        visible={intervalsModalVisible}
        onClose={() => setIntervalsModalVisible(false)}
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
