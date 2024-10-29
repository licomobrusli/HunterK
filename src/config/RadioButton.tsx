// src/components/RadioButton.tsx

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { commonStyles } from '../styles/commonStyles';

interface RadioButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  selected,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}) => (
  <TouchableOpacity
    style={commonStyles.inputContainer}
    onPress={onPress}
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    accessibilityLabel={accessibilityLabel}
    accessibilityHint={accessibilityHint}
  >
    <Icon
      name={selected ? 'radio-button-on' : 'radio-button-off'}
      size={20}
      color={selected ? '#4CAF50' : '#ccc'}
      style={commonStyles.headerIcon}
    />
    <Text style={commonStyles.text}>{label}</Text>
  </TouchableOpacity>
);

export default RadioButton;
