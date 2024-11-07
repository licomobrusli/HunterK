import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ToastAndroid,
  TextInput,
  StyleSheet,
  Modal,
} from 'react-native';
import RNFS from 'react-native-fs';
import AppModal from '../../styles/AppModal';
import { commonStyles } from '../../styles/commonStyles';
import { textStyles } from '../../styles/textStyles';
import { containerStyles } from '../../styles/containerStyles';
import { buttonStyles } from '../../styles/buttonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Save from '../../assets/icons/save.svg';
import Refresh from '../../assets/icons/refresh.svg';

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
  const [isPickerModalVisible, setIsPickerModalVisible] = useState<boolean>(false);

  const baseFolder = `${RNFS.DocumentDirectoryPath}/audios/${stateName.toLowerCase()}`;

  const loadAudioFiles = useCallback(async () => {
    try {
      const exists = await RNFS.exists(baseFolder);
      if (!exists) {
        console.log('Audio folder does not exist:', baseFolder);
        return;
      }
      const directoryItems = await RNFS.readDir(baseFolder);
      const audioFiles = directoryItems.filter(
        (item) => item.isFile() && item.name.endsWith('.mp3')
      );
      setItems(audioFiles);

      const storedData = await AsyncStorage.getItem(
        `@selectedAudios_${stateName.toLowerCase()}`
      );
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
        <TouchableOpacity
          onPress={() => handleSelectAudio(item.name)}
          style={buttonStyles.button}
        >
          <Text style={[textStyles.text0, isSelected && textStyles.greenText]}>
            {item.name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Options for the custom picker
  const playbackOptions = ['Selected', 'A-Z', 'Random'];

  return (
    <AppModal isVisible={visible} onClose={onClose} animationIn="fadeIn" animationOut="fadeOut">
      <Text style={textStyles.text1}>Assign Audios for {stateName}</Text>

      <View style={containerStyles.itemContainer}>
        <View style={containerStyles.containerLeft}>
          {/* Repetitions Icon with Overlayed Input */}
          <View style={buttonStyles.iconButton}>
            <Refresh width={24} height={24} fill="#fff" stroke="#004225" />
            <TextInput
              style={textStyles.textA}
              value={repetitions}
              onChangeText={(text) => {
                if (/^\d{0,2}$/.test(text)) {
                  setRepetitions(text);
                }
              }}
              placeholder="X"
              keyboardType="numeric"
              maxLength={1}
            />
          </View>

          {/* Playback Mode Custom Picker */}
          <TouchableOpacity
            onPress={() => setIsPickerModalVisible(true)}>
            <Text style={commonStyles.fixedWidthLabel}>{playbackMode}</Text>
          </TouchableOpacity>
        </View>

        {/* Save Selection Button */}
        <View style={containerStyles.containerRight}>
          <TouchableOpacity onPress={handleSaveSelection}>
            <View style={buttonStyles.iconButton}>
              <Save width={18} height={18} fill="#fff" stroke="#004225" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Picker Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isPickerModalVisible}
        onRequestClose={() => setIsPickerModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsPickerModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {playbackOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setPlaybackMode(option as 'Selected' | 'A-Z' | 'Random');
                  setIsPickerModalVisible(false);
                }}
                style={styles.optionItem}
              >
                <Text style={textStyles.text0}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Audio Files List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        style={containerStyles.list}
      />
    </AppModal>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    justifyContent: 'center',
    textAlign: 'left',
    height: 30,
    borderRadius: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Changed to a more standard semi-transparent overlay
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#333', // Solid background for better contrast
    borderRadius: 1,
    width: '80%',
    alignItems: 'center',
    marginLeft: 10,
  },
  optionItem: {
    height: 30, // Increased height for easier tapping
    justifyContent: 'center',
    textAlign: 'left',
    marginLeft: 10,
    width: '100%',
  },
});

export default AssignAudiosModal;
