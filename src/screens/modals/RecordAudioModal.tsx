// src/screens/modals/RecordAudioModal.tsx

import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  TextInput,
  StyleSheet, // Import StyleSheet to define local styles
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IntervalInputModal from './IntervalInputModal';
import { IntervalContext } from '../../contexts/SceneProvider';
import ModalMessage from '../../config/ModalMessage';
import { sanitizeFileName } from '../../config/sanitizer';
import { commonStyles } from '../../styles/commonStyles';
import Modal from '../../styles/AppModal'; // Update import path

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

  const [selectedState, setSelectedState] = useState<string>(
    states && states.length > 0 ? states[0] : ''
  );

  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [recordedFilePath, setRecordedFilePath] = useState<string | null>(null);
  const [showIntervalModal, setShowIntervalModal] = useState(false);
  const [recordingName, setRecordingName] = useState<string>(
    selectedState ? selectedState.toLowerCase() : ''
  );
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

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
    if (selectedState) {
      setRecordingName(selectedState.toLowerCase());
    } else {
      setRecordingName('');
    }
  }, [selectedState]);

  // Sanitize recording name
  const sanitizedRecordingName = sanitizeFileName(recordingName);

  // Define the missing functions
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
    if (!selectedState) {
      console.error('No state selected.');
      return;
    }

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
      {/* Updated Modal usage */}
      <Modal isVisible={visible} onClose={onClose}>
        <View style={commonStyles.modalContent}>
          {/* Display the message if it exists */}
          {message && <ModalMessage message={message.text} type={message.type} />}

          {states && states.length > 0 ? (
            <>
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

              {/* Recording Name Input */}
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

              {/* Recording Controls */}
              <View style={commonStyles.buttonContainer}>
                <TouchableOpacity
                  onPress={!isRecording ? onStartRecord : onStopRecord}
                  style={[
                    commonStyles.button,
                    isRecording && localStyles.disabledButton, // Use localStyles
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
                      localStyles.disabledButton, // Use localStyles
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
                    !recordedFilePath && localStyles.disabledButton, // Use localStyles
                  ]}
                  disabled={!recordedFilePath}
                >
                  <Text style={commonStyles.buttonText}>Save Recording</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={localStyles.errorText}>
              No states available. Please check your scene configuration.
            </Text>
          )}

          <TouchableOpacity onPress={onClose} style={commonStyles.closeButton}>
            <Text style={commonStyles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>

        {showIntervalModal && selectedState && (
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

const localStyles = StyleSheet.create({
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  disabledButton: {
    backgroundColor: '#888', // Adjust as needed
  },
});

export default RecordAudioModal;
