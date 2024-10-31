// src/styles/commonStyles.ts

import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const commonStyles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  subList: {
    paddingLeft: 20,
  },
  jsonViewer: {
    padding: 20,
  },

  // **Containers**
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#004225', // British Racing Green
    paddingHorizontal: 20, // Added padding for better layout
  },
  subModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  subModalContent: {
    width: 300,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#003015',
  },
  list: {
    flex: 1,
    width: '100%',
  },

  // **Text Elements**
  text1: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  text0: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  greenText: {
    color: 'green',
  },
  textA: {
    color: '#fff',
    fontSize: 14,
  },
  boldText0: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  boldText1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    alignSelf: 'center',
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



  headerIcon: {
    paddingRight: 10,
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

  // **Menu Items**
  menuItem: {
    paddingVertical: 10,
  },

  // **Overlay**
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // **Messages**
  messageContainer: {
    padding: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    zIndex: 1000,
  },
  successMessage: {
    backgroundColor: '#4CAF50',
  },
  errorMessage: {
    backgroundColor: '#F44336',
  },

  // **Scene Items**
  sceneItem: {
    flex: 1,
    padding: 10,
  },
  sceneTitle: {
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 10,
    alignSelf: 'center',
  },

  // **Sections**
  section: {
    marginBottom: 10, // Combined style for saveSection and loadSection
    width: '100%',
  },

  label: {
    fontSize: 18,
    color: '#fff',
    textDecorationLine: 'underline', // Indicate it's clickable
    marginBottom: 5, // Added for spacing
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

  addStateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
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

  newStateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#1b1b1b',
    marginRight: 10,
  },

  // **Modal Styles**
  modalContent: {
    backgroundColor: '#004225', // British Racing Green
    padding: 10,
    borderRadius: 10,
    width: (7 / 8) * width, // 7/8ths of screen width
    minHeight: (2 / 3) * height, // Minimum 2/3rds of screen height
    maxHeight: height * 0.9, // Allow up to 90% of screen height
    alignItems: 'center',
    justifyContent: 'flex-start', // Start from the top
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
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
  elementItemContainer: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noElementsText: {
    color: '#fff',
    fontStyle: 'italic',
  },
  marginTop20: {
    marginTop: 20,
  },
  marginTop10: {
    marginTop: 10,
  },
  marginTop5: {
    marginTop: 5,
  },
  fullWidthMarginBottom20: {
    width: '100%',
    marginBottom: 20,
  },
  // **Radial Label Styles**
  radialLabelContainer: {
    marginTop: 10,
    width: '100%',
  },
  radialLabelInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radialTextInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    color: '#fff',
    backgroundColor: '#333',
  },
  deleteRadialButton: {
    marginLeft: 10,
    padding: 5,
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
  repetitionsInput: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    paddingVertical: 5,
    paddingHorizontal: 10,
    width: 60,
    textAlign: 'center',
    color: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
    width: '100%',
  },
});
