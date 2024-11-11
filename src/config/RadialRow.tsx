// src/components/RadialRow.tsx

import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import Bin from '../assets/icons/bin.svg';
import { commonStyles } from '../styles/commonStyles';
import { buttonStyles } from '../styles/buttonStyles';
import { containerStyles } from '../styles/containerStyles';
import { textStyles } from '../styles/textStyles';

interface RadialRowProps {
  value: string;
  onChange: (text: string) => void;
  onRemove: () => void;
}

const RadialRow: React.FC<RadialRowProps> = ({ value, onChange, onRemove }) => {
  return (
    <View style={containerStyles.itemContainer}>
      <View style={containerStyles.containerLeft}>
        <View style={buttonStyles.iconButton} />
        <TextInput
          style={commonStyles.fixedWidthLabel}
          value={value}
          onChangeText={onChange}
          placeholder="Enter radial option..."
          placeholderTextColor="#aaa"
          maxLength={100}
        />
      </View>
      <View style={containerStyles.containerRight}>
        {/* Placeholder for Time Field */}
        <View style={buttonStyles.timeButton}>
            <Text style={textStyles.text0}/>
        </View>
        {/* Placeholder for Future Icon Buttons */}
        <View style={buttonStyles.iconButton} />
        <View style={buttonStyles.iconButton} />
        <TouchableOpacity onPress={onRemove} style={buttonStyles.iconButton}>
          <Bin width={18} height={18} fill="#fff" stroke="#004225" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RadialRow;
