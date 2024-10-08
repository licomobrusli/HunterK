// src/styles/commonStyles.ts
import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  // **Containers**
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#004225', // British Racing Green
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#004225',
    borderRadius: 10,
    alignItems: 'center',
  },
  subModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  subModalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 40,
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
    marginBottom: 20,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    color: '#FFFFFF',
    alignSelf: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#FFFFFF',
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
  buttonText: {
    color: '#ffffff', // White text color
    fontSize: 18,
    fontWeight: 'bold',
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
    padding: 15,
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
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  abortButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#007F4E',
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  deleteButton: {
    padding: 5,
    backgroundColor: 'red',
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  headerIcon: {
    paddingRight: 15, // Optional: Add padding or other styles if needed
  },

  // **Inputs**
  inputContainer: {
    marginBottom: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    width: 100,
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
    marginBottom: 20,
    height: 50,
    width: '100%',
    color: '#fff',
    backgroundColor: '#333',
  },

  // **List Items**
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },

  // **Menu Items**
  menuItem: {
    paddingVertical: 15,
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
    paddingVertical: 5,
  },
  sceneItem: {
    flex: 1,
    padding: 10,
  },
  sceneTitle: {
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 15,
    alignSelf: 'center',
  },

  // **Sections**
  section: {
    marginBottom: 30, // Combined style for saveSection and loadSection
    width: '100%',
  },

  label: {
    fontSize: 18,
    color: '#fff',
    textDecorationLine: 'underline', // Indicate it's clickable
  },

  buttonContainer: {
    marginBottom: 15,
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
    marginBottom: 20,
    width: '100%',
  },
  pickerLabel: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },

});

