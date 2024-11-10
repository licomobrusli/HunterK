// src/screens/modals/DebriefBuilderModal.tsx

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  FlatList,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {
  Debriefing,
  DebriefElement,
  DebriefElementType,
} from '../../types/Debriefing';
import { DebriefingsContext } from '../../config/debrief/DebriefingsContext';
import { sanitizeFileName } from '../../config/sanitizer';
import { commonStyles } from '../../styles/commonStyles';
import { textStyles } from '../../styles/textStyles';
import { containerStyles } from '../../styles/containerStyles';
import { buttonStyles } from '../../styles/buttonStyles';
import PlusIcon from '../../assets/icons/plus.svg';
import Bin from '../../assets/icons/bin.svg';

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
  };

  // Handle removing an element
  const handleRemoveElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
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

// AddElementRow Component
type AddElementRowProps = {
  onAddElement: (element: DebriefElement) => void;
};

const AddElementRow: React.FC<AddElementRowProps> = ({ onAddElement }) => {
  const [promptText, setPromptText] = useState('');
  const [elementType, setElementType] = useState<DebriefElementType | null>(null);
  const [radialsOptions, setRadialsOptions] = useState<string[]>([]);
  const [showElementTypeModal, setShowElementTypeModal] = useState(false);
  const [showRadialsModal, setShowRadialsModal] = useState(false);

  // Check if the element is fully configured
  const isElementConfigured = () => {
    if (promptText.trim() === '') {
      return false;
    }
    if (!elementType) {
      return false;
    }
    if (
      elementType === DebriefElementType.Radials &&
      radialsOptions.length === 0
    ) {
      return false;
    }
    return true;
  };

  // Handle adding the element
  const handleAdd = () => {
    if (!isElementConfigured()) {
      Alert.alert(
        'Validation Error',
        'Please complete all fields before adding the element.'
      );
      return;
    }
    // Create element
    const newElement: DebriefElement = {
      id: `${Date.now()}`, // or use a better id
      type: elementType!,
      prompt: promptText,
    };
    if (elementType === DebriefElementType.Radials) {
      newElement.options = radialsOptions;
    }
    onAddElement(newElement);
    // Reset fields
    setPromptText('');
    setElementType(null);
    setRadialsOptions([]);
  };

  return (
    <View style={containerStyles.itemContainer}>
      <View style={containerStyles.containerLeft}>
        {/* Icon button (could be empty or use a placeholder) */}
        <View style={buttonStyles.iconButton} />
        {/* Prompt Text Input */}
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
        {/* Element Type Field (replacing time field) */}
        <View style={buttonStyles.timeButton}>
          <TouchableOpacity onPress={() => setShowElementTypeModal(true)}>
            <Text style={textStyles.text0}>
              {elementType ? elementType : 'Type'}
            </Text>
          </TouchableOpacity>
        </View>
        {/* First Icon Button: For radials, shows number of options */}
        <TouchableOpacity
          onPress={() =>
            elementType === DebriefElementType.Radials && setShowRadialsModal(true)
          }
          disabled={elementType !== DebriefElementType.Radials}
        >
          <View style={buttonStyles.iconButton}>
            {elementType === DebriefElementType.Radials ? (
              <Text style={textStyles.text0}>{radialsOptions.length}</Text>
            ) : (
              <View />
            )}
          </View>
        </TouchableOpacity>
        {/* Second Icon Button: Can be left empty or for future use */}
        <View style={buttonStyles.iconButton} />
        {/* Plus Icon Button */}
        <TouchableOpacity onPress={handleAdd} disabled={!isElementConfigured()}>
          <View style={buttonStyles.iconButton}>
            <PlusIcon width={18} height={18} fill="#fff" stroke="#004225" />
          </View>
        </TouchableOpacity>
      </View>

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

      {/* Radials Options Modal */}
      {elementType === DebriefElementType.Radials && (
        <Modal visible={showRadialsModal} animationType="slide" transparent={false}>
          <View style={containerStyles.container}>
            <Text style={textStyles.boldText1}>Radials Options</Text>
            <FlatList
              data={radialsOptions}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={containerStyles.itemContainer}>
                  <TextInput
                    style={commonStyles.textInput}
                    value={item}
                    onChangeText={(text) => {
                      const newOptions = [...radialsOptions];
                      newOptions[index] = text;
                      setRadialsOptions(newOptions);
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      const newOptions = radialsOptions.filter((_, i) => i !== index);
                      setRadialsOptions(newOptions);
                    }}
                  >
                    <View style={buttonStyles.iconButton}>
                      <Bin width={18} height={18} fill="#fff" stroke="#004225" />
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            />
            <TouchableOpacity
              style={buttonStyles.button}
              onPress={() => setRadialsOptions([...radialsOptions, ''])}
            >
              <Text style={textStyles.text0}>Add Option</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={buttonStyles.button}
              onPress={() => setShowRadialsModal(false)}
            >
              <Text style={textStyles.text0}>Done</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

// ElementRow Component
type ElementRowProps = {
  element: DebriefElement;
  index: number;
  onRemove: () => void;
};

const ElementRow: React.FC<ElementRowProps> = ({ element, onRemove }) => {
  return (
    <View style={containerStyles.itemContainer}>
      <View style={containerStyles.containerLeft}>
        {/* Icon button (could be empty or use a placeholder) */}
        <View style={buttonStyles.iconButton} />
        {/* Prompt Text */}
        <Text style={commonStyles.fixedWidthLabel}>{element.prompt}</Text>
      </View>
      <View style={containerStyles.containerRight}>
        {/* Element Type Field */}
        <View style={buttonStyles.timeButton}>
          <Text style={textStyles.text0}>{element.type}</Text>
        </View>
        {/* First Icon Button: For radials, shows number of options */}
        <View style={buttonStyles.iconButton}>
          {element.type === DebriefElementType.Radials && element.options ? (
            <Text style={textStyles.text0}>{element.options.length}</Text>
          ) : (
            <View />
          )}
        </View>
        {/* Second Icon Button: Can be left empty or for future use */}
        <View style={buttonStyles.iconButton} />
        {/* Remove Icon Button */}
        <TouchableOpacity onPress={onRemove}>
          <View style={buttonStyles.iconButton}>
            <Bin width={18} height={18} fill="#fff" stroke="#004225" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  modalOption: {
    padding: 10,
  },
});

export default DebriefBuilderModal;
