// src/screens/modals/DebriefBuilderModal.tsx

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {
  Debriefing,
  DebriefElement,
} from '../../types/Debriefing';
import { DebriefingsContext } from '../../config/debrief/DebriefingsContext';
import { sanitizeFileName } from '../../config/sanitizer';
import { commonStyles } from '../../styles/commonStyles';
import { textStyles } from '../../styles/textStyles';
import { containerStyles } from '../../styles/containerStyles';
import { buttonStyles } from '../../styles/buttonStyles';
import AddElementRow from '../../config/AddElementRow';
import ElementRow from '../../config/ElementRow'; // Ensure correct path

interface DebriefingBuilderModalProps {
  visible: boolean;
  onClose: () => void;
}

const DebriefBuilderModal: React.FC<DebriefingBuilderModalProps> = ({
  visible,
  onClose,
}) => {
  const [debriefName, setDebriefName] = useState<string>('');
  const [elements, setElements] = useState<DebriefElement[]>([]);

  const { addDebriefing } = useContext(DebriefingsContext);

  // Handle adding an element
  const handleAddElement = (element: DebriefElement) => {
    setElements([...elements, element]);
    console.log('Added new element:', element);
  };

  // Handle removing an element
  const handleRemoveElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    console.log(`Removed element with id: ${id}`);
  };

  // Handle saving the debriefing
  const handleSaveDebriefing = async () => {
    const sanitizedName = sanitizeFileName(debriefName);
    if (sanitizedName === '') {
      Alert.alert(
        'Validation Error',
        'Please enter a valid name for the debriefing.'
      );
      return;
    }

    if (elements.length === 0) {
      Alert.alert(
        'Validation Error',
        'Please add at least one element to the debriefing.'
      );
      return;
    }

    const newDebriefing: Debriefing = {
      id: sanitizedName,
      name: sanitizedName,
      elements,
    };

    try {
      await addDebriefing(newDebriefing);
      Alert.alert('Success', 'Debriefing saved successfully!');
      // Reset all fields
      setDebriefName('');
      setElements([]);
      onClose();
    } catch (error) {
      console.error('Error saving debriefing:', error);
      Alert.alert('Error', 'Failed to save debriefing.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={containerStyles.container}>
        <Text style={textStyles.boldText1}>Create New Debriefing</Text>

        {/* Debriefing Name Input */}
        <View style={containerStyles.container}>
          <Text style={textStyles.text0}>Debriefing Name</Text>
          <TextInput
            style={commonStyles.textInput}
            placeholder="Enter debriefing name..."
            placeholderTextColor="#aaa"
            value={debriefName}
            onChangeText={setDebriefName}
          />
        </View>

        {/* Add Element Row */}
        <AddElementRow onAddElement={handleAddElement} />

        {/* List of Added Elements */}
        <View style={containerStyles.container}>
          <Text style={textStyles.text1}>Added Elements</Text>
          {elements.length === 0 ? (
            <Text style={textStyles.italicText}>No elements added yet.</Text>
          ) : (
            elements.map((el, index) => (
              <ElementRow
                key={el.id}
                element={el}
                index={index}
                onRemove={() => handleRemoveElement(el.id)}
              />
            ))
          )}
        </View>

        {/* Save Debriefing Button */}
        <TouchableOpacity style={buttonStyles.button} onPress={handleSaveDebriefing}>
          <Text style={textStyles.text0}>Save Debriefing</Text>
        </TouchableOpacity>

        {/* Close Modal Button */}
        <TouchableOpacity style={buttonStyles.button} onPress={onClose}>
          <Icon name="x" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default DebriefBuilderModal;
