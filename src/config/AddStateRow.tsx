// src/config/debrief/AddStateRow.tsx

import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { textStyles } from '../styles/textStyles';
import { containerStyles } from '../styles/containerStyles.ts';
import { buttonStyles } from '../styles/buttonStyles.ts';
import Save from '../assets/icons/save.svg';

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
        <View style={buttonStyles.iconButton}>
          <Save width={18} height={18} fill="#fff" stroke="#004225" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default AddStateRow;
