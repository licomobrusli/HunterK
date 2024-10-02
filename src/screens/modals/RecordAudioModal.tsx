// RecordAudioModal.tsx
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

  // Use useRef to store the audioRecorderPlayer instance
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
        ]);
        if (
          granted['android.permission.RECORD_AUDIO'] !==
            PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] !==
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions not granted');
        }
      } catch (err) {
        console.warn(err);
      }
    };

    if (Platform.OS === 'android') {
      requestPermissions();
    }

    return () => {
      audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removeRecordBackListener();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, []);

  const onStartRecord = async () => {
    const path = Platform.select({
      ios: 'recordedAudio.m4a',
      android: 'sdcard/recordedAudio.mp3',
    });
    const uri = await audioRecorderPlayerRef.current.startRecorder(path);
    audioRecorderPlayerRef.current.addRecordBackListener((e) => {
      console.log('Recording', e.currentPosition);
      return;
    });
    setIsRecording(true);
    setRecordedFilePath(uri);
    console.log(`Recording started at: ${uri}`);
  };

  const onStopRecord = async () => {
    const result = await audioRecorderPlayerRef.current.stopRecorder();
    audioRecorderPlayerRef.current.removeRecordBackListener();
    setIsRecording(false);
    setRecordedFilePath(result);
    console.log(`Recording stopped at: ${result}`);
  };

  const onPlay = async () => {
    if (!recordedFilePath) {
      console.log('No recording to play');
      return;
    }
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
  };

  const onStopPlay = async () => {
    await audioRecorderPlayerRef.current.stopPlayer();
    audioRecorderPlayerRef.current.removePlayBackListener();
    setIsPlayingBack(false);
    console.log('Playback stopped');
  };

  const onSaveRecording = async () => {
    if (!recordedFilePath) {
      console.log('No recording to save');
      return;
    }

    // Get the documents directory
    const RNFS = require('react-native-fs');
    const documentsPath = RNFS.DocumentDirectoryPath;

    // Destination path for the custom audio file
    const destinationPath = `${documentsPath}/${selectedState.toLowerCase()}.mp3`;

    try {
      // Copy the recorded file to the destination path
      await RNFS.copyFile(recordedFilePath, destinationPath);
      console.log(`Recording saved to: ${destinationPath}`);

      // Close the modal after saving
      onClose();
    } catch (error) {
      console.log('Error saving recording:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Record Audio</Text>

        {/* Dropdown to select the state */}
        <Picker
          selectedValue={selectedState}
          onValueChange={(itemValue) => setSelectedState(itemValue)}
          style={styles.picker}
        >
          {STATES.map((state) => (
            <Picker.Item label={state} value={state} key={state} />
          ))}
        </Picker>

        {/* Recording Controls */}
        <View style={styles.buttonContainer}>
          {!isRecording ? (
            <Button title="Start Recording" onPress={onStartRecord} />
          ) : (
            <Button title="Stop Recording" onPress={onStopRecord} />
          )}
        </View>

        {/* Playback Controls */}
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

        {/* Save Recording */}
        <View style={styles.buttonContainer}>
          <Button
            title="Save Recording"
            onPress={onSaveRecording}
            disabled={!recordedFilePath}
          />
        </View>

        {/* Close Modal */}
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
    // Adjust paddingTop if header overlaps content
    paddingTop: 20,
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
