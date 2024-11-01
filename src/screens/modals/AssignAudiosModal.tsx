import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ToastAndroid,
  TextInput,
} from 'react-native';
import RNFS from 'react-native-fs';
import { Picker } from '@react-native-picker/picker';
import { IntervalContext } from '../../contexts/SceneProvider';
import { PlaybackMode } from '../../types/PlaybackMode';
import AppModal from '../../styles/AppModal';
import { commonStyles } from '../../styles/commonStyles';
import { textStyles } from '../../styles/textStyles';
import { containerStyles } from '../../styles/containerStyles.ts';
import { buttonStyles } from '../../styles/buttonStyles.ts';

const AssignAudiosModal: React.FC<{ visible: boolean; onClose: () => void; stateName: string }> = ({
  visible,
  onClose,
  stateName,
}) => {
  const { selectedAudios, setSelectedAudiosForState } = useContext(IntervalContext);
  const [items, setItems] = useState<RNFS.ReadDirItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('Selected');
  const [repetitions, setRepetitions] = useState<string>('1'); // Default to 1, or empty for infinite

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
        repetitions: '1',
      };
      setSelectedFiles(currentSelected.audios);
      setPlaybackMode(currentSelected.mode);
      setRepetitions(currentSelected.repetitions?.toString() || '');
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
    const parsedRepetitions = repetitions ? parseInt(repetitions, 10) : null;
    setSelectedAudiosForState(stateName, {
      audios: selectedFiles,
      mode: playbackMode,
      repetitions: parsedRepetitions, // Save parsed repetitions as number or null
    });
    ToastAndroid.show('Audios assigned successfully!', ToastAndroid.SHORT);
    onClose();
  };

  const renderItem = ({ item }: { item: RNFS.ReadDirItem }) => {
    const isSelected = selectedFiles.includes(item.name);
    return (
      <View>
        <TouchableOpacity onPress={() => handleSelectAudio(item.name)} style={buttonStyles.button}>
          <Text style={[textStyles.text0, isSelected && textStyles.greenText]}>{item.name}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <AppModal isVisible={visible} onClose={onClose} animationIn="fadeIn" animationOut="fadeOut">
      <Text style={textStyles.text1}>Assign Audios for {stateName}</Text>

      <View style={containerStyles.container}>
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

      <View style={containerStyles.container}>
        <Text style={commonStyles.pickerLabel}>Repetitions:</Text>
        <TextInput
          style={commonStyles.positionInput}
          value={repetitions}
          onChangeText={(text) => {
            if (/^\d{0,2}$/.test(text)) {
              setRepetitions(text);
            }
          }}
          placeholder="Infinite if empty"
          keyboardType="numeric"
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        style={containerStyles.list}
      />

      <TouchableOpacity onPress={handleSaveSelection} style={buttonStyles.button}>
        <Text style={textStyles.text0}>Save Selection</Text>
      </TouchableOpacity>
    </AppModal>
  );
};

export default AssignAudiosModal;
