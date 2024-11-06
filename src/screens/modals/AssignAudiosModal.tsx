import React, { useState, useEffect, useCallback } from 'react';
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
import AppModal from '../../styles/AppModal';
import { commonStyles } from '../../styles/commonStyles';
import { textStyles } from '../../styles/textStyles';
import { containerStyles } from '../../styles/containerStyles';
import { buttonStyles } from '../../styles/buttonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AssignAudiosModalProps = {
  visible: boolean;
  onClose: () => void;
  stateName: string;
  onAudiosSelected: (stateName: string, audioData: any) => void;
};

const AssignAudiosModal: React.FC<AssignAudiosModalProps> = ({
  visible,
  onClose,
  stateName,
  onAudiosSelected,
}) => {
  const [items, setItems] = useState<RNFS.ReadDirItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [playbackMode, setPlaybackMode] = useState<'Selected' | 'A-Z' | 'Random'>('Selected');
  const [repetitions, setRepetitions] = useState<string>('1');

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

      const storedData = await AsyncStorage.getItem(`@selectedAudios_${stateName.toLowerCase()}`);
      const currentSelected = storedData
        ? JSON.parse(storedData)
        : { audios: [], mode: 'Selected', repetitions: '1' };

      // Ensure default values are set if properties are missing
      currentSelected.mode = currentSelected.mode || 'Selected';
      currentSelected.repetitions = currentSelected.repetitions ?? '1';

      setSelectedFiles(currentSelected.audios);
      setPlaybackMode(currentSelected.mode);
      setRepetitions(currentSelected.repetitions.toString());
    } catch (error) {
      console.error('Error loading audio files:', error);
    }
  }, [baseFolder, stateName]);

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

  const handleSaveSelection = async () => {
    const parsedRepetitions = repetitions !== '' ? parseInt(repetitions, 10) : null;
    const audioData = {
      audios: selectedFiles,
      mode: playbackMode || 'Selected', // Ensure mode is set
      repetitions: parsedRepetitions,
    };

    await AsyncStorage.setItem(
      `@selectedAudios_${stateName.toLowerCase()}`,
      JSON.stringify(audioData)
    );

    // Update parent component with new selection
    onAudiosSelected(stateName, audioData);

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
          onValueChange={(itemValue) => setPlaybackMode(itemValue as 'Selected' | 'A-Z' | 'Random')}
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
          style={buttonStyles.iconButton}
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
