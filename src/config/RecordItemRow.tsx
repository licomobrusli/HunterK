import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, ToastAndroid } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { containerStyles } from '../styles/containerStyles';
import { buttonStyles } from '../styles/buttonStyles';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import Microphone from '../assets/icons/microphone.svg';
import Play from '../assets/icons/play.svg';
import Save from '../assets/icons/save.svg';

const audioRecorderPlayer = new AudioRecorderPlayer();

type RecordItemRowProps = {
  stateName: string;
  recordingName: string;
  onRecordingNameChange: (value: string) => void;
  onAudioSaved: () => void;
};

const RecordItemRow: React.FC<RecordItemRowProps> = ({
  stateName,
  recordingName,
  onRecordingNameChange,
  onAudioSaved,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedFilePath, setRecordedFilePath] = useState<string | null>(null);

  const onStartRecord = async () => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/recordedAudio.mp3`;
      await audioRecorderPlayer.startRecorder(path);
      setIsRecording(true);
      setRecordedFilePath(path);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const onStopRecord = async () => {
    try {
      await audioRecorderPlayer.stopRecorder();
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const playOrStopAudio = async () => {
    if (isPlaying) {
      await audioRecorderPlayer.stopPlayer();
      setIsPlaying(false);
    } else if (recordedFilePath) {
      try {
        await audioRecorderPlayer.startPlayer(recordedFilePath);
        setIsPlaying(true);
      } catch (error) {
        console.error('Error during playback:', error);
        ToastAndroid.show('Failed to play audio.', ToastAndroid.SHORT);
      }
    } else {
      ToastAndroid.show('No recording to play', ToastAndroid.SHORT);
    }
  };

  const handleSaveRecording = async () => {
    if (!recordedFilePath) {
      ToastAndroid.show('No recording to save', ToastAndroid.SHORT);
      return;
    }

    const sanitizedRecordingName = recordingName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const stateFolder = `${RNFS.DocumentDirectoryPath}/audios/${stateName.toLowerCase()}`;
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

        // Call the onAudioSaved prop to refresh the audio list
        onAudioSaved();
    } catch (error) {
        console.error('Error saving recording:', error);
        ToastAndroid.show('Failed to save the recording.', ToastAndroid.SHORT);
    }
};

  return (
    <View style={containerStyles.itemContainer}>
      <View style={containerStyles.containerLeft}>
        <View style={buttonStyles.iconButton} />
        <TextInput
          style={commonStyles.fixedWidthLabel}
          value={recordingName}
          onChangeText={onRecordingNameChange}
          placeholder="Recording Name"
        />
      </View>

      <View style={containerStyles.containerRight}>
        <TouchableOpacity onPress={isRecording ? onStopRecord : onStartRecord}>
          <View style={buttonStyles.iconButton}>
            <Microphone width={18} height={18} fill={isRecording ? 'red' : '#fff'} stroke="#004225" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={playOrStopAudio}>
          <View style={buttonStyles.iconButton}>
            <Play width={18} height={18} fill={isPlaying ? 'green' : '#fff'} stroke="#004225" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSaveRecording}>
          <View style={buttonStyles.iconButton}>
            <Save width={22} height={22} fill="#fff" stroke="#004225" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RecordItemRow;
