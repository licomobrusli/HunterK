// src/screens/modals/SceneBuilderModal.tsx
import { commonStyles } from '../../styles/commonStyles';

import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IntervalContext } from '../../contexts/SceneProvider';
import AssignAudiosModal from './AssignAudiosModal';

type SceneBuilderModalProps = {
  visible: boolean;
  onClose: () => void;
};

const convertMsToMinutesSeconds = (milliseconds: number) => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const convertMinutesSecondsToMs = (time: string) => {
  const [minutes, seconds] = time.split(':').map(Number);
  if (isNaN(minutes) || isNaN(seconds)) {
    return NaN;
  }
  return minutes * 60000 + seconds * 1000;
};

const SceneBuilderModal: React.FC<SceneBuilderModalProps> = ({
  visible,
  onClose,
}) => {
  const { intervals, setIntervalForState, states} = useContext(IntervalContext);
  const [localIntervals, setLocalIntervals] = useState<{ [key: string]: string }>(
    {}
  );

  // State for controlling the visibility of the Assign Audios sub-modal
  const [assignAudiosModalVisible, setAssignAudiosModalVisible] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  useEffect(() => {
    // Load saved intervals from AsyncStorage
    const loadIntervals = async () => {
      try {
        const loadedIntervals: { [key: string]: string } = {};
        for (const state of states) {
          const storedInterval = await AsyncStorage.getItem(
            `@interval_${state.toLowerCase()}`
          );
          if (storedInterval !== null) {
            loadedIntervals[state.toLowerCase()] = convertMsToMinutesSeconds(
              parseInt(storedInterval, 10)
            );
          } else {
            // Use the interval from context if not in AsyncStorage
            loadedIntervals[state.toLowerCase()] = convertMsToMinutesSeconds(
              intervals[state.toLowerCase()]
            );
          }
        }
        setLocalIntervals(loadedIntervals);
      } catch (error) {
        console.error('Failed to load intervals', error);
      }
    };

    if (visible) {
      loadIntervals();
    }
  }, [visible, intervals, states]);

  const handleSave = async () => {
    try {
      for (const state of states) {
        const intervalMs = convertMinutesSecondsToMs(
          localIntervals[state.toLowerCase()]
        );
        if (isNaN(intervalMs)) {
          console.error(
            `Invalid interval for ${state}: ${localIntervals[state.toLowerCase()]}`
          );
          return;
        }
        await AsyncStorage.setItem(
          `@interval_${state.toLowerCase()}`,
          intervalMs.toString()
        );
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
      setLocalIntervals((prev) => ({
        ...prev,
        [state.toLowerCase()]: `${value}:`,
      }));
    } else {
      setLocalIntervals((prev) => ({ ...prev, [state.toLowerCase()]: value }));
    }
  };

  const handleStatePress = (state: string) => {
    // Open the Assign Audios sub-modal for the selected state
    setSelectedState(state);
    setAssignAudiosModalVisible(true);
  };

  const closeAssignAudiosModal = () => {
    setAssignAudiosModalVisible(false);
    setSelectedState(null);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={commonStyles.modalContainer}>
        <View style={commonStyles.modalContent}>
          <Text style={commonStyles.title}>Scene Builder</Text>
          {states.map((state) => (
            <View key={state} style={commonStyles.inputContainer}>
              <TouchableOpacity onPress={() => handleStatePress(state)}>
                <Text style={commonStyles.label}>{state}</Text>
              </TouchableOpacity>
              <TextInput
                style={commonStyles.input}
                value={localIntervals[state.toLowerCase()] || ''}
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

        {/* Assign Audios Sub-Modal */}
        {assignAudiosModalVisible && (
          <AssignAudiosModal
            visible={assignAudiosModalVisible}
            onClose={closeAssignAudiosModal}
            stateName={selectedState || ''}
          />
        )}
      </View>
    </Modal>
  );
};

export default SceneBuilderModal;
