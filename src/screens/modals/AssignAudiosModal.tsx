// src/screens/modals/AssignAudiosModal.tsx
import { commonStyles } from '../../styles/commonStyles';

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';
import { Picker } from '@react-native-picker/picker'; // Updated import
import { IntervalContext } from '../../contexts/SceneProvider';
import { PlaybackMode } from '../../types/PlaybackMode';
import AppModal from '../../styles/AppModal';

type AssignAudiosModalProps = {
  visible: boolean;
  onClose: () => void;
  stateName: string;
};

const AssignAudiosModal: React.FC<AssignAudiosModalProps> = ({
  visible,
  onClose,
  stateName,
}) => {
  const [audioFiles, setAudioFiles] = useState<RNFS.ReadDirItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('Selected');
  const { selectedAudios, setSelectedAudiosForState } = useContext(IntervalContext);

  useEffect(() => {
    const loadAudioFiles = async () => {
      try {
        const stateFolder = `${RNFS.DocumentDirectoryPath}/${stateName}`;
        const exists = await RNFS.exists(stateFolder);
        if (!exists) {
          console.log('State folder does not exist:', stateFolder);
          setAudioFiles([]);
          return;
        }
        const files = await RNFS.readDir(stateFolder);
        const mp3Files = files.filter(
          (item) => item.isFile() && item.name.endsWith('.mp3')
        );
        setAudioFiles(mp3Files);

        // Get the currently selected audios for this state
        const currentSelected = selectedAudios[stateName.toLowerCase()] || { audios: [], mode: 'Selected' };
        setSelectedFiles(currentSelected.audios);
        setPlaybackMode(currentSelected.mode);
      } catch (error) {
        console.error('Error loading audio files:', error);
        setAudioFiles([]);
      }
    };

    if (visible) {
      loadAudioFiles();
    }
  }, [visible, selectedAudios, stateName]);

  const handleSelectAudio = (filePath: string) => {
    setSelectedFiles((prevSelectedFiles) => {
      if (prevSelectedFiles.includes(filePath)) {
        // Deselect the file
        const updatedSelection = prevSelectedFiles.filter((path) => path !== filePath);
        return updatedSelection;
      } else {
        // Select the file
        return [...prevSelectedFiles, filePath];
      }
    });
  };

  const handleSaveSelection = () => {
    // Save the selected audios and playback mode for the state
    setSelectedAudiosForState(stateName, {
      audios: selectedFiles,
      mode: playbackMode,
    });
    Alert.alert('Audios Assigned', 'The audios have been assigned to the state.');
  };

  const renderItem = ({ item }: { item: RNFS.ReadDirItem }) => {
    const index = selectedFiles.indexOf(item.path);
    const isSelected = index !== -1;

    return (
      <TouchableOpacity
        style={[commonStyles.item, isSelected && commonStyles.selectedItem]}
        onPress={() => handleSelectAudio(item.path)}
      >
        <Text style={commonStyles.itemText}>
          {item.name} {isSelected ? `(${index + 1})` : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <AppModal
      isVisible={visible}
      onClose={onClose}
      animationIn="zoomIn" // Optional: Override animation if needed
      animationOut="zoomOut"
    >
      <Text style={commonStyles.title}>Assign Audios for {stateName}</Text>

      {/* Playback Mode Picker */}
      <View style={commonStyles.pickerContainer}>
        <Text style={commonStyles.pickerLabel}>Playback Mode:</Text>
        <Picker
          selectedValue={playbackMode}
          onValueChange={(itemValue) => setPlaybackMode(itemValue as PlaybackMode)}
          style={commonStyles.picker}
        >
          <Picker.Item label="Selected" value="Selected" />
          <Picker.Item label="A-Z" value="A-Z" />
          <Picker.Item label="Random" value="Random" />
        </Picker>
      </View>

      <FlatList
        data={audioFiles}
        keyExtractor={(item) => item.path}
        renderItem={renderItem}
      />

      <TouchableOpacity onPress={handleSaveSelection} style={commonStyles.saveButton}>
        <Text style={commonStyles.saveButtonText}>Save Selection</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onClose} style={commonStyles.closeButton}>
        <Text style={commonStyles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </AppModal>
  );
};

export default AssignAudiosModal;
