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
import PromptElement from '../../config/debrief/PromptElement';
import RadialsElement from '../../config/debrief/RadialsElement';
import { DebriefingsContext } from '../../config/debrief/DebriefingsContext';

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

  // Access the DebriefingsContext
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
    if (debriefName.trim() === '') {
      Alert.alert('Validation Error', 'Please enter a name for the debriefing.');
      return;
    }

    if (elements.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one element to the debriefing.');
      return;
    }

    const newDebriefing: Debriefing = {
      id: `debrief_${Date.now()}`,
      name: debriefName.trim(),
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
        <Text style={commonStyles.title}>Create New Debriefing</Text>

        {/* Debriefing Name Input */}
        <View style={commonStyles.inputContainer}>
          <Text style={commonStyles.label}>Debriefing Name</Text>
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
          <Text style={commonStyles.addElementButtonText}> Add Element</Text>
        </TouchableOpacity>

        {/* Element Type Dropdown */}
        {showElementTypeDropdown && (
          <View style={commonStyles.fullWidthMarginBottom20}>
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
        <View style={commonStyles.fullWidthMarginBottom20}>
          <Text style={commonStyles.addedElementsTitle}>Added Elements</Text>
          {elements.length === 0 ? (
            <Text style={commonStyles.noElementsText}>No elements added yet.</Text>
          ) : (
            elements.map((el) => (
              <View key={el.id} style={commonStyles.elementItemContainer}>
                <View>
                  <Text style={commonStyles.elementTypeText}>
                    {el.type === 'prompt' ? 'Prompt' : 'Radials'}
                  </Text>
                  <Text style={commonStyles.elementPromptText}>{el.prompt}</Text>
                  {el.type === 'radials' && el.options && (
                    <View style={commonStyles.marginTop5}>
                      {el.options.map((option, idx) => (
                        <Text key={idx} style={commonStyles.radialOptionText}>
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
          style={commonStyles.saveButton}
          onPress={handleSaveDebriefing}
        >
          <Text style={commonStyles.saveButtonText}>Save Debriefing</Text>
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
