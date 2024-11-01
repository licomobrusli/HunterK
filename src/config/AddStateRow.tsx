// src/screens/modals/AddStateRow.tsx

import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { textStyles } from '../styles/textStyles';
import { containerStyles } from '../styles/containerStyles.ts';
import { buttonStyles } from '../styles/buttonStyles.ts';

type AddStateRowProps = {
  position: string;
  setPosition: React.Dispatch<React.SetStateAction<string>>;
  stateName: string;
  setStateName: React.Dispatch<React.SetStateAction<string>>;
  onAdd: () => void;
};

const AddStateRow: React.FC<AddStateRowProps> = ({
  position,
  setPosition,
  stateName,
  setStateName,
  onAdd,
}) => {
  return (
    <View style={containerStyles.itemContainer}>
      {/* Position Number Input */}
      <TextInput
        style={buttonStyles.iconButton}
        value={position}
        onChangeText={setPosition}
        keyboardType="numeric"
        maxLength={2}
        placeholder="Pos"
      />

      {/* State Name Input */}
      <TextInput
        style={textStyles.text0}
        value={stateName}
        onChangeText={setStateName}
        placeholder="New State Name"
        placeholderTextColor="#aaa"
        maxLength={20}
      />
      {/* Save Icon */}
      <TouchableOpacity onPress={onAdd}>
        <Icon name="save" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default AddStateRow;
