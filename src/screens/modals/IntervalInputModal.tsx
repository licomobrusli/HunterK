// src/screens/modals/IntervalInputModal.tsx
import { commonStyles } from '../../styles/commonStyles';

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, Alert } from 'react-native';

type IntervalInputModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (interval: number) => void;
  stateName: string;
  currentInterval: number; // This will be in milliseconds
};

// Utility function to convert milliseconds to "mm:ss" format
const convertMsToMinutesSeconds = (milliseconds: number) => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Utility function to convert "mm:ss" format to milliseconds
const convertMinutesSecondsToMs = (time: string) => {
  const [minutes, seconds] = time.split(':').map(Number);
  if (isNaN(minutes) || isNaN(seconds)) {return NaN;}
  return minutes * 60000 + seconds * 1000;
};

const IntervalInputModal: React.FC<IntervalInputModalProps> = ({
  visible,
  onClose,
  onSave,
  stateName,
  currentInterval,
}) => {
  const [inputInterval, setInputInterval] = useState<string>('');

  // When the modal opens, convert currentInterval (milliseconds) to "mm:ss"
  useEffect(() => {
    const formattedInterval = convertMsToMinutesSeconds(currentInterval);
    setInputInterval(formattedInterval);
  }, [currentInterval]);

  const handleSave = () => {
    // Convert "mm:ss" input into milliseconds
    const intervalValue = convertMinutesSecondsToMs(inputInterval);
    if (isNaN(intervalValue)) {
      Alert.alert('Invalid Interval', 'Please enter a valid interval in minutes and seconds (mm:ss).');
      return;
    }
    onSave(intervalValue); // Pass the interval in milliseconds
    onClose();
  };

  // Automatically manage the input to prevent deletion of the ":"
  const handleChange = (text: string) => {
    // Prevent more than 5 characters
    if (text.length > 5) {return;}

    // Ensure the ":" is at position 2
    if (text.length === 2 && !text.includes(':')) {
      setInputInterval(`${text}:`); // Automatically add ":"
    } else if (text.length === 1 && text.includes(':')) {
      setInputInterval(text.replace(':', '')); // Remove accidental ":" at the wrong position
    } else {
      setInputInterval(text);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={commonStyles.subModalContainer}>
        <View style={commonStyles.subModalContent}>
          <Text style={commonStyles.modalTitle}>Set Interval for {stateName}</Text>
          <TextInput
            style={commonStyles.input}
            value={inputInterval}
            onChangeText={handleChange}
            placeholder="mm:ss"
            keyboardType="numeric"
            maxLength={5} // Limit to "mm:ss" format
          />
          <Button title="Save Interval" onPress={handleSave} />
          <Button title="Cancel" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

export default IntervalInputModal;
