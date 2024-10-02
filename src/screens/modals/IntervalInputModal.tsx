// src/screens/modals/IntervalInputModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';

type IntervalInputModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (interval: number) => void;
  stateName: string;
  currentInterval: number;
};

const IntervalInputModal: React.FC<IntervalInputModalProps> = ({
  visible,
  onClose,
  onSave,
  stateName,
  currentInterval,
}) => {
  const [inputInterval, setInputInterval] = useState<string>(
    currentInterval.toString()
  );

  const handleSave = () => {
    const intervalValue = parseInt(inputInterval, 10);
    if (isNaN(intervalValue) || intervalValue <= 0) {
      Alert.alert('Invalid Interval', 'Please enter a valid positive number.');
      return;
    }
    onSave(intervalValue);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.subModalContainer}>
        <View style={styles.subModalContent}>
          <Text style={styles.modalTitle}>
            Set Interval for {stateName}
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={inputInterval}
            onChangeText={setInputInterval}
          />
          <Button title="Save Interval" onPress={handleSave} />
          <Button title="Cancel" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

export default IntervalInputModal;

const styles = StyleSheet.create({
  subModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  subModalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: '#004225', // British Racing Green
  },
});
