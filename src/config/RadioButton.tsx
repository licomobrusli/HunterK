// src/components/RadioButton.tsx

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

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
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    accessibilityLabel={accessibilityLabel}
    accessibilityHint={accessibilityHint}
  >
    <View style={[styles.radio, selected && styles.radioSelected]} />
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  radio: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: '#4CAF50',
  },
  label: {
    fontSize: 16,
  },
});

export default RadioButton;
