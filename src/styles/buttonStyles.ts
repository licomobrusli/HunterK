// src/styles/buttonStyles.ts

import { StyleSheet } from 'react-native';

export const buttonStyles = StyleSheet.create({
  // **Buttons**
  button: {
    backgroundColor: '#FF6347', // Tomato color for the button background
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    flexDirection: 'row', // Align icon and text horizontally
  },
  disabledButton: {
    backgroundColor: '#B0B0B0', // Grey color for disabled buttons
  },
});
