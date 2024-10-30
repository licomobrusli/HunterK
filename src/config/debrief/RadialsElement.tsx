// src/config/debrief/RadialsElement.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { DebriefElement, DebriefElementType } from '../../types/Debriefing';
import { commonStyles } from '../../styles/commonStyles';

interface RadialsElementProps {
  onAdd: (element: DebriefElement) => void;
  onCancel: () => void;
}

const RadialsElement: React.FC<RadialsElementProps> = ({ onAdd, onCancel }) => {
  const [promptText, setPromptText] = useState<string>('');
  const [numberOfRadials, setNumberOfRadials] = useState<number>(2);
  const [radialLabels, setRadialLabels] = useState<string[]>(['', '']);

  // State to manage editing mode for numberOfRadials
  const [isEditingRadialsNumber, setIsEditingRadialsNumber] = useState<boolean>(false);
  const [tempRadialsNumber, setTempRadialsNumber] = useState<string>('2'); // Initialize with default number

  // Adjust radialLabels based on numberOfRadials
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

  // Handle changing the number of radials when in edit mode
  const handleRadialsNumberBlur = () => {
    const parsed = parseInt(tempRadialsNumber, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setNumberOfRadials(parsed);
      setIsEditingRadialsNumber(false);
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid number greater than 0.');
      setTempRadialsNumber(numberOfRadials.toString());
      setIsEditingRadialsNumber(false);
    }
  };

  // Function to remove a specific radial label
  const removeRadialLabel = (index: number) => {
    const updatedLabels = radialLabels.filter((_, idx) => idx !== index);
    setRadialLabels(updatedLabels);
    setNumberOfRadials(updatedLabels.length);
  };

  const handleAddRadials = () => {
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

    if (numberOfRadials <= 0) {
      Alert.alert('Validation Error', 'Number of radials must be greater than 0.');
      return;
    }

    const newElement: DebriefElement = {
      id: `el_${Date.now()}`,
      type: DebriefElementType.Radials, // Use enum value here
      prompt: promptText.trim(),
      options: trimmedLabels,
    };

    onAdd(newElement);
    // Reset fields
    setPromptText('');
    setNumberOfRadials(2);
    setRadialLabels(['', '']);
  };

  return (
    <View style={commonStyles.elementConfigContainer}>
      <Text style={commonStyles.label}>Prompt</Text>
      <TextInput
        style={commonStyles.textInput}
        placeholder="Enter prompt/question..."
        placeholderTextColor="#aaa"
        value={promptText}
        onChangeText={setPromptText}
      />

      {/* Number of Radials Field */}
      <Text style={commonStyles.label}>Number of Radials</Text>
      {isEditingRadialsNumber ? (
        <TextInput
          style={commonStyles.radialsNumberInput}
          placeholder="Enter number of radials..."
          placeholderTextColor="#aaa"
          keyboardType="number-pad"
          value={tempRadialsNumber}
          onChangeText={setTempRadialsNumber}
          onBlur={handleRadialsNumberBlur}
          autoFocus
        />
      ) : (
        <TouchableOpacity
          style={commonStyles.radialsNumberDisplay}
          onPress={() => {
            setIsEditingRadialsNumber(true);
            setTempRadialsNumber(numberOfRadials.toString());
          }}
        >
          <Text style={commonStyles.text}>{numberOfRadials}</Text>
        </TouchableOpacity>
      )}

      {/* Dynamic Radial Labels with 'X' Buttons */}
      {radialLabels.map((label, index) => (
        <View key={index} style={commonStyles.radialLabelContainer}>
          <Text style={commonStyles.label}>Radial {index + 1} Label</Text>
          <View style={commonStyles.radialLabelInputContainer}>
            <TextInput
              style={commonStyles.radialTextInput}
              placeholder={`Enter label for Radial ${index + 1}`}
              placeholderTextColor="#aaa"
              value={label}
              onChangeText={(text) => {
                const updatedLabels = [...radialLabels];
                updatedLabels[index] = text;
                setRadialLabels(updatedLabels);
              }}
            />
            <TouchableOpacity
              onPress={() => removeRadialLabel(index)}
              style={commonStyles.deleteRadialButton}
            >
              <Icon name="x" size={16} color="#ff4d4d" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={commonStyles.buttonRow}>
        <TouchableOpacity style={commonStyles.saveButton} onPress={handleAddRadials}>
          <Text style={commonStyles.saveButtonText}>Add Radials</Text>
        </TouchableOpacity>
        <TouchableOpacity style={commonStyles.cancelButton} onPress={onCancel}>
          <Text style={commonStyles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RadialsElement;
