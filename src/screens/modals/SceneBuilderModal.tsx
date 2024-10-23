import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { commonStyles } from '../../styles/commonStyles';
import { IntervalContext } from '../../contexts/SceneProvider';
import AppModal from '../../styles/AppModal';
import StateRow from '../../config/StateRow';
import AddStateRow from '../../config/AddStateRow';
import AssignAudiosModalWrapper from './AssignAudiosModalWrapper';

const convertMsToMinutesSeconds = (milliseconds: number) => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const convertMinutesSecondsToMs = (time: string) => {
  const [minutes, seconds] = time.split(':').map(Number);
  return isNaN(minutes) || isNaN(seconds) ? NaN : minutes * 60000 + seconds * 1000;
};

const SceneBuilderModal: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  const { intervals, setIntervalForState, states, setStates, setSelectedAudiosForState, setIntervals } =
    useContext(IntervalContext);

  const [localIntervals, setLocalIntervals] = useState<{ [key: string]: string | null }>({});
  const [localPositions, setLocalPositions] = useState<string[]>([]);
  const [editingIntervals, setEditingIntervals] = useState<{ [key: string]: boolean }>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [assignAudiosModalVisible, setAssignAudiosModalVisible] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [newStateName, setNewStateName] = useState('');
  const [newStatePosition, setNewStatePosition] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadIntervals = async () => {
      if (dataLoaded) return;
      try {
        const loadedIntervals: { [key: string]: string } = {};
        for (const state of states) {
          const storedInterval = await AsyncStorage.getItem(`@interval_${state.toLowerCase()}`);
          loadedIntervals[state.toLowerCase()] =
            storedInterval !== null
              ? convertMsToMinutesSeconds(parseInt(storedInterval, 10))
              : intervals[state.toLowerCase()] !== undefined
              ? convertMsToMinutesSeconds(intervals[state.toLowerCase()])
              : '00:00';
        }
        if (isMounted) setLocalIntervals(loadedIntervals);
        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to load intervals:', error);
      }
    };
    if (visible && !dataLoaded) loadIntervals();
    return () => { isMounted = false; };
  }, [visible, states, intervals, dataLoaded]);

  useEffect(() => {
    setLocalPositions(states.map((_, index) => (index + 1).toString()));
  }, [states]);

  const handleSave = async () => {
    try {
      for (const state of states) {
        const intervalStr = localIntervals[state.toLowerCase()];
        if (!intervalStr) return;
        const intervalMs = convertMinutesSecondsToMs(intervalStr);
        if (!isNaN(intervalMs)) setIntervalForState(state, intervalMs);
      }
      onClose();
    } catch (error) {
      console.error('Error saving intervals:', error);
    }
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
              intervalValue={localIntervals[item.toLowerCase()]}
              isEditing={editingIntervals[item.toLowerCase()] || false}
              onChangePosition={(value) =>
                setLocalPositions((prev) => {
                  const newPositions = [...prev];
                  newPositions[index] = value;
                  return newPositions;
                })
              }
              onBlurPosition={() => {
                const value = localPositions[index];
                if (!value) {
                  setLocalPositions((prev) => {
                    const newPositions = [...prev];
                    newPositions[index] = (index + 1).toString();
                    return newPositions;
                  });
                }
              }}
              onStatePress={() => {
                setSelectedState(item);
                setAssignAudiosModalVisible(true);
              }}
              onChangeInterval={(value) => {
                if (value.length <= 5) {
                  setLocalIntervals((prev) => ({ ...prev, [item.toLowerCase()]: value }));
                }
              }}
              onBlurInterval={() => {
                setEditingIntervals((prev) => ({ ...prev, [item.toLowerCase()]: false }));
                const intervalMs = convertMinutesSecondsToMs(localIntervals[item.toLowerCase()] || '');
                if (!isNaN(intervalMs)) setIntervalForState(item, intervalMs);
              }}
              onEditInterval={() => {
                setEditingIntervals((prev) => ({ ...prev, [item.toLowerCase()]: true }));
              }}
              onLongPressInterval={() => {
                setLocalIntervals((prev) => ({ ...prev, [item.toLowerCase()]: null }));
              }}
              onDeleteState={() => {
                Alert.alert('Delete State', `Are you sure you want to delete the state "${item}"?`, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      const updatedStates = [...states];
                      updatedStates.splice(index, 1);
                      setStates(updatedStates);
                      AsyncStorage.removeItem(`@interval_${item.toLowerCase()}`);
                    },
                  },
                ]);
              }}
              isGreyedOut={localIntervals[item.toLowerCase()] === null}
            />
          )}
        />
        <AddStateRow
          newStateName={newStateName}
          newStatePosition={newStatePosition}
          onChangeStateName={setNewStateName}
          onChangeStatePosition={setNewStatePosition}
          onSaveState={() => {
            if (newStateName && !states.includes(newStateName)) {
              const position = parseInt(newStatePosition, 10);
              const insertIndex = isNaN(position) ? states.length : position - 1;
              const updatedStates = [...states];
              updatedStates.splice(insertIndex, 0, newStateName);
              setStates(updatedStates);
              setNewStateName('');
              setNewStatePosition('');
              setIntervalForState(newStateName, 5000);
            }
          }}
        />
        <TouchableOpacity onPress={handleSave} style={commonStyles.saveButton}>
          <Text style={commonStyles.saveButtonText}>Save Intervals</Text>
        </TouchableOpacity>
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
