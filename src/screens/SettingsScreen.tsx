// src/screens/SettingsScreen.tsx

import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import RecordAudioModal from './modals/RecordAudioModal';
import SceneBuilderModal from './modals/SceneBuilderModal';
import DebriefBuilderModal from './modals/DebriefBuilderModal';
import DeleteAudiosModal from './modals/DeleteAudiosModal'; // Import the new modal
import FileManagerModal from './modals/FileManagerModal';
import SceneManagerModal from './modals/SceneManagerModal';
import { IntervalContext } from '../contexts/SceneProvider';
import { textStyles } from '../styles/textStyles';
import { containerStyles } from '../styles/containerStyles.ts';

const SettingsScreen: React.FC = () => {
  const [recordModalVisible, setRecordModalVisible] = useState<boolean>(false);
  const [sceneBuilderModalVisible, setSceneBuilderModalVisible] = useState<boolean>(false);
  const [debriefBuilderVisible, setDebriefBuilderVisible] = useState<boolean>(false);
  const [deleteAudiosModalVisible, setDeleteAudiosModalVisible] = useState<boolean>(false); // New state
  const [FileManagerVisible, setFileManagerVisible] = useState<boolean>(false);
  const [sceneManagerModalVisible, setSceneManagerModalVisible] = useState<boolean>(false);

  useContext(IntervalContext);

  const openRecordAudioModal = () => {
    setRecordModalVisible(true);
  };

  const openSceneBuilderModal = () => {
    setSceneBuilderModalVisible(true);
  };

  const openDeleteAudiosModal = () => {
    setDeleteAudiosModalVisible(true);
  };

  const openFileManager = () => {
    setFileManagerVisible(true);
  };

  const openSceneManager = () => {
    setSceneManagerModalVisible(true);
  };

  return (
    <View style={containerStyles.container}>
      <TouchableOpacity onPress={openRecordAudioModal} style={containerStyles.itemContainer}>
        <Text style={textStyles.text0}>Record Audios</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openSceneBuilderModal} style={containerStyles.itemContainer}>
        <Text style={textStyles.text0}>Scene Builder</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setDebriefBuilderVisible(true)} style={containerStyles.itemContainer}>
        <Text style={textStyles.text0}>Debrief Builder</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openDeleteAudiosModal} style={containerStyles.itemContainer}>
        <Text style={textStyles.text0}>Delete Custom Audios</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openFileManager} style={containerStyles.itemContainer}>
        <Text style={textStyles.text0}>File Manager</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={openSceneManager} style={containerStyles.itemContainer}>
        <Text style={textStyles.text0}>Scene Manager</Text>
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
      <DebriefBuilderModal
        visible={debriefBuilderVisible}
        onClose={() => setDebriefBuilderVisible(false)}
      />
      <DeleteAudiosModal
        visible={deleteAudiosModalVisible}
        onClose={() => setDeleteAudiosModalVisible(false)}
      />
      <FileManagerModal
        visible={FileManagerVisible}
        onClose={() => setFileManagerVisible(false)}
      />
      <SceneManagerModal
        visible={sceneManagerModalVisible}
        onClose={() => setSceneManagerModalVisible(false)}
      />
    </View>
  );
};

export default SettingsScreen;
