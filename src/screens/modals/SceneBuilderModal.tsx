// src/screens/modals/SceneBuilderModal.tsx

import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { textStyles } from '../../styles/textStyles';
import { containerStyles } from '../../styles/containerStyles';
import { IntervalContext } from '../../contexts/SceneProvider';
import AssignAudiosModal from './AssignAudiosModal';
import AssignDebriefsModal from './AssignDebriefsModal';
import AppModal from '../../styles/AppModal';
import StateRow from '../../config/StateRow';
import AddStateRow from '../../config/AddStateRow';
import { buttonStyles } from '../../styles/buttonStyles';
import { convertMinutesSecondsToMs, convertMsToMinutesSeconds } from '../../config/timeUtils';

type SceneBuilderModalProps = {
  visible: boolean;
  onClose: () => void;
};

const SceneBuilderModal: React.FC<SceneBuilderModalProps> = ({ visible, onClose }) => {
  const {
    intervals,
    setIntervalForState,
    states,
    setStates,
    selectedAudios,
    setSelectedAudiosForState,
    selectedDebriefs,
    setSelectedDebriefsForState,
    setIntervals,
  } = useContext(IntervalContext);

  const [localIntervals, setLocalIntervals] = useState<{ [key: string]: string | null }>({});
  const [editingIntervals, setEditingIntervals] = useState<{ [key: string]: boolean }>({});
  const [dataLoaded, setDataLoaded] = useState(false);

  // States for controlling the visibility of both modals
  const [assignAudiosModalVisible, setAssignAudiosModalVisible] = useState(false);
  const [assignDebriefsModalVisible, setAssignDebriefsModalVisible] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // New state inputs for adding states
  const [newStateName, setNewStateName] = useState('');
  const [newStatePosition, setNewStatePosition] = useState('');

  // Load intervals when the modal becomes visible
  useEffect(() => {
    let isMounted = true;
    const loadIntervals = async () => {
      if (dataLoaded) { return; }

      try {
        const loadedIntervals: { [key: string]: string | null } = {};
        for (const state of states) {
          if (!state) { continue; }

          const storedInterval = await AsyncStorage.getItem(`@interval_${state.toLowerCase()}`);
          loadedIntervals[state.toLowerCase()] =
            storedInterval === 'null' || intervals[state.toLowerCase()] === null
              ? null
              : convertMsToMinutesSeconds(parseInt(storedInterval || '0', 10));
        }

        if (isMounted) {
          setLocalIntervals(loadedIntervals);
          setDataLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load intervals:', error);
      }
    };

    if (visible && !dataLoaded) { loadIntervals(); }

    return () => {
      isMounted = false;
    };
  }, [visible, states, intervals, dataLoaded]);

  // Determine if audios are assigned for a specific state
  const isAudioAssigned = (stateName: string): boolean => {
    return selectedAudios[stateName.toLowerCase()]?.audios?.length > 0 || false;
  };

  // Update selectedAudios state when audios are selected in the modal
  const handleAudiosSelected = (stateName: string, audioData: any) => {
    setSelectedAudiosForState(stateName, audioData);
  };

  // Save intervals
  const handleSave = async () => {
    try {
      for (const state of states) {
        const intervalStr = localIntervals[state.toLowerCase()];
        if (!intervalStr) {
          setIntervalForState(state, null);
          continue;
        }

        const intervalMs = convertMinutesSecondsToMs(intervalStr);
        if (!isNaN(intervalMs)) {
          setIntervalForState(state, intervalMs);
        } else {
          console.warn(`Invalid interval for state "${state}": "${intervalStr}"`);
          setIntervalForState(state, null);
        }
      }
      onClose();
    } catch (error) {
      console.error('Error saving intervals:', error);
    }
  };

  // Handle debrief assignment to a specific state
  const handleAssignDebrief = (debrief: string | null) => {
    if (selectedState) {
      setSelectedDebriefsForState(selectedState, debrief);
    }
  };

  // Handle deleting a state
  const handleDeleteState = (index: number) => {
    const stateToDelete = states[index];
    Alert.alert('Delete State', `Are you sure you want to delete "${stateToDelete}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteState(index),
      },
    ]);
  };

  const deleteState = (index: number) => {
    const updatedStates = [...states];
    const [deletedState] = updatedStates.splice(index, 1);
    setStates(updatedStates);
    setIntervals((prev) => {
      const updated = { ...prev };
      delete updated[deletedState.toLowerCase()];
      return updated;
    });
    AsyncStorage.multiRemove([
      `@interval_${deletedState.toLowerCase()}`,
      `@selectedAudios_${deletedState.toLowerCase()}`,
      `@selectedDebriefs_${deletedState.toLowerCase()}`,
      `@audioIntervals_${deletedState.toLowerCase()}`, // Remove audioIntervals as well
    ]);
  };

  const handleAddState = () => {
    if (!newStateName.trim() || states.includes(newStateName)) { return; }

    const insertIndex = isNaN(parseInt(newStatePosition, 10))
      ? states.length
      : parseInt(newStatePosition, 10) - 1;
    const updatedStates = [...states];
    updatedStates.splice(insertIndex, 0, newStateName);
    setStates(updatedStates);

    setIntervalForState(newStateName, null);
    setSelectedAudiosForState(newStateName, { audios: [], mode: 'Selected' });
    setSelectedDebriefsForState(newStateName, null);
    setLocalIntervals((prev) => ({
      ...prev,
      [newStateName.toLowerCase()]: null,
    }));
    setNewStateName('');
    setNewStatePosition('');
  };

  return (
    <AppModal isVisible={visible} onClose={onClose}>
      <View style={containerStyles.container}>
        <Text style={textStyles.boldText1}>Scene Builder</Text>
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
              onAssignDebrief={() => {
                setSelectedState(item);
                setAssignDebriefsModalVisible(true);
              }}
              onDelete={() => handleDeleteState(index)}
              onEditInterval={() =>
                setEditingIntervals((prev) => ({ ...prev, [item.toLowerCase()]: true }))
              }
              onSaveInterval={() => {
                setEditingIntervals((prev) => ({ ...prev, [item.toLowerCase()]: false }));
                const intervalMs = convertMinutesSecondsToMs(
                  localIntervals[item.toLowerCase()] || ''
                );
                if (!isNaN(intervalMs)) { setIntervalForState(item, intervalMs); }
              }}
              onRenameState={() => { }}
              selectedDebrief={selectedDebriefs[item.toLowerCase()] || null}
              hasAssignedAudios={isAudioAssigned(item)}
            />
          )}
          ListEmptyComponent={<Text style={textStyles.text0}>No states available.</Text>}
        />
        <AddStateRow
          position={newStatePosition}
          setPosition={setNewStatePosition}
          stateName={newStateName}
          setStateName={setNewStateName}
          onAdd={handleAddState}
        />

        <TouchableOpacity onPress={handleSave} style={buttonStyles.button}>
          <Text style={textStyles.text0}>Save Intervals</Text>
        </TouchableOpacity>
      </View>
      {assignAudiosModalVisible && selectedState && (
        <AssignAudiosModal
          visible={assignAudiosModalVisible}
          onClose={() => setAssignAudiosModalVisible(false)}
          stateName={selectedState}
          onAudiosSelected={handleAudiosSelected} // Pass the callback
        />
      )}
      {assignDebriefsModalVisible && selectedState && (
        <AssignDebriefsModal
          visible={assignDebriefsModalVisible}
          onClose={() => setAssignDebriefsModalVisible(false)}
          stateName={selectedState}
          selectedDebrief={selectedDebriefs[selectedState.toLowerCase()] || null}
          onDebriefSelected={handleAssignDebrief}
        />
      )}
    </AppModal>
  );
};

export default SceneBuilderModal;
