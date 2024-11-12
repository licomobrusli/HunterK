// src/screens/modals/AssignAudiosModal.tsx

import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ToastAndroid,
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
import AutoShrinkText from '../../styles/AutoShrinkText';
import { convertMinutesSecondsToMs, convertMsToMinutesSeconds } from '../../config/timeUtils';
import { IntervalContext } from '../../contexts/SceneProvider';

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
  const [repetitions, setRepetitions] = useState<string>('X');
  const [isPickerModalVisible, setIsPickerModalVisible] = useState<boolean>(false);
  const [recordingName, setRecordingName] = useState('New Recording');

  // Access the IntervalContext
  const {
    audioIntervals,
    setAudioIntervalForAudio,
  } = useContext(IntervalContext);

  // Define localIntervals and setLocalIntervals
  const [localIntervals, setLocalIntervals] = useState<{ [key: string]: string | null }>({});
  // Define editingIntervals to track editing state per item
  const [editingIntervals, setEditingIntervals] = useState<{ [key: string]: boolean }>({});

  const baseFolder = `${RNFS.DocumentDirectoryPath}/audios/${stateName.toLowerCase()}`;

  // Use useCallback to memoize loadAudioFiles
  const loadAudioFiles = useCallback(async () => {
    try {
      const exists = await RNFS.exists(baseFolder);
      if (!exists) {
        console.log('Audio folder does not exist:', baseFolder);
        setItems([]);
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
        : { audios: [], mode: 'Selected', repetitions: 'X' };

      setSelectedFiles(currentSelected.audios);
      setPlaybackMode(currentSelected.mode);
      setRepetitions(currentSelected.repetitions || 'X');

      // Initialize localIntervals based on context's audioIntervals
      const currentAudioIntervals = audioIntervals[stateName.toLowerCase()] || {};
      const localIntervalsLoaded: { [key: string]: string | null } = {};

      for (const audioName in currentAudioIntervals) {
        if (currentAudioIntervals.hasOwnProperty(audioName)) {
          const intervalMs = currentAudioIntervals[audioName];
          if (intervalMs !== null) {
            localIntervalsLoaded[audioName] = convertMsToMinutesSeconds(intervalMs);
          } else {
            localIntervalsLoaded[audioName] = null;
          }
        }
      }

      setLocalIntervals(localIntervalsLoaded);
    } catch (error) {
      console.error('Error loading audio files:', error);
    }
  }, [stateName, baseFolder, audioIntervals]);

  useEffect(() => {
    if (visible) {
      loadAudioFiles();
    }
  }, [visible, loadAudioFiles]);

  const handleAudioSaved = () => {
    loadAudioFiles(); // Refresh the audio files list
  };

  const handleAudioDeleted = () => {
    loadAudioFiles(); // Refresh the audio files list when an audio is deleted
  };

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
    const audioData = {
      audios: selectedFiles,
      mode: playbackMode || 'Selected',
      repetitions: repetitions, // Store as string
    };

    try {
      await AsyncStorage.setItem(
        `@selectedAudios_${stateName.toLowerCase()}`,
        JSON.stringify(audioData)
      );
      onAudiosSelected(stateName, audioData);
      ToastAndroid.show('Audios assigned successfully!', ToastAndroid.SHORT);
      onClose();
    } catch (error) {
      console.error('Error saving audio selection:', error);
    }
  };

  const playbackOptions: string[] = ['Selected', 'A-Z', 'Random'];

  // Compute reordered items here
  const selectedItems = selectedFiles
    .map((fileName) => items.find((item) => item.name === fileName))
    .filter((item): item is RNFS.ReadDirItem => item !== undefined);

  const unselectedItems = items.filter((item) => !selectedFiles.includes(item.name));

  const reorderedItems = [...selectedItems, ...unselectedItems];

  return (
    <AppModal
      isVisible={visible}
      onClose={onClose}
      animationIn="fadeIn"
      animationOut="fadeOut"
    >
      <Text style={textStyles.text1}>Assign Audios for {stateName}</Text>

      <View style={containerStyles.itemContainer}>
        <View style={containerStyles.containerLeft}>
          <View style={buttonStyles.iconButton}>
            <Refresh width={24} height={24} fill="#fff" stroke="#004225" />
            <AutoShrinkText
              style={textStyles.textA}
              value={repetitions}
              onChangeText={(text) => {
                if (/^\d{0,2}$/.test(text) || text.toUpperCase() === 'X') {
                  setRepetitions(text.toUpperCase());
                }
              }}
              placeholder="X"
              keyboardType="numeric"
              maxLength={2} // Allow for 'X' or up to two-digit numbers
            />
          </View>

          <TouchableOpacity onPress={() => setIsPickerModalVisible(true)}>
            <Text style={commonStyles.fixedWidthLabel}>{playbackMode}</Text>
          </TouchableOpacity>
        </View>

        <View style={containerStyles.containerRight}>
          <View style={buttonStyles.timeButton} />
          <View style={buttonStyles.iconButton} />
          <View style={buttonStyles.iconButton} />
          <TouchableOpacity onPress={handleSaveSelection}>
            <View style={buttonStyles.iconButton}>
              <Save width={22} height={22} fill="#fff" stroke="#004225" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={containerStyles.list}>
        {reorderedItems.map((item) => (
          <AudioItemRow
            key={item.name}
            item={item}
            isSelected={selectedFiles.includes(item.name)}
            weightValue={weightValues[item.name] || '10'}
            onWeightChange={(value) => handleWeightChange(item.name, value)}
            onSelectAudio={() => handleSelectAudio(item.name)}
            onDeleteAudio={handleAudioDeleted}
            editing={editingIntervals[item.name.toLowerCase()] || false}
            localInterval={localIntervals[item.name.toLowerCase()] || ''}
            setLocalIntervals={setLocalIntervals}
            onEditInterval={() =>
              setEditingIntervals((prev) => ({ ...prev, [item.name.toLowerCase()]: true }))
            }
            onSaveInterval={() => {
              setEditingIntervals((prev) => ({ ...prev, [item.name.toLowerCase()]: false }));
              const intervalStr = localIntervals[item.name.toLowerCase()] || '';
              const intervalMs = convertMinutesSecondsToMs(intervalStr);
              if (!isNaN(intervalMs)) {
                // Update the context with the new interval
                setAudioIntervalForAudio(stateName, item.name, intervalMs);
              }
            }}
          />
        ))}
      </View>

      {/* Add RecordItemRow here */}
      <RecordItemRow
        stateName={stateName}
        recordingName={recordingName}
        onRecordingNameChange={handleRecordingNameChange}
        onAudioSaved={handleAudioSaved} // Pass the callback to refresh the list
      />

      {/* Picker Modal */}
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: '#004225',
    width: 180,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
  },
});

export default AssignAudiosModal;
