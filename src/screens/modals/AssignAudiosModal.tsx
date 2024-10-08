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
import { IntervalContext } from '../../contexts/SceneProvider';

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
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const { selectedAudios, setSelectedAudioForState } = useContext(IntervalContext);

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

        // Get the currently selected audio for this state
        const currentSelected = selectedAudios[stateName.toLowerCase()];
        setSelectedFilePath(currentSelected || null);
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
    setSelectedFilePath(filePath);
    // Save the selected audio file for the state
    setSelectedAudioForState(stateName, filePath);
    Alert.alert('Audio Selected', 'The audio has been assigned to the state.');
  };

  const renderItem = ({ item }: { item: RNFS.ReadDirItem }) => (
    <TouchableOpacity
      style={[
        styles.item,
        item.path === selectedFilePath && styles.selectedItem,
      ]}
      onPress={() => handleSelectAudio(item.path)}
    >
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Assign Audios for {stateName}</Text>
          <FlatList
            data={audioFiles}
            keyExtractor={(item) => item.path}
            renderItem={renderItem}
          />
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
  closeButton: {
    marginTop: 15,
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
