// src/screens/modals/UpdateIntervalsModal.tsx
import React, { useState, useEffect, useContext } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commonStyles } from '../../styles/commonStyles'; // Import common styles
import { IntervalContext } from '../../contexts/SceneProvider'; // Adjust the path as necessary

type UpdateIntervalsModalProps = {
  visible: boolean;
  onClose: () => void;
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
  if (isNaN(minutes) || isNaN(seconds)) {
    return NaN;
  }
  return minutes * 60000 + seconds * 1000;
};

const STATES = ['Active', 'Spotted', 'Proximity', 'Trigger'];

const UpdateIntervalsModal: React.FC<UpdateIntervalsModalProps> = ({
  visible,
  onClose,
}) => {
  const { setIntervalForState } = useContext(IntervalContext);
  const [intervals, setIntervals] = useState<{ [key: string]: string }>({
    active: '00:05',
    spotted: '00:06',
    proximity: '00:07',
    trigger: '00:08',
  });

  useEffect(() => {
    // Load saved intervals from AsyncStorage
    const loadIntervals = async () => {
      try {
        const loadedIntervals: { [key: string]: string } = {};
        for (const state of STATES) {
          const storedInterval = await AsyncStorage.getItem(`@interval_${state.toLowerCase()}`);
          if (storedInterval !== null) {
            loadedIntervals[state.toLowerCase()] = convertMsToMinutesSeconds(parseInt(storedInterval, 10));
          }
        }
        setIntervals(loadedIntervals);
      } catch (error) {
        console.error('Failed to load intervals', error);
      }
    };

    if (visible) {
      loadIntervals();
    }
  }, [visible]);

  const handleSave = async () => {
    try {
      for (const state of STATES) {
        const intervalMs = convertMinutesSecondsToMs(intervals[state.toLowerCase()]);
        if (isNaN(intervalMs)) {
          console.error(`Invalid interval for ${state}: ${intervals[state.toLowerCase()]}`);
          return;
        }
        await AsyncStorage.setItem(`@interval_${state.toLowerCase()}`, intervalMs.toString());
        setIntervalForState(state, intervalMs); // Update context
      }
      onClose();
    } catch (error) {
      console.error('Error saving intervals:', error);
    }
  };

  const handleChange = (state: string, value: string) => {
    if (value.length > 5) {
      return;
    }
    if (value.length === 2 && !value.includes(':')) {
      setIntervals((prev) => ({ ...prev, [state.toLowerCase()]: `${value}:` }));
    } else {
      setIntervals((prev) => ({ ...prev, [state.toLowerCase()]: value }));
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Update Intervals</Text>
          {STATES.map((state) => (
            <View key={state} style={styles.inputContainer}>
              <Text style={styles.label}>{state}</Text>
              <TextInput
                style={styles.input}
                value={intervals[state.toLowerCase()]}
                onChangeText={(value) => handleChange(state, value)}
                keyboardType="numeric"
                maxLength={5}
                placeholder="mm:ss"
              />
            </View>
          ))}

          {/* Save Intervals Button */}
          <TouchableOpacity onPress={handleSave} style={commonStyles.button}>
            <Text style={commonStyles.buttonText}>Save Intervals</Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity onPress={onClose} style={commonStyles.button}>
            <Text style={commonStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default UpdateIntervalsModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#004225', // British Racing Green background
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    color: '#fff',
  },
  input: {
    width: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#1b1b1b', // Erie Black
  },
});
