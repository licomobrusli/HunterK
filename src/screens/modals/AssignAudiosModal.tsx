// src/screens/modals/AssignAudiosModal.tsx

import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import RNFS from 'react-native-fs';
import { Picker } from '@react-native-picker/picker';
import { IntervalContext } from '../../contexts/SceneProvider';
import { PlaybackMode } from '../../types/PlaybackMode';
import AppModal from '../../styles/AppModal';
import { commonStyles } from '../../styles/commonStyles';

const AssignAudiosModal: React.FC<{ visible: boolean; onClose: () => void; stateName: string }> = ({
  visible,
  onClose,
  stateName,
}) => {
  const { selectedAudios, setSelectedAudiosForState } = useContext(IntervalContext);
  const [items, setItems] = useState<RNFS.ReadDirItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('Selected');

  const baseFolder = `${RNFS.DocumentDirectoryPath}/audios/${stateName.toLowerCase()}`;

  const loadAudioFiles = useCallback(async () => {
    try {
      const exists = await RNFS.exists(baseFolder);
      if (!exists) {
        console.log('Audio folder does not exist:', baseFolder);
        return;
      }
      const directoryItems = await RNFS.readDir(baseFolder);
      const audioFiles = directoryItems.filter((item) => item.isFile() && item.name.endsWith('.mp3'));
      setItems(audioFiles);

      const currentSelected = selectedAudios[stateName.toLowerCase()] || {
        audios: [],
        mode: 'Selected',
      };
      setSelectedFiles(currentSelected.audios);
      setPlaybackMode(currentSelected.mode);
    } catch (error) {
      console.error('Error loading audio files:', error);
    }
  }, [baseFolder, selectedAudios, stateName]);

  useEffect(() => {
    if (visible) {
      loadAudioFiles();
    }
  }, [visible, loadAudioFiles]);

  const handleSelectAudio = (fileName: string) => {
    setSelectedFiles((prevSelectedFiles) => {
      if (prevSelectedFiles.includes(fileName)) {
        return prevSelectedFiles.filter((name) => name !== fileName);
      } else {
        return [...prevSelectedFiles, fileName];
      }
    });
  };

  const handleSaveSelection = () => {
    setSelectedAudiosForState(stateName, {
      audios: selectedFiles, // Now contains file names
      mode: playbackMode,
    });
    ToastAndroid.show('Audios assigned successfully!', ToastAndroid.SHORT);
    onClose();
  };

  const renderItem = ({ item }: { item: RNFS.ReadDirItem }) => {
    const isSelected = selectedFiles.includes(item.name);
    return (
      <View>
        <TouchableOpacity onPress={() => handleSelectAudio(item.name)} style={styles.itemButton}>
          <Text style={[styles.itemText, isSelected && styles.selectedText]}>{item.name}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <AppModal isVisible={visible} onClose={onClose} animationIn="fadeIn" animationOut="fadeOut">
      <Text style={commonStyles.title}>Assign Audios for {stateName}</Text>

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
        data={items}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        style={styles.flatList}
      />

      <TouchableOpacity onPress={handleSaveSelection} style={commonStyles.saveButton}>
        <Text style={commonStyles.saveButtonText}>Save Selection</Text>
      </TouchableOpacity>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  itemButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  itemText: {
    color: 'white',
  },
  selectedText: {
    color: 'green',
  },
  flatList: {
    width: '100%',
  },
});

export default AssignAudiosModal;
