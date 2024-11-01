// src/styles/commonStyles.ts

import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  pad10: {
    padding: 10,
  },

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

  stateColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
    width: '100%',
    paddingHorizontal: 1,
    borderWidth: 1,
    borderColor: 'white',
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
    marginBottom: 10,
    height: 50,
    width: '100%',
    color: '#fff',
    backgroundColor: '#333',
  },

  // **List Items**
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
  pickerLabel: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },

  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },

  positionInput: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'white',
    padding: 1,
    textAlign: 'center',
    borderRadius: 1,
    color: 'white',
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
  inputText: {
    height: 30,
    width: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 1,
    padding: 5,
    justifyContent: 'center',
    textAlignVertical: 'center',
    textAlign: 'center',
    color: '#fff',
  },

  // **New Styles Added**
  closeModalButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
  noElementsText: {
    color: '#fff',
    fontStyle: 'italic',
  },
  // **Radial Label Styles**
  radialLabelInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // **Number of Radials Styles**
  radialsNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    width: '100%',
  },
});
