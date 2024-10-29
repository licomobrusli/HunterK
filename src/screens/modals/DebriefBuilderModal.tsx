// src/screens/modals/DebriefBuilderModal.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Picker } from '@react-native-picker/picker';
import { Debriefing, DebriefElement, DebriefElementType } from '../../types/Debriefing';
import { commonStyles } from '../../styles/commonStyles';

interface DebriefingBuilderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (debriefing: Debriefing) => void;
}

const DebriefBuilderModal: React.FC<DebriefingBuilderModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [debriefName, setDebriefName] = useState<string>('');
  const [elements, setElements] = useState<DebriefElement[]>([]);
  const [selectedElementType, setSelectedElementType] = useState<DebriefElementType | null>(null);
  const [showElementTypeDropdown, setShowElementTypeDropdown] = useState<boolean>(false);
  const [promptText, setPromptText] = useState<string>('');
  const [numberOfRadials, setNumberOfRadials] = useState<number>(2);
  const [radialLabels, setRadialLabels] = useState<string[]>(['', '']);

  // Adjust radialLabels based on numberOfRadials using functional update to avoid ESLint warning
  useEffect(() => {
    setRadialLabels((prevLabels) => {
      if (numberOfRadials > prevLabels.length) {
        return [...prevLabels, ...Array(numberOfRadials - prevLabels.length).fill('')];
      } else if (numberOfRadials < prevLabels.length) {
        return prevLabels.slice(0, numberOfRadials);
      }
      return prevLabels;
    });
  }, [numberOfRadials]);

  // Handle adding a prompt element
  const addPromptElement = () => {
    if (promptText.trim() === '') {
      Alert.alert('Validation Error', 'Please enter a prompt.');
      return;
    }

    const newElement: DebriefElement = {
      id: `el_${Date.now()}`,
      type: 'prompt',
      prompt: promptText.trim(),
    };

    setElements([...elements, newElement]);
    // Reset fields
    setPromptText('');
    setSelectedElementType(null);
    setShowElementTypeDropdown(false);
  };

  // Handle adding a radials element
  const addRadialsElement = () => {
    if (promptText.trim() === '') {
      Alert.alert('Validation Error', 'Please enter a prompt.');
      return;
    }

    const trimmedLabels = radialLabels.map((label) => label.trim());
    const incompleteLabels = trimmedLabels.some((label) => label === '');

    if (incompleteLabels) {
      Alert.alert('Validation Error', 'Please enter all radial labels.');
      return;
    }

    const newElement: DebriefElement = {
      id: `el_${Date.now()}`,
      type: 'radials',
      prompt: promptText.trim(),
      options: trimmedLabels,
    };

    setElements([...elements, newElement]);
    // Reset fields
    setPromptText('');
    setNumberOfRadials(2);
    setRadialLabels(['', '']);
    setSelectedElementType(null);
    setShowElementTypeDropdown(false);
  };

  // Handle removing an element
  const removeElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
  };

  // Handle saving the debriefing
  const handleSaveDebriefing = () => {
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

    onSave(newDebriefing);
    // Reset all fields
    setDebriefName('');
    setElements([]);
    setSelectedElementType(null);
    setShowElementTypeDropdown(false);
    setPromptText('');
    setNumberOfRadials(2);
    setRadialLabels(['', '']);
    onClose();
  };

  // Handle changing the number of radials
  const handleNumberOfRadialsChange = (num: string) => {
    const parsed = parseInt(num, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setNumberOfRadials(parsed);
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid number greater than 0.');
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
              <View style={commonStyles.marginTop20}>
                <Text style={commonStyles.label}>Prompt</Text>
                <TextInput
                  style={commonStyles.textInput}
                  placeholder="Enter prompt/question..."
                  placeholderTextColor="#aaa"
                  value={promptText}
                  onChangeText={setPromptText}
                />
                <TouchableOpacity
                  style={commonStyles.saveButton}
                  onPress={addPromptElement}
                >
                  <Text style={commonStyles.saveButtonText}>Add Prompt</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedElementType === 'radials' && (
              <View style={commonStyles.marginTop20}>
                <Text style={commonStyles.label}>Prompt</Text>
                <TextInput
                  style={commonStyles.textInput}
                  placeholder="Enter prompt/question..."
                  placeholderTextColor="#aaa"
                  value={promptText}
                  onChangeText={setPromptText}
                />

                <Text style={commonStyles.label}>Number of Radials</Text>
                <TextInput
                  style={commonStyles.textInput}
                  placeholder="Enter number of radials..."
                  placeholderTextColor="#aaa"
                  keyboardType="number-pad"
                  value={numberOfRadials.toString()}
                  onChangeText={handleNumberOfRadialsChange}
                />

                {/* Dynamic Radial Labels */}
                {radialLabels.map((label, index) => (
                  <View key={index} style={commonStyles.marginTop10}>
                    <Text style={commonStyles.label}>Radial {index + 1} Label</Text>
                    <TextInput
                      style={commonStyles.textInput}
                      placeholder={`Enter label for Radial ${index + 1}`}
                      placeholderTextColor="#aaa"
                      value={label}
                      onChangeText={(text) => {
                        const updatedLabels = [...radialLabels];
                        updatedLabels[index] = text;
                        setRadialLabels(updatedLabels);
                      }}
                    />
                  </View>
                ))}

                <TouchableOpacity
                  style={commonStyles.saveButton}
                  onPress={addRadialsElement}
                >
                  <Text style={commonStyles.saveButtonText}>Add Radials</Text>
                </TouchableOpacity>
              </View>
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
                <TouchableOpacity onPress={() => removeElement(el.id)}>
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
