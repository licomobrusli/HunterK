// src/config/AudioItemRow.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ToastAndroid, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { commonStyles } from '../styles/commonStyles';
import { containerStyles } from '../styles/containerStyles';
import { buttonStyles } from '../styles/buttonStyles';
import { textStyles } from '../styles/textStyles';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Weight from '../assets/icons/weight.svg';
import Play from '../assets/icons/play.svg';
import Bin from '../assets/icons/bin.svg';

const audioRecorderPlayer = new AudioRecorderPlayer(); // Instantiate outside component

type AudioItemRowProps = {
  item: { name: string; path: string };
  isSelected: boolean;
  weightValue: string;
  onWeightChange: (value: string) => void;
  onSelectAudio: () => void;
  onDeleteAudio: () => void;
  editing: boolean;
  localInterval: string | null; // Allow localInterval to be string or null
  setLocalIntervals: React.Dispatch<React.SetStateAction<{ [key: string]: string | null }>>;
  onEditInterval: () => void;
  onSaveInterval: () => void;
};

const AudioItemRow: React.FC<AudioItemRowProps> = ({
  item,
  isSelected,
  weightValue,
  onWeightChange,
  onSelectAudio,
  onDeleteAudio,
  editing,
  localInterval,
  setLocalIntervals,
  onEditInterval,
  onSaveInterval,
}) => {
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (isPlaying) {
        audioRecorderPlayer.stopPlayer();
        audioRecorderPlayer.removePlayBackListener();
      }
    };
  }, [isPlaying]);

  const playOrStopAudio = async () => {
    if (isPlaying) {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
    } else {
      try {
        await audioRecorderPlayer.startPlayer(item.path);
        audioRecorderPlayer.addPlayBackListener((e) => {
          if (e.currentPosition >= e.duration) {
            audioRecorderPlayer.stopPlayer();
            audioRecorderPlayer.removePlayBackListener();
            setIsPlaying(false);
          }
        });
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
        ToastAndroid.show('Failed to play audio.', ToastAndroid.SHORT);
      }
    }
  };

  const confirmDeleteAudio = () => {
    Alert.alert(
      'Delete Audio',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            try {
              await RNFS.unlink(item.path);
              ToastAndroid.show('Audio deleted successfully.', ToastAndroid.SHORT);
              onDeleteAudio(); // Notify parent component to refresh the list
            } catch (error) {
              console.error('Error deleting audio:', error);
              ToastAndroid.show('Failed to delete audio.', ToastAndroid.SHORT);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleChange = (value: string) => {
    if (value.length > 5) {
      return;
    }

    if (value.length === 2 && !value.includes(':')) {
      setLocalIntervals((prev) => ({
        ...prev,
        [item.name.toLowerCase()]: `${value}:`,
      }));
    } else {
      setLocalIntervals((prev) => ({ ...prev, [item.name.toLowerCase()]: value }));
    }
  };

  const handleBlur = () => {
    onSaveInterval();
  };

  // New function to handle long press on the interval field
  const handleIntervalLongPress = () => {
    setLocalIntervals((prev) => ({ ...prev, [item.name.toLowerCase()]: null }));
  };

  return (
    <View style={containerStyles.itemContainer}>
      <View style={containerStyles.containerLeft}>
        {isEditingWeight ? (
          <TextInput
            style={buttonStyles.iconButton}
            value={weightValue}
            keyboardType="numeric"
            maxLength={2}
            onChangeText={onWeightChange}
            onBlur={() => setIsEditingWeight(false)}
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditingWeight(true)}>
            <View style={buttonStyles.iconButton}>
              <Weight width={22} height={22} fill="#fff" stroke="#004225" strokeWidth={5} />
              <Text style={textStyles.textAlo}>{weightValue}</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onSelectAudio}>
          <Text
            style={[
              commonStyles.fixedWidthLabel,
              isSelected ? textStyles.greenText : null,
            ]}
          >
            {item.name.replace(/\.[^/.]+$/, '')} {/* Removes file extension */}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={containerStyles.containerRight}>
        <View style={buttonStyles.timeButton}>
          {editing ? (
            <TextInput
              style={textStyles.text0}
              value={localInterval ?? ''}
              onChangeText={handleChange}
              onBlur={handleBlur}
              keyboardType="numeric"
              maxLength={5}
              placeholder="mm:ss"
              autoFocus
            />
          ) : (
            <TouchableOpacity onPress={onEditInterval} onLongPress={handleIntervalLongPress}>
              <Text style={textStyles.text0}>{localInterval || 'mm:ss'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Ensuring all icon buttons are present */}
        <View style={buttonStyles.iconButton} />

        <TouchableOpacity onPress={playOrStopAudio}>
          <View style={buttonStyles.iconButton}>
            <Play width={18} height={18} fill={isPlaying ? 'green' : '#fff'} stroke="#004225" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={confirmDeleteAudio}>
          <View style={buttonStyles.iconButton}>
            <Bin width={18} height={18} fill="#fff" stroke="#004225" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AudioItemRow;
