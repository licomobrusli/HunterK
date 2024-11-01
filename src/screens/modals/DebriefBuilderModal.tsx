// src/screens/modals/DebriefBuilderModal.tsx

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Picker } from '@react-native-picker/picker';
import { Debriefing, DebriefElement, DebriefElementType } from '../../types/Debriefing';
import { commonStyles } from '../../styles/commonStyles';
import { textStyles } from '../../styles/textStyles';
import PromptElement from '../../config/debrief/PromptElement';
import RadialsElement from '../../config/debrief/RadialsElement';
import { DebriefingsContext } from '../../config/debrief/DebriefingsContext';
import { sanitizeFileName } from '../../config/sanitizer';

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
  const [selectedElementType, setSelectedElementType] = useState<DebriefElementType | null>(null);
  const [showElementTypeDropdown, setShowElementTypeDropdown] = useState<boolean>(false);

  const { addDebriefing } = useContext(DebriefingsContext);

  // Handle adding a prompt element
  const handleAddPrompt = (element: DebriefElement) => {
    setElements([...elements, element]);
  };

  // Handle adding a radials element
  const handleAddRadials = (element: DebriefElement) => {
    setElements([...elements, element]);
  };

  // Handle removing an element
  const handleRemoveElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
  };

  // Handle saving the debriefing
  const handleSaveDebriefing = async () => {
    const sanitizedName = sanitizeFileName(debriefName);
    if (sanitizedName === '') {
      Alert.alert('Validation Error', 'Please enter a valid name for the debriefing.');
      return;
    }

    if (elements.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one element to the debriefing.');
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
      setSelectedElementType(null);
      setShowElementTypeDropdown(false);
      onClose();
    } catch (error) {
      console.error('Error saving debriefing:', error);
      Alert.alert('Error', 'Failed to save debriefing.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <ScrollView contentContainerStyle={commonStyles.container}>
        <Text style={textStyles.boldText1}>Create New Debriefing</Text>

        {/* Debriefing Name Input */}
        <View style={commonStyles.container}>
          <Text style={textStyles.text0}>Debriefing Name</Text>
          <TextInput
            style={commonStyles.textInput}
            placeholder="Enter debriefing name..."
            placeholderTextColor="#aaa"
            value={debriefName}
            onChangeText={setDebriefName}
          />
        </View>

        {/* Add Elements Button */}
        <TouchableOpacity
          style={commonStyles.button}
          onPress={() => setShowElementTypeDropdown(!showElementTypeDropdown)}
        >
          <Icon name="plus" size={20} color="#fff" />
          <Text style={textStyles.boldText0}> Add Element</Text>
        </TouchableOpacity>

        {/* Element Type Dropdown */}
        {showElementTypeDropdown && (
          <View style={commonStyles.container}>
            <Picker
              selectedValue={selectedElementType}
              onValueChange={(itemValue) => setSelectedElementType(itemValue)}
              style={commonStyles.picker}
            >
              <Picker.Item label="Select Element Type" value={null} />
              <Picker.Item label="Prompt Debrief" value="prompt" />
              <Picker.Item label="Radials (Multiple Choice)" value="radials" />
            </Picker>

            {/* Render Configuration Based on Selection */}
            {selectedElementType === 'prompt' && (
              <PromptElement
                onAdd={handleAddPrompt}
                onCancel={() => setSelectedElementType(null)}
              />
            )}

            {selectedElementType === 'radials' && (
              <RadialsElement
                onAdd={handleAddRadials}
                onCancel={() => setSelectedElementType(null)}
              />
            )}
          </View>
        )}

        {/* List of Added Elements */}
        <View style={commonStyles.container}>
          <Text style={textStyles.text1}>Added Elements</Text>
          {elements.length === 0 ? (
            <Text style={commonStyles.noElementsText}>No elements added yet.</Text>
          ) : (
            elements.map((el) => (
              <View key={el.id} style={commonStyles.container}>
                <View>
                  <Text style={textStyles.boldText0}>
                    {el.type === 'prompt' ? 'Prompt' : 'Radials'}
                  </Text>
                  <Text style={textStyles.textA}>{el.prompt}</Text>
                  {el.type === 'radials' && el.options && (
                    <View style={commonStyles.container}>
                      {el.options.map((option, idx) => (
                        <Text key={idx} style={textStyles.textA}>
                          • {option}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleRemoveElement(el.id)}>
                  <Icon name="trash-2" size={20} color="#ff4d4d" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Save Debriefing Button */}
        <TouchableOpacity
          style={commonStyles.button}
          onPress={handleSaveDebriefing}
        >
          <Text style={textStyles.text0}>Save Debriefing</Text>
        </TouchableOpacity>

        {/* Close Modal Button */}
        <TouchableOpacity
          style={commonStyles.closeModalButton}
          onPress={onClose}
        >
          <Icon name="x" size={24} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
};

export default DebriefBuilderModal;
