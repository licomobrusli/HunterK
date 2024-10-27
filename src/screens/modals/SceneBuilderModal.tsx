// src/screens/modals/SceneBuilderModal.tsx

import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commonStyles } from '../../styles/commonStyles';
import { IntervalContext } from '../../contexts/SceneProvider';
import AppModal from '../../styles/AppModal';
import StateRow from '../../config/StateRow';
import AddStateRow from '../../config/AddStateRow';
import AssignAudiosModalWrapper from './AssignAudiosModalWrapper';

const SceneBuilderModal: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  const { states, setStates } = useContext(IntervalContext);

  const [localPositions, setLocalPositions] = useState<string[]>([]);
  const [assignAudiosModalVisible, setAssignAudiosModalVisible] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [newStateName, setNewStateName] = useState('');
  const [newStatePosition, setNewStatePosition] = useState('');
  const [intervals, setIntervals] = useState<string[]>([]);

  useEffect(() => {
    setLocalPositions(states.map((_, index) => (index + 1).toString()));

    // Load intervals when states change
    const loadIntervals = async () => {
      const loadedIntervals: string[] = [];
      for (const state of states) {
        const interval = await AsyncStorage.getItem(`@interval_${state.toLowerCase()}`);
        if (interval && /^\d{2}:\d{2}$/.test(interval)) {
          loadedIntervals.push(interval);
        } else {
          // If stored format is incorrect or missing, default to '00:00'
          loadedIntervals.push('00:00');
          await AsyncStorage.setItem(`@interval_${state.toLowerCase()}`, '00:00');
        }
      }
      setIntervals(loadedIntervals);
    };
    loadIntervals();
  }, [states]);

  const handlePositionChange = (index: number, value: string) => {
    setLocalPositions((prevPositions) => {
      const newPositions = [...prevPositions];
      newPositions[index] = value;
      return newPositions;
    });
  };

  const handlePositionBlur = (index: number) => {
    const newPosition = parseInt(localPositions[index], 10);
    if (isNaN(newPosition) || newPosition < 1) {
      // Reset to original position if input is invalid
      setLocalPositions((prev) => {
        const newPositions = [...prev];
        newPositions[index] = (index + 1).toString();
        return newPositions;
      });
      return;
    }

    // Adjust positions based on the new position entered
    const updatedStates = [...states];
    const movedState = updatedStates.splice(index, 1)[0];
    updatedStates.splice(newPosition - 1, 0, movedState);

    setStates(updatedStates);
    setLocalPositions(updatedStates.map((_, idx) => (idx + 1).toString()));

    // Reorder intervals to match the new states order
    const updatedIntervals = [...intervals];
    const movedInterval = updatedIntervals.splice(index, 1)[0];
    updatedIntervals.splice(newPosition - 1, 0, movedInterval);
    setIntervals(updatedIntervals);
  };

  const handleAddState = () => {
    if (newStateName && !states.includes(newStateName)) {
      const position = parseInt(newStatePosition, 10);
      const insertIndex = isNaN(position) || position < 1 ? states.length : position - 1;

      const updatedStates = [...states];
      updatedStates.splice(insertIndex, 0, newStateName);

      setStates(updatedStates);
      setLocalPositions(updatedStates.map((_, index) => (index + 1).toString()));
      setIntervals((prev) => {
        const newIntervals = [...prev];
        newIntervals.splice(insertIndex, 0, '00:00'); // default interval value
        return newIntervals;
      });

      // Initialize the interval in AsyncStorage
      AsyncStorage.setItem(`@interval_${newStateName.toLowerCase()}`, '00:00');

      setNewStateName('');
      setNewStatePosition('');
    }
  };

  const handleIntervalChange = (index: number, value: string) => {
    setIntervals((prevIntervals) => {
      const newIntervals = [...prevIntervals];
      newIntervals[index] = value;
      return newIntervals;
    });
  };

  const handleIntervalBlur = async (index: number) => {
    const stateName = states[index];
    const intervalValue = intervals[index];
    // Save the updated interval to AsyncStorage
    await AsyncStorage.setItem(`@interval_${stateName.toLowerCase()}`, intervalValue);
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
              state={item}
              position={localPositions[index]}
              intervalValue={intervals[index]}
              onChangePosition={(value) => handlePositionChange(index, value)}
              onBlurPosition={() => handlePositionBlur(index)}
              onChangeInterval={(value) => handleIntervalChange(index, value)}
              onBlurInterval={() => handleIntervalBlur(index)}
              onStatePress={() => {
                setSelectedState(item);
                setAssignAudiosModalVisible(true);
              }}
              onDeleteState={() => {
                Alert.alert('Delete State', `Are you sure you want to delete the state "${item}"?`, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      const updatedStates = [...states];
                      updatedStates.splice(index, 1);
                      setStates(updatedStates);

                      const updatedIntervals = [...intervals];
                      updatedIntervals.splice(index, 1);
                      setIntervals(updatedIntervals);

                      await AsyncStorage.removeItem(`@interval_${item.toLowerCase()}`);
                    },
                  },
                ]);
              }}
              isGreyedOut={false}
            />
          )}
        />
        <AddStateRow
          newStateName={newStateName}
          newStatePosition={newStatePosition}
          onChangeStateName={setNewStateName}
          onChangeStatePosition={setNewStatePosition}
          onSaveState={handleAddState}
        />
      </View>
      <AssignAudiosModalWrapper
        visible={assignAudiosModalVisible}
        selectedState={selectedState}
        onClose={() => setAssignAudiosModalVisible(false)}
      />
    </AppModal>
  );
};

export default SceneBuilderModal;
