import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import { commonStyles } from '../../styles/commonStyles';
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
  const {
    intervals,
    setIntervalForState,
    states,
    setStates,
    setIntervals,
    setSelectedAudios,
  } = useContext(IntervalContext);

  const [localIntervals, setLocalIntervals] = useState<{ [key: string]: string }>(
    {}
  );

  // State for controlling the visibility of the Assign Audios sub-modal
  const [assignAudiosModalVisible, setAssignAudiosModalVisible] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // New state inputs
  const [newStateName, setNewStateName] = useState('');
  const [newStatePosition, setNewStatePosition] = useState('');

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

  const handlePositionChange = (index: number, value: string) => {
    const newPosition = parseInt(value, 10);
    if (isNaN(newPosition) || newPosition < 1) {
      return;
    }

    updateStatePosition(index, newPosition - 1);
  };

  const updateStatePosition = (currentIndex: number, newIndex: number) => {
    if (newIndex < 0 || newIndex >= states.length) {
      return;
    }

    const updatedStates = [...states];
    const [movedState] = updatedStates.splice(currentIndex, 1);
    updatedStates.splice(newIndex, 0, movedState);

    setStates(updatedStates);
  };

  const handleDeleteState = (index: number) => {
    const stateToDelete = states[index];
    Alert.alert(
      'Delete State',
      `Are you sure you want to delete the state "${stateToDelete}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteState(index);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const deleteState = (index: number) => {
    const updatedStates = [...states];
    const [deletedState] = updatedStates.splice(index, 1);
    setStates(updatedStates);

    // Remove associated data
    const lowerState = deletedState.toLowerCase();
    setIntervals((prev) => {
      const updated = { ...prev };
      delete updated[lowerState];
      return updated;
    });
    setSelectedAudios((prev) => {
      const updated = { ...prev };
      delete updated[lowerState];
      return updated;
    });


    // Remove from AsyncStorage
    AsyncStorage.removeItem(`@interval_${lowerState}`);
    AsyncStorage.removeItem(`@selectedAudios_${lowerState}`);
  };

  const handleAddState = () => {
    if (!newStateName.trim()) {
      Alert.alert('Invalid Input', 'State name cannot be empty.');
      return;
    }

    if (states.includes(newStateName)) {
      Alert.alert('Duplicate State', 'A state with this name already exists.');
      return;
    }

    const position = parseInt(newStatePosition, 10);
    const insertIndex =
      isNaN(position) || position < 1 || position > states.length + 1
        ? states.length
        : position - 1;

    const updatedStates = [...states];
    updatedStates.splice(insertIndex, 0, newStateName);

    setStates(updatedStates);

    // Initialize default interval and selected audios
    const lowerState = newStateName.toLowerCase();
    setIntervals((prev: any) => ({
      ...prev,
      [lowerState]: 5000, // or your default interval
    }));
    setSelectedAudios((prev: any) => ({
      ...prev,
      [lowerState]: { audios: [], mode: 'Selected' },
    }));

    // Reset new state inputs
    setNewStateName('');
    setNewStatePosition('');
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={commonStyles.modalContainer}>
        <View style={commonStyles.modalContent}>
          <Text style={commonStyles.title}>Scene Builder</Text>
          {states.map((state, index) => (
            <View key={state} style={commonStyles.stateRow}>
              {/* Position Number Input */}
              <TextInput
                style={commonStyles.positionInput}
                value={(index + 1).toString()}
                onChangeText={(value) => handlePositionChange(index, value)}
                keyboardType="numeric"
                maxLength={2}
              />

              {/* State Name */}
              <TouchableOpacity onPress={() => handleStatePress(state)}>
                <Text style={commonStyles.label}>{state}</Text>
              </TouchableOpacity>

              {/* Interval Input */}
              <TextInput
                style={commonStyles.input}
                value={localIntervals[state.toLowerCase()] || ''}
                onChangeText={(value) => handleChange(state, value)}
                keyboardType="numeric"
                maxLength={5}
                placeholder="mm:ss"
              />

              {/* Delete Icon */}
              <TouchableOpacity onPress={() => handleDeleteState(index)}>
                <Icon name="trash-2" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add New State Row */}
          <View style={commonStyles.addStateRow}>
            {/* Position Number Input */}
            <TextInput
              style={commonStyles.positionInput}
              value={newStatePosition}
              onChangeText={(value) => setNewStatePosition(value)}
              keyboardType="numeric"
              maxLength={2}
              placeholder="Pos"
            />

            {/* State Name Input */}
            <TextInput
              style={commonStyles.newStateInput}
              value={newStateName}
              onChangeText={(value) => setNewStateName(value)}
              placeholder="New State Name"
              maxLength={20}
            />

            {/* Save Icon */}
            <TouchableOpacity onPress={handleAddState}>
              <Icon name="save" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Save Intervals Button */}
          <TouchableOpacity onPress={handleSave} style={commonStyles.saveButton}>
            <Text style={commonStyles.saveButtonText}>Save Intervals</Text>
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
