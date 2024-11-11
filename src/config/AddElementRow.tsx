// src/config/AddElementRow.tsx

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import { DebriefElement, DebriefElementType } from '../types/Debriefing';
import { commonStyles } from '../styles/commonStyles';
import { containerStyles } from '../styles/containerStyles';
import { buttonStyles } from '../styles/buttonStyles';
import PlusIcon from '../assets/icons/plus.svg';
import { textStyles } from '../styles/textStyles';
import RadialRow from '../config/RadialRow';

type AddElementRowProps = {
  onAddElement: (element: DebriefElement) => void;
};

const AddElementRow: React.FC<AddElementRowProps> = ({ onAddElement }) => {
  const [promptText, setPromptText] = useState('');
  const [elementType, setElementType] = useState<DebriefElementType | null>(null);
  const [radialsOptions, setRadialsOptions] = useState<string[]>([]);
  const [showElementTypeModal, setShowElementTypeModal] = useState(false);

  // Check if the element is fully configured
  const isElementConfigured = () => {
    if (promptText.trim() === '') {return false;}
    if (!elementType) {return false;}
    if (elementType === DebriefElementType.Radials && radialsOptions.length === 0)
      {return false;}
    return true;
  };

  // Handle adding the element
  const handleAdd = () => {
    if (!isElementConfigured()) {
      Alert.alert('Validation Error', 'Please complete all fields before adding the element.');
      return;
    }

    // Create the new element
    const newElement: DebriefElement = {
      id: `${Date.now()}`, // Use a unique identifier
      type: elementType!,
      prompt: promptText,
      options: elementType === DebriefElementType.Radials ? radialsOptions : undefined,
    };

    onAddElement(newElement);
    // Reset fields
    setPromptText('');
    setElementType(null);
    setRadialsOptions([]);
  };

  // Handle adding a new radial option
  const handleAddRadialOption = () => {
    setRadialsOptions([...radialsOptions, '']);
    console.log('Added a new radial option');
  };

  // Handle updating a radial option
  const handleUpdateRadialOption = (index: number, text: string) => {
    const updatedOptions = [...radialsOptions];
    updatedOptions[index] = text;
    setRadialsOptions(updatedOptions);
    console.log(`Updated radial option ${index + 1}: ${text}`);
  };

  // Handle removing a radial option
  const handleRemoveRadialOption = (index: number) => {
    const updatedOptions = radialsOptions.filter((_, i) => i !== index);
    setRadialsOptions(updatedOptions);
    console.log(`Removed radial option ${index + 1}`);
  };

  return (
    <View style={styles.container}>
      {/* Main AddElementRow */}
      <View style={containerStyles.itemContainer}>
        <View style={containerStyles.containerLeft}>
          <View style={buttonStyles.iconButton} />
          <TextInput
            style={commonStyles.fixedWidthLabel}
            value={promptText}
            onChangeText={setPromptText}
            placeholder="Enter prompt..."
            placeholderTextColor="#aaa"
            maxLength={100}
          />
        </View>

        <View style={containerStyles.containerRight}>
          {/* Element Type Field */}
          <View style={buttonStyles.timeButton}>
            <TouchableOpacity onPress={() => setShowElementTypeModal(true)}>
              <Text style={textStyles.text0}>{elementType ? elementType : 'Type'}</Text>
            </TouchableOpacity>
          </View>
          {/* First Icon Button: Shows number of radial options if Radials */}
          <TouchableOpacity
            onPress={() => {
              if (elementType === DebriefElementType.Radials) {
                handleAddRadialOption(); // Trigger adding a new radial option
              }
            }}
            disabled={elementType !== DebriefElementType.Radials}
            activeOpacity={0.7} // Optional: Improve touch feedback
          >
            <View style={buttonStyles.iconButton}>
              {elementType === DebriefElementType.Radials ? (
                <Text style={textStyles.text0}>{radialsOptions.length}</Text>
              ) : (
                <View />
              )}
            </View>
          </TouchableOpacity>
          {/* Second Icon Button: Reserved for future use */}
          <View style={buttonStyles.iconButton} />
          {/* Plus Icon Button */}
          <TouchableOpacity onPress={handleAdd} disabled={!isElementConfigured()}>
            <View style={buttonStyles.iconButton}>
              <PlusIcon width={18} height={18} fill="#fff" stroke="#004225" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Radial Rows */}
      {elementType === DebriefElementType.Radials &&
        radialsOptions.map((option, index) => (
          <RadialRow
            key={index}
            value={option}
            onChange={(text) => handleUpdateRadialOption(index, text)}
            onRemove={() => handleRemoveRadialOption(index)}
          />
        ))}

      {/* Add Radial Option Button */}
      {elementType === DebriefElementType.Radials && (
        <TouchableOpacity onPress={handleAddRadialOption} style={styles.addRadialButton}>
          <PlusIcon width={18} height={18} fill="#fff" stroke="#004225" />
          <Text style={textStyles.text0}>Add Radial</Text>
        </TouchableOpacity>
      )}

      {/* Element Type Modal */}
      <Modal visible={showElementTypeModal} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowElementTypeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={textStyles.boldText1}>Select Element Type</Text>
            <TouchableOpacity
              onPress={() => {
                setElementType(DebriefElementType.Prompt);
                setShowElementTypeModal(false);
              }}
              style={styles.modalOption}
            >
              <Text style={textStyles.text0}>Prompt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setElementType(DebriefElementType.Radials);
                setShowElementTypeModal(false);
              }}
              style={styles.modalOption}
            >
              <Text style={textStyles.text0}>Radials</Text>
            </TouchableOpacity>
            {/* Add other element types if needed */}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column', // Stack main row and radial rows vertically
    marginVertical: 5,
  },
  addRadialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20, // Align with radial rows
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000000aa',
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'black',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  modalOption: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
});

export default AddElementRow;
