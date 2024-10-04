import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RecordAudioModal from './modals/RecordAudioModal';
import UpdateIntervalsModal from './modals/UpdateIntervalsModal';

const SettingsScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [intervalsModalVisible, setIntervalsModalVisible] = useState(false);

  const openRecordAudioModal = () => {
    setModalVisible(true);
  };

  const openUpdateIntervalsModal = () => {
    setIntervalsModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openRecordAudioModal} style={styles.menuItem}>
        <Text style={styles.menuText}>Record Audios</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openUpdateIntervalsModal} style={styles.menuItem}>
        <Text style={styles.menuText}>Update Intervals</Text>
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
