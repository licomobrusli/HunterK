// src/screens/SettingsScreen.tsx

import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import RecordAudioModal from './modals/RecordAudioModal';
import SceneBuilderModal from './modals/SceneBuilderModal';
import AudioManagerModal from './modals/AudioManagerModal';
import SceneManagerModal from './modals/SceneManagerModal';
import DebriefBuilderModal from './modals/DebriefBuilderModal';
import DeleteAudiosModal from './modals/DeleteAudiosModal'; // Import the new modal
import { IntervalContext } from '../contexts/SceneProvider';
import { commonStyles } from '../styles/commonStyles';

const SettingsScreen: React.FC = () => {
  const [recordModalVisible, setRecordModalVisible] = useState<boolean>(false);
  const [sceneBuilderModalVisible, setSceneBuilderModalVisible] = useState<boolean>(false);
  const [audioManagerVisible, setAudioModalVisible] = useState<boolean>(false);
  const [sceneManagerVisible, setSceneManagerVisible] = useState<boolean>(false);
  const [debriefBuilderVisible, setDebriefBuilderVisible] = useState<boolean>(false);
  const [deleteAudiosModalVisible, setDeleteAudiosModalVisible] = useState<boolean>(false); // New state

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

  const openDeleteAudiosModal = () => {
    setDeleteAudiosModalVisible(true);
  };

  return (
    <View style={commonStyles.container}>
      <TouchableOpacity onPress={openRecordAudioModal} style={commonStyles.menuItem}>
        <Text style={commonStyles.menuText}>Record Audios</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openSceneBuilderModal} style={commonStyles.menuItem}>
        <Text style={commonStyles.menuText}>Scene Builder</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setDebriefBuilderVisible(true)} style={commonStyles.menuItem}>
        <Text style={commonStyles.menuText}>Debrief Builder</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openDeleteAudiosModal} style={commonStyles.menuItem}>
        <Text style={commonStyles.menuText}>Delete Custom Audios</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openAudioManager} style={commonStyles.menuItem}>
        <Text style={commonStyles.menuText}>Manage Audio Files</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openSceneManager} style={commonStyles.menuItem}>
        <Text style={commonStyles.menuText}>Scene Management</Text>
      </TouchableOpacity>

      {/* Modals */}
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

      <DebriefBuilderModal
        visible={debriefBuilderVisible}
        onClose={() => setDebriefBuilderVisible(false)}
        onSave={() => {
          console.log('Debrief saved!');
        }}
      />

      {/* New Delete Custom Audios Modal */}
      <DeleteAudiosModal
        visible={deleteAudiosModalVisible}
        onClose={() => setDeleteAudiosModalVisible(false)}
      />
    </View>
  );
};

export default SettingsScreen;
