// RadioButton.tsx

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Keep using Feather

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
    style={styles.container}
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
    accessibilityHint={accessibilityHint}
  >
    <Icon
      name={selected ? 'check-circle' : 'circle'} // Feather icons
      size={24}
      color="#000"
      style={styles.icon}
    />
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
  },
});

export default RadioButton;
