// src/screens/modals/RecordAudioModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import IntervalInputModal from './IntervalInputModal';
import { commonStyles } from '../../styles/commonStyles'; // Import common styles

type RecordAudioModalProps = {
  visible: boolean;
  onClose: () => void;
};

const STATES = ['Active', 'Spotted', 'Proximity', 'Trigger'];

const RecordAudioModal: React.FC<RecordAudioModalProps> = ({
  visible,
  onClose,
}) => {
  const [selectedState, setSelectedState] = useState(STATES[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [recordedFilePath, setRecordedFilePath] = useState<string | null>(null);
  const [showIntervalModal, setShowIntervalModal] = useState(false);

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

  const handleIntervalSave = async (_newInterval: number) => {
    const documentsPath = RNFS.DocumentDirectoryPath;
    const destinationPath = `${documentsPath}/${selectedState.toLowerCase()}.mp3`;

    try {
      await RNFS.copyFile(recordedFilePath!, destinationPath);
      console.log(`Recording saved to: ${destinationPath}`);

      setShowIntervalModal(false);
      onClose();
    } catch (error) {
      console.log('Error saving recording:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Record Audio</Text>

        <Picker
          selectedValue={selectedState}
          onValueChange={(itemValue) => setSelectedState(itemValue)}
          style={styles.picker}
        >
          {STATES.map((state) => (
            <Picker.Item label={state} value={state} key={state} />
          ))}
        </Picker>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={!isRecording ? onStartRecord : onStopRecord}
            style={[
              commonStyles.button,
              isRecording && commonStyles.disabledButton,
            ]}
          >
            <Text style={commonStyles.buttonText}>
              {!isRecording ? 'Start Recording' : 'Stop Recording'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={!isPlayingBack ? onPlay : onStopPlay}
            style={[
              commonStyles.button,
              (!recordedFilePath || isPlayingBack) && commonStyles.disabledButton,
            ]}
            disabled={!recordedFilePath || isPlayingBack}
          >
            <Text style={commonStyles.buttonText}>
              {!isPlayingBack ? 'Play Recording' : 'Stop Playback'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
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

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={commonStyles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>

      {showIntervalModal && (
        <IntervalInputModal
          visible={showIntervalModal}
          onClose={() => setShowIntervalModal(false)}
          onSave={handleIntervalSave}
          stateName={selectedState}
          currentInterval={5000} // Example interval value
        />
      )}
    </Modal>
  );
};

export default RecordAudioModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#004225',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  picker: {
    marginBottom: 20,
    height: 50,
    width: '100%',
  },
  buttonContainer: {
    marginBottom: 15,
  },
  closeButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
});
