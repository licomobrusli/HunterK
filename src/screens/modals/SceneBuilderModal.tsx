// src/screens/modals/SceneBuilderModal.tsx

import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commonStyles } from '../../styles/commonStyles';
import { IntervalContext } from '../../contexts/SceneProvider';
import AssignAudiosModal from './AssignAudiosModal';
import AppModal from '../../styles/AppModal'; // Correct import path
import StateRow from '../../config/StateRow';
import AddStateRow from '../../config/AddStateRow';

type SceneBuilderModalProps = {
  visible: boolean;
  onClose: () => void;
};

// Utility Functions
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

  const [localIntervals, setLocalIntervals] = useState<{ [key: string]: string | null }>({});
  // Removed localPositions since it's unused
  // const [localPositions, setLocalPositions] = useState<string[]>([]);
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
      const loadedIntervals: { [key: string]: string | null } = {};
      for (const state of states) {
        if (!state || typeof state !== 'string') { continue; }

        const storedInterval = await AsyncStorage.getItem(`@interval_${state.toLowerCase()}`);
        if (storedInterval === 'null' || intervals[state.toLowerCase()] === null) {
          loadedIntervals[state.toLowerCase()] = 'mm:ss'; // Default display for null
        } else if (storedInterval !== null) {
          loadedIntervals[state.toLowerCase()] = convertMsToMinutesSeconds(parseInt(storedInterval, 10));
        } else {
          const interval = intervals[state.toLowerCase()];
          loadedIntervals[state.toLowerCase()] = interval !== undefined
            ? convertMsToMinutesSeconds(interval ?? 0)
            : 'mm:ss';
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

// Handle saving intervals
const handleSave = async () => {
  try {
    for (const state of states) {
      if (!state || typeof state !== 'string') {
        console.error('Encountered invalid state during save:', state);
        continue;
      }
      const intervalStr = localIntervals[state.toLowerCase()];

      // Allow saving null intervals
      if (intervalStr === null) {
        setIntervalForState(state, null); // Set interval to null in context
        console.log(`Interval for "${state}" set to null in context.`);
        continue;
      }

      const intervalMs = convertMinutesSecondsToMs(intervalStr);
      if (isNaN(intervalMs)) {
        console.log(`Invalid interval format for state "${state}". Expected "mm:ss".`);
        return;
      }

      setIntervalForState(state, intervalMs); // Update context with converted interval
      console.log(`Interval for "${state}" set to ${intervalMs} ms in context.`);
    }
    console.log('All intervals have been saved successfully.');
    onClose();
  } catch (error) {
    console.error('Error saving intervals:', error);
  }
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

  return (
    <AppModal isVisible={visible} onClose={onClose}>
      <View style={commonStyles.modalContent}>
        <Text style={commonStyles.title}>Scene Builder</Text>
        <FlatList
          data={states}
          keyExtractor={(item) => item}
          renderItem={({ item, index }) => (
            <StateRow
              key={item}
              stateName={item}
              index={index}
              localInterval={localIntervals[item.toLowerCase()] || 'mm:ss'}
              setLocalIntervals={setLocalIntervals}
              editing={editingIntervals[item.toLowerCase()] || false}
              onAssignAudios={() => {
                setSelectedState(item);
                setAssignAudiosModalVisible(true);
              }}
              onDelete={() => handleDeleteState(index)}
              onEditInterval={() => {
                setEditingIntervals((prev) => ({
                  ...prev,
                  [item.toLowerCase()]: true,
                }));
              }}
              onSaveInterval={() => {
                setEditingIntervals((prev) => ({
                  ...prev,
                  [item.toLowerCase()]: false,
                }));
                // Perform validation and save interval
                const intervalStr = localIntervals[item.toLowerCase()];
                const intervalMs = convertMinutesSecondsToMs(intervalStr || '');
                if (isNaN(intervalMs)) {
                  console.log(`Invalid interval format for state "${item}". Expected "mm:ss". Resetting to default.`);
                  setLocalIntervals((prev) => ({
                    ...prev,
                    [item.toLowerCase()]: 'mm:ss',
                  }));
                } else {
                  setIntervalForState(item, intervalMs);
                  console.log(`Interval for "${item}" updated to ${intervalMs} ms.`);
                }
              }}
            />
          )}
          ListEmptyComponent={<Text style={commonStyles.text}>No states available.</Text>}
        />
        {/* Add New State Row */}
        <AddStateRow
          position={newStatePosition}
          setPosition={setNewStatePosition}
          stateName={newStateName}
          setStateName={setNewStateName}
          onAdd={handleAddState}
        />

        {/* Save Intervals Button */}
        <TouchableOpacity onPress={handleSave} style={commonStyles.saveButton}>
          <Text style={commonStyles.saveButtonText}>Save Intervals</Text>
        </TouchableOpacity>
      </View>
      {/* Assign Audios Sub-Modal */}
      {assignAudiosModalVisible && selectedState && (
        <AssignAudiosModal
          visible={assignAudiosModalVisible}
          onClose={() => {
            setAssignAudiosModalVisible(false);
            setSelectedState(null);
          }}
          stateName={selectedState}
        />
      )}
    </AppModal>
  );
};

export default SceneBuilderModal;
