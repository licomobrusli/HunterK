// src/screens/modals/SceneBuilderModal.tsx

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import { commonStyles } from '../../styles/commonStyles';
import { IntervalContext } from '../../contexts/SceneProvider';
import AssignAudiosModal from './AssignAudiosModal';
import AppModal from '../../styles/AppModal'; // Correct import path

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

const SceneBuilderModal: React.FC<SceneBuilderModalProps> = ({ visible, onClose }) => {
  const {
    intervals,
    setIntervalForState,
    states,
    setStates,
    setSelectedAudiosForState,
    setIntervals,
  } = useContext(IntervalContext);

  const [localIntervals, setLocalIntervals] = useState<{ [key: string]: string }>({});
  const [localPositions, setLocalPositions] = useState<string[]>([]);
  const [editingIntervals, setEditingIntervals] = useState<{ [key: string]: boolean }>({});
  const [dataLoaded, setDataLoaded] = useState(false);

  // State for controlling the visibility of the Assign Audios sub-modal
  const [assignAudiosModalVisible, setAssignAudiosModalVisible] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // New state inputs
  const [newStateName, setNewStateName] = useState('');
  const [newStatePosition, setNewStatePosition] = useState('');

  // Load intervals when the modal becomes visible
  useEffect(() => {
    let isMounted = true; // Track if the component is mounted
    const loadIntervals = async () => {
      if (dataLoaded) {
        return; // Prevent re-loading if data is already loaded
      }

      try {
        const loadedIntervals: { [key: string]: string } = {};
        for (const state of states) {
          if (!state || typeof state !== 'string') { continue; }

          const storedInterval = await AsyncStorage.getItem(`@interval_${state.toLowerCase()}`);
          if (storedInterval !== null) {
            loadedIntervals[state.toLowerCase()] = convertMsToMinutesSeconds(parseInt(storedInterval, 10));
          } else {
            const interval = intervals[state.toLowerCase()];
            loadedIntervals[state.toLowerCase()] = interval !== undefined
              ? convertMsToMinutesSeconds(interval)
              : '00:00';
          }
        }

        if (isMounted) {
          setLocalIntervals(loadedIntervals);
          console.log('Local intervals set to:', loadedIntervals);
          setDataLoaded(true); // Set dataLoaded to true after loading
        }
      } catch (error) {
        console.error('Failed to load intervals:', error);
      }
    };

    if (visible && !dataLoaded) {
      loadIntervals();
    }

    return () => {
      isMounted = false; // Clean up function
    };
  }, [visible, states, intervals, dataLoaded]);

  // Initialize localPositions when states change
  useEffect(() => {
    setLocalPositions(states.map((_, index) => (index + 1).toString()));
  }, [states]);

  // Handle saving intervals
  const handleSave = async () => {
    try {
      for (const state of states) {
        if (!state || typeof state !== 'string') {
          console.error('Encountered invalid state during save:', state);
          continue;
        }
        const intervalStr = localIntervals[state.toLowerCase()];
        if (!intervalStr) {
          console.log(`Missing interval for state "${state}". Aborting save.`);
          return;
        }
        const intervalMs = convertMinutesSecondsToMs(intervalStr);
        if (isNaN(intervalMs)) {
          console.log(`Invalid interval format for state "${state}". Expected "mm:ss".`);
          return;
        }
        setIntervalForState(state, intervalMs); // Update context
        console.log(`Interval for "${state}" set to ${intervalMs} ms in context.`);
      }
      console.log('All intervals have been saved successfully.');
      onClose();
    } catch (error) {
      console.error('Error saving intervals:', error);
    }
  };

  // Handle interval changes
  const handleChange = (state: string, value: string) => {
    if (value.length > 5) {
      return;
    }
    if (value.length === 2 && !value.includes(':')) {
      setLocalIntervals((prev) => ({
        ...prev,
        [state.toLowerCase()]: `${value}:`,
      }));
      console.log(`Updated interval for "${state}" to "${value}:"`);
    } else {
      setLocalIntervals((prev) => ({ ...prev, [state.toLowerCase()]: value }));
      console.log(`Updated interval for "${state}" to "${value}"`);
    }
  };

  // Handle pressing on state name to assign audios
  const handleStatePress = (state: string) => {
    console.log(`Assigning audios to state "${state}".`);
    setSelectedState(state);
    setAssignAudiosModalVisible(true);
  };

  // Close the Assign Audios modal
  const closeAssignAudiosModal = () => {
    console.log('Closing Assign Audios modal.');
    setAssignAudiosModalVisible(false);
    setSelectedState(null);
  };

  // Handle position change in the input field
  const handlePositionChange = (index: number, value: string) => {
    setLocalPositions((prevPositions) => {
      const newPositions = [...prevPositions];
      newPositions[index] = value;
      return newPositions;
    });
    console.log(`Position at index ${index} changed to "${value}"`);
  };

  // Handle blur event on position input to validate and update positions
  const handlePositionBlur = (index: number) => {
    const value = localPositions[index];
    if (value === '') {
      // Reset to current position if input is empty
      setLocalPositions((prevPositions) => {
        const newPositions = [...prevPositions];
        newPositions[index] = (index + 1).toString();
        return newPositions;
      });
      console.log(`Position input empty. Resetting to original position ${index + 1}.`);
      return;
    }

    const newPosition = parseInt(value, 10);
    if (isNaN(newPosition) || newPosition < 1 || newPosition > states.length) {
      // Invalid position, reset to current position
      setLocalPositions((prevPositions) => {
        const newPositions = [...prevPositions];
        newPositions[index] = (index + 1).toString();
        return newPositions;
      });
      console.log(`Invalid position number entered: ${value}. Resetting to original position ${index + 1}.`);
      return;
    }

    // Adjusting zero-based index
    const newIndex = newPosition - 1;

    // If new position is the same as current, do nothing
    if (newIndex === index) {
      console.log(`Position unchanged for state at index ${index + 1}.`);
      return;
    }

    // Update the position
    updateStatePosition(index, newIndex);
  };

  // Update state positions based on new index
  const updateStatePosition = (currentIndex: number, newIndex: number) => {
    if (newIndex < 0 || newIndex >= states.length) {
      console.log(`Position out of range: ${newIndex + 1}`);
      return;
    }

    const updatedStates = [...states];
    const [movedState] = updatedStates.splice(currentIndex, 1);
    updatedStates.splice(newIndex, 0, movedState);

    setStates(updatedStates);
    console.log(`Moved state "${movedState}" from position ${currentIndex + 1} to ${newIndex + 1}.`);

    // Update localPositions to reflect new order
    setLocalPositions(updatedStates.map((_, idx) => (idx + 1).toString()));
  };

  // Handle deleting a state
  const handleDeleteState = (index: number) => {
    const stateToDelete = states[index];
    if (!stateToDelete || typeof stateToDelete !== 'string') {
      console.error('Attempted to delete an invalid state:', stateToDelete);
      return;
    }
    console.log(`Attempting to delete state "${stateToDelete}".`);
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

  // Delete the state and clean up associated data
  const deleteState = (index: number) => {
    const updatedStates = [...states];
    const [deletedState] = updatedStates.splice(index, 1);

    if (!deletedState || typeof deletedState !== 'string') {
      console.error('Attempted to delete an invalid state:', deletedState);
      return;
    }

    setStates(updatedStates);
    console.log(`State "${deletedState}" deleted. Updated states:`, updatedStates);

    // Remove associated data
    const lowerState = deletedState.toLowerCase();
    setSelectedAudiosForState(lowerState, { audios: [], mode: 'Selected' });
    console.log(`Selected audios for "${lowerState}" reset.`);

    setIntervals((prev) => {
      const updated = { ...prev };
      delete updated[lowerState];
      console.log(`Interval for "${lowerState}" removed.`);
      return updated;
    });

    // Remove from AsyncStorage
    AsyncStorage.removeItem(`@interval_${lowerState}`)
      .then(() => {
        console.log(`Interval for "${lowerState}" removed from AsyncStorage.`);
      })
      .catch((error) => {
        console.error(`Failed to remove interval for "${lowerState}" from AsyncStorage:`, error);
      });

    AsyncStorage.removeItem(`@selectedAudios_${lowerState}`)
      .then(() => {
        console.log(`Selected audios for "${lowerState}" removed from AsyncStorage.`);
      })
      .catch((error) => {
        console.error(`Failed to remove selected audios for "${lowerState}" from AsyncStorage:`, error);
      });
  };

  // Handle adding a new state
  const handleAddState = () => {
    if (!newStateName.trim()) {
      console.log('New state name is empty. Aborting add.');
      return;
    }

    if (states.includes(newStateName)) {
      console.log(`State "${newStateName}" already exists. Aborting add.`);
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
    console.log(`Added new state "${newStateName}" at position ${insertIndex + 1}.`);

    // Initialize default interval and selected audios using context functions
    setIntervalForState(newStateName, 5000); // Default interval
    console.log(`Initialized interval for "${newStateName}" to 5000 ms.`);

    setSelectedAudiosForState(newStateName, { audios: [], mode: 'Selected' });
    console.log(`Initialized selected audios for "${newStateName}" to default.`);

    // Reset new state inputs
    setNewStateName('');
    setNewStatePosition('');
  };

  // Handle pressing on the interval to edit
  const handleIntervalPress = (state: string) => {
    setEditingIntervals((prev) => ({
      ...prev,
      [state.toLowerCase()]: true,
    }));
    console.log(`Editing interval for "${state}".`);
  };

  // Handle blur event on interval input to stop editing
  const handleIntervalBlur = (state: string) => {
    setEditingIntervals((prev) => ({
      ...prev,
      [state.toLowerCase()]: false,
    }));
    console.log(`Stopped editing interval for "${state}".`);

    // Optionally, perform validation here
    const intervalStr = localIntervals[state.toLowerCase()];
    const intervalMs = convertMinutesSecondsToMs(intervalStr);
    if (isNaN(intervalMs)) {
      console.log(`Invalid interval format for state "${state}". Expected "mm:ss". Resetting to previous value.`);
      // Reset to a default value or handle accordingly
      setLocalIntervals((prev) => ({
        ...prev,
        [state.toLowerCase()]: '00:00',
      }));
    } else {
      // Update the interval in the context if needed
      setIntervalForState(state, intervalMs);
      console.log(`Interval for "${state}" updated to ${intervalMs} ms.`);
    }
  };

  return (
    <AppModal isVisible={visible} onClose={onClose}>
      <View style={commonStyles.modalContent}>
        <Text style={commonStyles.title}>Scene Builder</Text>
        <FlatList
          data={states}
          keyExtractor={(item) => item}
          renderItem={({ item, index }) => {
            const isEditingInterval = editingIntervals[item.toLowerCase()] || false;
            return (
              <View key={item} style={commonStyles.stateColumnRow}>
                {/* Position Number Input */}
                <TextInput
                  style={commonStyles.positionInput}
                  value={localPositions[index]}
                  onChangeText={(value) => handlePositionChange(index, value)}
                  onBlur={() => handlePositionBlur(index)}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="Pos"
                />

                {/* State Name */}
                <TouchableOpacity onPress={() => handleStatePress(item)}>
                  <Text style={commonStyles.fixedWidthLabel}>{item}</Text>
                </TouchableOpacity>

                {/* Interval Field */}
                {isEditingInterval ? (
                  <TextInput
                    style={commonStyles.input}
                    value={localIntervals[item.toLowerCase()] || ''}
                    onChangeText={(value) => handleChange(item, value)}
                    onBlur={() => handleIntervalBlur(item)}
                    keyboardType="numeric"
                    maxLength={5}
                    placeholder="mm:ss"
                    autoFocus
                  />
                ) : (
                  <TouchableOpacity onPress={() => handleIntervalPress(item)}>
                    <Text style={commonStyles.inputText}>
                      {localIntervals[item.toLowerCase()] || 'mm:ss'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Delete Icon */}
                <TouchableOpacity onPress={() => handleDeleteState(index)}>
                  <Icon name="trash-2" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={commonStyles.text}>No states available.</Text>}
        />

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
            placeholderTextColor="#aaa"
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
      </View>

      {/* Assign Audios Sub-Modal */}
      {assignAudiosModalVisible && selectedState && (
        <AssignAudiosModal
          visible={assignAudiosModalVisible}
          onClose={closeAssignAudiosModal}
          stateName={selectedState}
        />
      )}
    </AppModal>
  );
};

export default SceneBuilderModal;
