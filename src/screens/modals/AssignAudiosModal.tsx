import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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
import AudioItemRow from '../../config/AudioItemRow';
import RecordItemRow from '../../config/RecordItemRow';

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
  const [weightValues, setWeightValues] = useState<{ [key: string]: string }>({});
  const [playbackMode, setPlaybackMode] = useState<'Selected' | 'A-Z' | 'Random'>('Selected');
  const [repetitions, setRepetitions] = useState<string>('1');
  const [isPickerModalVisible, setIsPickerModalVisible] = useState<boolean>(false);
  const [recordingName, setRecordingName] = useState('New Recording');

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

      setSelectedFiles(currentSelected.audios);
      setPlaybackMode(currentSelected.mode);
      setRepetitions(currentSelected.repetitions ? currentSelected.repetitions.toString() : '1');
    } catch (error) {
      console.error('Error loading audio files:', error);
    }
  }, [baseFolder, stateName]);

  useEffect(() => {
    if (visible) {
      loadAudioFiles();
    }
  }, [visible, loadAudioFiles]);

  // Sort items so that selected ones appear at the top
  useEffect(() => {
    setItems((prevItems) => {
      const selected = prevItems.filter((item) => selectedFiles.includes(item.name));
      const unselected = prevItems.filter((item) => !selectedFiles.includes(item.name));
      return [...selected, ...unselected];
    });
  }, [selectedFiles]);

  const handleRecordingNameChange = (newName: string) => {
    setRecordingName(newName);
  };

  const handleSelectAudio = (fileName: string) => {
    setSelectedFiles((prevSelectedFiles) => {
      if (prevSelectedFiles.includes(fileName)) {
        return prevSelectedFiles.filter((name) => name !== fileName);
      } else {
        return [...prevSelectedFiles, fileName];
      }
    });
  };

  const handleWeightChange = (fileName: string, value: string) => {
    if (/^\d{0,1}$/.test(value)) {
      setWeightValues((prev) => ({
        ...prev,
        [fileName]: value,
      }));
    }
  };

  const handleSaveSelection = async () => {
    const parsedRepetitions = repetitions !== '' ? parseInt(repetitions, 10) : null;
    const audioData = {
      audios: selectedFiles,
      mode: playbackMode || 'Selected',
      repetitions: parsedRepetitions,
    };

    await AsyncStorage.setItem(
      `@selectedAudios_${stateName.toLowerCase()}`,
      JSON.stringify(audioData)
    );

    onAudiosSelected(stateName, audioData);
    ToastAndroid.show('Audios assigned successfully!', ToastAndroid.SHORT);
    onClose();
  };

  const handleSaveRecording = () => {
    // Optional: Logic to save the recording if needed
    console.log('Recording saved');
  };

  const playbackOptions: string[] = ['Selected', 'A-Z', 'Random'];

  return (
    <AppModal isVisible={visible} onClose={onClose} animationIn="fadeIn" animationOut="fadeOut">
      <Text style={textStyles.text1}>Assign Audios for {stateName}</Text>

      <View style={containerStyles.itemContainer}>
        <View style={containerStyles.containerLeft}>
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

          <TouchableOpacity onPress={() => setIsPickerModalVisible(true)}>
            <Text style={commonStyles.fixedWidthLabel}>{playbackMode}</Text>
          </TouchableOpacity>
        </View>

        <View style={containerStyles.containerRight}>
          <TouchableOpacity onPress={handleSaveSelection}>
            <View style={buttonStyles.iconButton}>
              <Save width={22} height={22} fill="#fff" stroke="#004225" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={containerStyles.list}>
        {items.map((item) => (
          <AudioItemRow
            key={item.name}
            item={item}
            isSelected={selectedFiles.includes(item.name)}
            weightValue={weightValues[item.name] || '10'}
            onWeightChange={(value) => handleWeightChange(item.name, value)}
            onSelectAudio={() => handleSelectAudio(item.name)}
            onDeleteAudio={() => handleSelectAudio(item.name)}
          />
        ))}
      </View>

      {/* Add RecordItemRow here */}
      <RecordItemRow
        recordingName={recordingName}
        onRecordingNameChange={handleRecordingNameChange}
        onSaveRecording={handleSaveRecording}
      />

      {/* Picker Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isPickerModalVisible}
        onRequestClose={() => setIsPickerModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPressOut={() => setIsPickerModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {playbackOptions.map((option: string) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setPlaybackMode(option as 'Selected' | 'A-Z' | 'Random');
                  setIsPickerModalVisible(false);
                }}
              >
                <View style={containerStyles.itemContainer}>
                  <Text style={commonStyles.fixedWidthLabel}>{option}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#004225',
    width: 180,
    borderColor: '#fff',
    borderWidth: 1,
  },
});

export default AssignAudiosModal;
