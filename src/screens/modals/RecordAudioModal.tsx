// src/screens/modals/RecordAudioModal.tsx
import { commonStyles } from '../../styles/commonStyles';

import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IntervalInputModal from './IntervalInputModal';
import { IntervalContext } from '../../contexts/SceneProvider';
import ModalMessage from '../../config/ModalMessage'; // Import the custom message component
import { sanitizeFileName } from '../../config/sanitizer';

type RecordAudioModalProps = {
  visible: boolean;
  onClose: () => void;
};

const RecordAudioModal: React.FC<RecordAudioModalProps> = ({
  visible,
  onClose,
}) => {
  const { states } = useContext(IntervalContext);
  const { intervals, setIntervalForState } = useContext(IntervalContext);
  const [selectedState, setSelectedState] = useState(states[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [recordedFilePath, setRecordedFilePath] = useState<string | null>(null);
  const [showIntervalModal, setShowIntervalModal] = useState(false);
  const [recordingName, setRecordingName] = useState<string>(
    states[0].toLowerCase()
  );
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const audioRecorderPlayerRef = useRef<AudioRecorderPlayer>(
    new AudioRecorderPlayer()
  );

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
        if (
          granted['android.permission.RECORD_AUDIO'] !==
            PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] !==
            PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.READ_EXTERNAL_STORAGE'] !==
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Required permissions not granted');
          // Handle lack of permissions if necessary
        }
      } catch (err) {
        console.warn('Permission request error:', err);
      }
    };

    if (Platform.OS === 'android') {
      requestPermissions();
    }

    const audioRecorderPlayer = audioRecorderPlayerRef.current;

    return () => {
      audioRecorderPlayer.stopRecorder().catch(() => {});
      audioRecorderPlayer.stopPlayer().catch(() => {});
      audioRecorderPlayer.removeRecordBackListener();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, [visible]);

  useEffect(() => {
    // Reset recording name when selectedState changes
    setRecordingName(selectedState.toLowerCase());
  }, [selectedState]);

  // Sanitize recording name
  const sanitizedRecordingName = sanitizeFileName(recordingName);

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
      console.log('No recording to play');
      return;
    }
    try {
      await audioRecorderPlayerRef.current.startPlayer(recordedFilePath);
      audioRecorderPlayerRef.current.addPlayBackListener((e) => {
        if (e.currentPosition >= e.duration) {
          audioRecorderPlayerRef.current.stopPlayer();
          audioRecorderPlayerRef.current.removePlayBackListener();
          setIsPlayingBack(false);
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

  const onSaveRecording = () => {
    if (!recordedFilePath) {
      console.log('No recording to save');
      return;
    }
    // Show the interval input modal
    setShowIntervalModal(true);
  };

  const handleIntervalSave = async (newInterval: number) => {
    const documentsPath = RNFS.DocumentDirectoryPath;
    const stateFolder = `${documentsPath}/${selectedState}`;

    // Ensure the state folder exists
    try {
      const dirExists = await RNFS.exists(stateFolder);
      if (!dirExists) {
        await RNFS.mkdir(stateFolder);
      }
    } catch (error) {
      console.log('Error creating directory:', error);
      return;
    }

    // Prevent empty recording names
    if (sanitizedRecordingName.length === 0) {
      console.log('Recording name is empty after sanitization');
      setMessage({ text: 'Recording name is invalid.', type: 'error' });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
      return;
    }

    const destinationPath = `${stateFolder}/${sanitizedRecordingName}.mp3`;

    try {
      if (recordedFilePath) {
        await RNFS.copyFile(recordedFilePath, destinationPath);
      } else {
        throw new Error('Recorded file path is null');
      }
      console.log(`Recording saved to: ${destinationPath}`);

      // Update the interval in context
      setIntervalForState(selectedState, newInterval);

      // Save the interval to AsyncStorage
      await AsyncStorage.setItem(
        `@interval_${selectedState.toLowerCase()}`,
        newInterval.toString()
      );

      // Reset states
      setRecordingName(selectedState.toLowerCase());
      setRecordedFilePath(null);

      setShowIntervalModal(false);

      // Show a message within the modal
      setMessage({ text: 'Recording saved successfully!', type: 'success' });

      // Hide the message after a delay
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving recording:', error);
      setMessage({ text: 'Failed to save the recording.', type: 'error' });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="slide">
        <View style={commonStyles.modalContainer}>
          {/* Display the message if it exists */}
          {message && <ModalMessage message={message.text} type={message.type} />}

          <Text style={commonStyles.title}>Record Audio</Text>

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

          <View style={commonStyles.inputContainer}>
            <Text style={commonStyles.label}>Recording Name:</Text>
            <TextInput
              style={commonStyles.textInput}
              value={recordingName}
              onChangeText={setRecordingName}
              placeholder="Enter recording name"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={commonStyles.buttonContainer}>
            <TouchableOpacity
              onPress={!isRecording ? onStartRecord : onStopRecord}
              style={[
                commonStyles.button,
                isRecording && commonStyles.disabledButton,
              ]}
              disabled={isRecording && !recordedFilePath}
            >
              <Text style={commonStyles.buttonText}>
                {!isRecording ? 'Start Recording' : 'Stop Recording'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={commonStyles.buttonContainer}>
            <TouchableOpacity
              onPress={!isPlayingBack ? onPlay : onStopPlay}
              style={[
                commonStyles.button,
                (!recordedFilePath || isPlayingBack) &&
                  commonStyles.disabledButton,
              ]}
              disabled={!recordedFilePath || isPlayingBack}
            >
              <Text style={commonStyles.buttonText}>
                {!isPlayingBack ? 'Play Recording' : 'Stop Playback'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={commonStyles.buttonContainer}>
            <TouchableOpacity
              onPress={onSaveRecording}
              style={[
                commonStyles.button,
                !recordedFilePath && commonStyles.disabledButton,
              ]}
              disabled={!recordedFilePath}
            >
              <Text style={commonStyles.buttonText}>Save Recording</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={commonStyles.closeButton}>
            <Text style={commonStyles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>

        {showIntervalModal && (
          <IntervalInputModal
            visible={showIntervalModal}
            onClose={() => setShowIntervalModal(false)}
            onSave={handleIntervalSave}
            stateName={selectedState}
            currentInterval={intervals[selectedState.toLowerCase()]}
          />
        )}
      </Modal>
    </>
  );
};

export default RecordAudioModal;
