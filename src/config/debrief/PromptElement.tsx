// src/config/debrief/PromptElement.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { DebriefElement } from '../../types/Debriefing';
import { commonStyles } from '../../styles/commonStyles';

interface PromptElementProps {
  onAdd: (element: DebriefElement) => void;
  onCancel: () => void;
}

const PromptElement: React.FC<PromptElementProps> = ({ onAdd, onCancel }) => {
  const [promptText, setPromptText] = useState<string>('');

  const handleAddPrompt = () => {
    if (promptText.trim() === '') {
      Alert.alert('Validation Error', 'Please enter a prompt.');
      return;
    }

    const newElement: DebriefElement = {
      id: `el_${Date.now()}`,
      type: 'prompt',
      prompt: promptText.trim(),
    };

    onAdd(newElement);
    setPromptText('');
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
      <View style={commonStyles.buttonRow}>
        <TouchableOpacity style={commonStyles.saveButton} onPress={handleAddPrompt}>
          <Text style={commonStyles.saveButtonText}>Add Prompt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={commonStyles.cancelButton} onPress={onCancel}>
          <Text style={commonStyles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PromptElement;
