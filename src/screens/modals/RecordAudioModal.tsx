// src/screens/modals/RecordAudioModal.tsx

import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Picker } from '@react-native-picker/picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { IntervalContext } from '../../contexts/SceneProvider';
import { commonStyles } from '../../styles/commonStyles';
import Modal from '../../styles/AppModal';

const RecordAudioModal: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  const { states } = useContext(IntervalContext);

  const [selectedState, setSelectedState] = useState<string>(
    states && states.length > 0 ? states[0] : ''
  );

  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [recordedFilePath, setRecordedFilePath] = useState<string | null>(null);
  const [recordingName, setRecordingName] = useState<string>(
    selectedState ? selectedState.toLowerCase() : ''
  );

  const audioRecorderPlayerRef = useRef<AudioRecorderPlayer>(
    new AudioRecorderPlayer()
  );

  useEffect(() => {
    if (selectedState) {
      setRecordingName(selectedState.toLowerCase());
    } else {
      setRecordingName('');
    }
  }, [selectedState]);

  // Recording Functions
  const onStartRecord = async () => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/recordedAudio.mp3`;
      const uri = await audioRecorderPlayerRef.current.startRecorder(path);
      audioRecorderPlayerRef.current.addRecordBackListener((e) => {
        console.log('Recording', e.currentPosition);
        return;
      });
      setIsRecording(true);
      setRecordedFilePath(uri);
      console.log(`Recording started at: ${uri}`);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const onStopRecord = async () => {
    try {
      const result = await audioRecorderPlayerRef.current.stopRecorder();
      audioRecorderPlayerRef.current.removeRecordBackListener();
      setIsRecording(false);
      setRecordedFilePath(result);
      console.log(`Recording stopped at: ${result}`);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const onPlay = async () => {
    if (!recordedFilePath) {
      ToastAndroid.show('No recording to play', ToastAndroid.SHORT);
      return;
    }
    try {
      await audioRecorderPlayerRef.current.startPlayer(recordedFilePath);
      audioRecorderPlayerRef.current.addPlayBackListener((e) => {
        if (e.currentPosition >= e.duration) {
          onStopPlay();
        }
        return;
      });
      setIsPlayingBack(true);
      console.log('Playback started');
    } catch (error) {
      console.error('Error during playback:', error);
    }
  };

  const onStopPlay = async () => {
    try {
      await audioRecorderPlayerRef.current.stopPlayer();
      audioRecorderPlayerRef.current.removePlayBackListener();
      setIsPlayingBack(false);
      console.log('Playback stopped');
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  };

  const onSaveRecording = async () => {
    if (!recordedFilePath) {
      ToastAndroid.show('No recording to save', ToastAndroid.SHORT);
      return;
    }

    const sanitizedRecordingName = recordingName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const stateFolder = `${RNFS.DocumentDirectoryPath}/audios/${selectedState.toLowerCase()}`;
    const destinationPath = `${stateFolder}/${sanitizedRecordingName}.mp3`;

    if (!sanitizedRecordingName) {
      ToastAndroid.show('Invalid recording name.', ToastAndroid.SHORT);
      return;
    }

    try {
      // Ensure the 'audios' directory exists
      const audiosDir = `${RNFS.DocumentDirectoryPath}/audios`;
      const audiosDirExists = await RNFS.exists(audiosDir);
      if (!audiosDirExists) {
        await RNFS.mkdir(audiosDir);
      }

      // Ensure the state-specific subdirectory exists
      const folderExists = await RNFS.exists(stateFolder);
      if (!folderExists) {
        await RNFS.mkdir(stateFolder);
      }

      // Move the recorded file to the destination path
      await RNFS.moveFile(recordedFilePath, destinationPath);
      setRecordedFilePath(null);
      ToastAndroid.show('Recording saved successfully!', ToastAndroid.SHORT);
      console.log(`Recording saved at: ${destinationPath}`);
    } catch (error) {
      console.error('Error saving recording:', error);
      ToastAndroid.show('Failed to save the recording.', ToastAndroid.SHORT);
    }
  };

  return (
    <Modal isVisible={visible} onClose={onClose}>
      <View style={commonStyles.modalContent}>
        {states && states.length > 0 ? (
          <>
            <Text style={commonStyles.boldText1}>Record Audio</Text>

            <Text style={commonStyles.label}>Select State:</Text>
            <Picker
              selectedValue={selectedState}
              onValueChange={(itemValue) => setSelectedState(itemValue)}
              style={commonStyles.picker}
              dropdownIconColor="#fff"
            >
              {states.map((state) => (
                <Picker.Item label={state} value={state} key={state} />
              ))}
            </Picker>

            <View style={commonStyles.container}>
              <Text style={commonStyles.label}>Recording Name:</Text>
              <TextInput
                style={commonStyles.textInput}
                value={recordingName}
                onChangeText={setRecordingName}
                placeholder="Enter recording name"
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={[commonStyles.buttonContainer, commonStyles.disabledButton]}>
              <TouchableOpacity onPress={!isRecording ? onStartRecord : onStopRecord} style={commonStyles.button}>
                <Icon name="mic" size={30} color={isRecording ? 'red' : 'white'} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (recordedFilePath) {
                    !isPlayingBack ? onPlay() : onStopPlay();
                  } else {
                    ToastAndroid.show('No recording to play', ToastAndroid.SHORT);
                  }
                }}
                style={[commonStyles.button, !recordedFilePath && commonStyles.disabledButton]}
                disabled={!recordedFilePath}
              >
                <Icon
                  name={!isPlayingBack ? 'play' : 'stop'}
                  size={30}
                  color={!recordedFilePath ? 'grey' : isPlayingBack ? 'green' : 'white'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (recordedFilePath) {
                    onSaveRecording();
                  } else {
                    ToastAndroid.show('No recording to save', ToastAndroid.SHORT);
                  }
                }}
                style={[commonStyles.button, !recordedFilePath && commonStyles.disabledButton]}
                disabled={!recordedFilePath}
              >
                <Icon name="save" size={30} color={!recordedFilePath ? 'grey' : 'white'} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={commonStyles.text0}>No states available. Please check your scene configuration.</Text>
        )}
      </View>
    </Modal>
  );
};

export default RecordAudioModal;
