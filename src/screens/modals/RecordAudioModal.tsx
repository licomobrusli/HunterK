import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs'; // Import file system

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

  const audioRecorderPlayerRef = useRef<AudioRecorderPlayer>(
    new AudioRecorderPlayer()
  );

  useEffect(() => {
    const audioRecorderPlayer = audioRecorderPlayerRef.current;

    const requestPermissions = async () => {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
        if (
          granted['android.permission.RECORD_AUDIO'] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.READ_EXTERNAL_STORAGE'] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
        }
      } catch (err) {
      }
    };

    if (Platform.OS === 'android') {
      requestPermissions();
    }

    return () => {
      audioRecorderPlayer.stopRecorder().catch(() => {});
      audioRecorderPlayer.stopPlayer().catch(() => {});
      audioRecorderPlayer.removeRecordBackListener();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, [visible]);

  const onStartRecord = async () => {
    try {
      // Use internal app storage instead of 'sdcard'
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

  const onSaveRecording = async () => {
    if (!recordedFilePath) {
      console.log('No recording to save');
      return;
    }

    const documentsPath = RNFS.DocumentDirectoryPath;
    const destinationPath = `${documentsPath}/${selectedState.toLowerCase()}.mp3`;

    try {
      await RNFS.copyFile(recordedFilePath, destinationPath);
      console.log(`Recording saved to: ${destinationPath}`);
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
          {!isRecording ? (
            <Button title="Start Recording" onPress={onStartRecord} />
          ) : (
            <Button title="Stop Recording" onPress={onStopRecord} />
          )}
        </View>

        <View style={styles.buttonContainer}>
          {!isPlayingBack ? (
            <Button
              title="Play Recording"
              onPress={onPlay}
              disabled={!recordedFilePath}
            />
          ) : (
            <Button title="Stop Playback" onPress={onStopPlay} />
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Save Recording"
            onPress={onSaveRecording}
            disabled={!recordedFilePath}
          />
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default RecordAudioModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#08591C',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  closeButtonText: {
    fontSize: 18,
    color: 'blue',
  },
});
