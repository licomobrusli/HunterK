// src/components/RecordItemRow.tsx

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
  recordingName: string;
  onRecordingNameChange: (value: string) => void;
  onSaveRecording: () => void;
};

const RecordItemRow: React.FC<RecordItemRowProps> = ({
  recordingName,
  onRecordingNameChange,
  onSaveRecording,
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

  return (
    <View style={containerStyles.itemContainer}>
      {/* Placeholder Icon and Recording Name Field */}
      <View style={containerStyles.containerLeft}>
        <View style={buttonStyles.iconButton} />
        <TextInput
            style={commonStyles.fixedWidthLabel}
            value={recordingName}
            onChangeText={onRecordingNameChange}
            placeholder="Recording Name"
            />
        </View>

      {/* Action Buttons */}
      <View style={containerStyles.containerRight}>
        {/* Microphone Icon to Start/Stop Recording */}
        <TouchableOpacity onPress={isRecording ? onStopRecord : onStartRecord}>
          <View style={buttonStyles.iconButton}>
            <Microphone width={18} height={18} fill={isRecording ? 'red' : '#fff'} stroke="#004225" />
          </View>
        </TouchableOpacity>

        {/* Play Icon to Play/Stop Audio */}
        <TouchableOpacity onPress={playOrStopAudio}>
          <View style={buttonStyles.iconButton}>
            <Play width={18} height={18} fill={isPlaying ? 'green' : '#fff'} stroke="#004225" />
          </View>
        </TouchableOpacity>

        {/* Save Icon to Save Recording */}
        <TouchableOpacity onPress={onSaveRecording}>
          <View style={buttonStyles.iconButton}>
            <Save width={22} height={22} fill="#fff" stroke="#004225" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RecordItemRow;
