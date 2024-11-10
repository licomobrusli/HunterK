import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

type AutoShrinkTextInputProps = TextInputProps & {
  value: string;
};

const AutoShrinkTextInput: React.FC<AutoShrinkTextInputProps> = ({
  value,
  style,
  ...props
}) => {
  const fontSize = value.length === 2 ? 8 : 10; // Adjust font size based on text length

  return (
    <TextInput
      style={[styles.textAShrink, style, { fontSize }]}
      value={value}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  textAShrink: {
    position: 'absolute',
    textAlignVertical: 'center',
    textAlign: 'center',
    color: '#fff',
    fontSize: 10, // Default font size
  },
});

export default AutoShrinkTextInput;
