// src/screens/modals/AssignAudiosModal.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';
import { Picker } from '@react-native-picker/picker'; // Updated import
import { IntervalContext } from '../../contexts/SceneProvider';
import { PlaybackMode } from '../../types/PlaybackMode';

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
        style={[styles.item, isSelected && styles.selectedItem]}
        onPress={() => handleSelectAudio(item.path)}
      >
        <Text style={styles.itemText}>
          {item.name} {isSelected ? `(${index + 1})` : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Assign Audios for {stateName}</Text>

          {/* Playback Mode Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Playback Mode:</Text>
            <Picker
              selectedValue={playbackMode}
              onValueChange={(itemValue) => setPlaybackMode(itemValue as PlaybackMode)}
              style={styles.picker}
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

          <TouchableOpacity onPress={handleSaveSelection} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Selection</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AssignAudiosModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '80%',
    backgroundColor: '#004225',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 15,
    alignSelf: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickerLabel: {
    color: '#FFFFFF',
    marginRight: 10,
  },
  picker: {
    flex: 1,
    color: '#FFFFFF',
    backgroundColor: '#005F2E',
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  selectedItem: {
    backgroundColor: '#005F2E',
  },
  itemText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  saveButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#007F4E',
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#005F2E',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
