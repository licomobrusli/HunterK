// RadioButton.tsx

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Keep using Feather
import { commonStyles } from '../../styles/commonStyles';

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
    style={commonStyles.container}
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
    accessibilityHint={accessibilityHint}
  >
    <Icon
      name={selected ? 'check-circle' : 'circle'} // Feather icons
      size={24}
      color="#000"
      style={commonStyles.iconButton}
    />
    <Text style={commonStyles.itemText}>{label}</Text>
  </TouchableOpacity>
);

export default RadioButton;
