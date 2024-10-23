import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { commonStyles } from '../styles/commonStyles';

type AddStateRowProps = {
  newStateName: string;
  newStatePosition: string;
  onChangeStateName: (value: string) => void;
  onChangeStatePosition: (value: string) => void;
  onSaveState: () => void;
};

const AddStateRow: React.FC<AddStateRowProps> = ({
  newStateName,
  newStatePosition,
  onChangeStateName,
  onChangeStatePosition,
  onSaveState,
}) => {
  return (
    <View style={commonStyles.addStateRow}>
      <TextInput
        style={commonStyles.positionInput}
        value={newStatePosition}
        onChangeText={onChangeStatePosition}
        keyboardType="numeric"
        maxLength={2}
        placeholder="Pos"
      />
      <TextInput
        style={commonStyles.newStateInput}
        value={newStateName}
        onChangeText={onChangeStateName}
        placeholder="New State Name"
        placeholderTextColor="#aaa"
        maxLength={20}
      />
      <TouchableOpacity onPress={onSaveState}>
        <Icon name="save" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default AddStateRow;
