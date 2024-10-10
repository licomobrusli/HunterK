// src/styles/commonStyles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const commonStyles = StyleSheet.create({
  // **Containers**
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#004225', // British Racing Green
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
  text: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    color: '#FFFFFF',
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  itemText: {
    color: '#fff',
    fontSize: 16,
  },
  menuText: {
    fontSize: 18,
    color: '#fff', // Cream off-white
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  currentPath: {
    color: '#fff',
    fontSize: 16,
  },

  // **Buttons**
  button: {
    backgroundColor: '#FF6347', // Tomato color for the button background
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#B0B0B0', // Grey color for disabled buttons
  },
  backButton: {
    padding: 10,
  },
  closeButton: {
    padding: 10,
  },
  abortButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'red',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  abortButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007F4E',
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  headerIcon: {
    paddingRight: 10,
  },

  // **Inputs**
  inputContainer: {
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    width: 80,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#1b1b1b',
  },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    color: '#fff',
    backgroundColor: '#333',
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
  sceneItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
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
    width: 40,
    borderWidth: 1,
    borderColor: 'black',
    padding: 5,
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#1b1b1b',
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
   modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
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
  modalText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  stateColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
    // **Fixed Width Label**
    fixedWidthLabel: {
      width: 100, // Adjust the width as needed
      fontSize: 16,
      color: '#FFFFFF',
      backgroundColor: '#333', // Optional background color
      textAlign: 'center', // Center the text
      paddingVertical: 10,
      borderRadius: 5,
    },
});

