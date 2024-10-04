// src/styles/commonStyles.ts
import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#004225', // British Racing Green
  },
  text: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1b1b1b', // Erie Black
  },
  button: {
    backgroundColor: '#FF6347', // Tomato color for the button background
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#ffffff', // White text color
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#B0B0B0', // Grey color for disabled buttons
  },
});
