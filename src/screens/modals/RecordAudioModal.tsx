import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Import Feather icons
import { Picker } from '@react-native-picker/picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { IntervalContext } from '../../contexts/SceneProvider';
import ModalMessage from '../../config/ModalMessage';
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
  const [message] = useState<{
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

  // Playback Functions
  const onPlay = async () => {
    if (!recordedFilePath) {
      console.log('No recording to play');
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

  // Save Recording
  const onSaveRecording = () => {
    if (!recordedFilePath) {
      console.log('No recording to save');
      return;
    }
    Alert.alert(
      'Save File',
      `Are you sure you want to save ${recordingName}.mp3?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: () => {
            console.log('Recording saved:', recordedFilePath);
          },
        },
      ]
    );
  };

  return (
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

            {/* Recording, Playback, and Save Controls in a Row */}
            <View style={[commonStyles.buttonContainer, localStyles.controlsRow]}>
              {/* Record Button */}
              <TouchableOpacity
                onPress={!isRecording ? onStartRecord : onStopRecord}
                style={[
                  commonStyles.iconButton,
                ]}
              >
                <Icon
                  name="mic"
                  size={30}
                  color={isRecording ? 'red' : 'white'}
                  accessibilityLabel={!isRecording ? 'Start Recording' : 'Stop Recording'}
                />
              </TouchableOpacity>

              {/* Play/Stop Playback Button */}
              <TouchableOpacity
                onPress={!isPlayingBack ? onPlay : onStopPlay}
                style={[
                  commonStyles.iconButton,
                ]}
              >
                <Icon
                  name={!isPlayingBack ? 'play' : 'stop'}
                  size={30}
                  color={isPlayingBack ? 'green' : 'white'}
                  accessibilityLabel={!isPlayingBack ? 'Play Recording' : 'Stop Playback'}
                />
              </TouchableOpacity>

              {/* Save Button */}
              <TouchableOpacity
                onPress={onSaveRecording}
                style={[
                  commonStyles.iconButton,
                  !recordedFilePath && localStyles.disabledButton,
                ]}
                disabled={!recordedFilePath}
              >
                <Icon
                  name="save"
                  size={30}
                  color="white"
                  accessibilityLabel="Save Recording"
                />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={localStyles.errorText}>
            No states available. Please check your scene configuration.
          </Text>
        )}
      </View>
    </Modal>
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
    backgroundColor: '#888',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
});

export default RecordAudioModal;
