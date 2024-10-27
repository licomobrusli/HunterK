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

  useEffect(() => {
    setLocalPositions(states.map((_, index) => (index + 1).toString()));
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
  };

  const handleAddState = () => {
    if (newStateName && !states.includes(newStateName)) {
      const position = parseInt(newStatePosition, 10);
      const insertIndex = isNaN(position) || position < 1 ? states.length : position - 1;

      const updatedStates = [...states];
      updatedStates.splice(insertIndex, 0, newStateName);

      setStates(updatedStates);
      setLocalPositions(updatedStates.map((_, index) => (index + 1).toString()));

      setNewStateName('');
      setNewStatePosition('');
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
              onChangePosition={(value) => handlePositionChange(index, value)}
              onBlurPosition={() => handlePositionBlur(index)}
              intervalValue={null} // Placeholder as per `StateRowProps`
              isEditing={false} // Placeholder as per `StateRowProps`
              onChangeInterval={() => {}} // Placeholder function
              onBlurInterval={() => {}} // Placeholder function
              onEditInterval={() => {}} // Placeholder function
              onLongPressInterval={() => {}} // Placeholder function
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
                    onPress: () => {
                      const updatedStates = [...states];
                      updatedStates.splice(index, 1);
                      setStates(updatedStates);
                      AsyncStorage.removeItem(`@interval_${item.toLowerCase()}`);
                    },
                  },
                ]);
              }}
              isGreyedOut={false} // Placeholder as per `StateRowProps`
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
