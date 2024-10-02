// SettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RecordAudioModal from './modals/RecordAudioModal';

const SettingsScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const openRecordAudioModal = () => {
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openRecordAudioModal} style={styles.menuItem}>
        <Text style={styles.menuText}>Record Audios</Text>
      </TouchableOpacity>

      {/* Other settings menu items can go here */}

      <RecordAudioModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // Adjust paddingTop if header overlaps content
    paddingTop: 20,
    backgroundColor: '#08591C', // British Racing Green
  },
  menuItem: {
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 18,
  },
});
