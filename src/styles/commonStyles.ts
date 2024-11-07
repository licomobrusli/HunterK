// src/styles/commonStyles.ts

import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  pad10: {
    padding: 10,
  },

  // **Inputs**
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    color: '#fff',
    backgroundColor: '#333',
    width: '100%', // Ensure full width usage
  },
  picker: {
    height: 30,
    width: 100,
    color: '#fff',
    backgroundColor: '#333',
  },

  // **Overlay**
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // **Messages**
  success: {
    backgroundColor: '#4CAF50', // Green color for success messages
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  error: {
    backgroundColor: '#F44336', // Red color for error messages
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },

  selectedItem: {
    backgroundColor: '#005F2E', // Dark green background for selected items
    padding: 10,
    borderRadius: 5,
  },

  // **Modal Styles**
  fixedWidthLabel: {
    width: 100, // Adjust the width as needed
    height: 30,
    color: '#FFFFFF',
    textAlign: 'left', // Align the text to the left
    padding: 5,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: 'white',
  },
  fullscreenTouchable: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // **Radial Label Styles**
  radialsNumberInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    color: '#fff',
    backgroundColor: '#333',
    width: '100%',
  },
  elementConfigContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#005F2E',
    padding: 15,
    borderRadius: 5,
  },
});
