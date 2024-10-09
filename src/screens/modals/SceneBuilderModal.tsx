// src/screens/modals/SceneBuilderModal.tsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const STATES = ['Active', 'Spotted', 'Proximity', 'Trigger'];

const SceneBuilderModal: React.FC<SceneBuilderModalProps> = ({
  visible,
  onClose,
}) => {
  const { intervals, setIntervalForState } = useContext(IntervalContext);
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
        for (const state of STATES) {
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
  }, [visible, intervals]);

  const handleSave = async () => {
    try {
      for (const state of STATES) {
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
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Scene Builder</Text>
          {STATES.map((state) => (
            <View key={state} style={styles.inputContainer}>
              <TouchableOpacity onPress={() => handleStatePress(state)}>
                <Text style={styles.label}>{state}</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
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

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#004225',
    borderRadius: 10,
    alignItems: 'center',
  },
  subModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subModalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
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
    textDecorationLine: 'underline', // Indicate it's clickable
  },
  input: {
    width: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#1b1b1b',
  },
});
