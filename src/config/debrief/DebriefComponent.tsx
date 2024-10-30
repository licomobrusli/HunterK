// src/components/DebriefComponent.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { commonStyles } from '../../styles/commonStyles';
import { Picker } from '@react-native-picker/picker';
import { NativeEventEmitter, NativeModules } from 'react-native';
import RadioButton from './RadioButton'; // Reusable RadioButton component
import { Debriefing, DebriefElement, DebriefElementType } from '../../types/Debriefing';

const { LogcatModule } = NativeModules;

interface DebriefComponentProps {
  debriefing: Debriefing; // The debriefing configuration
  onComplete: (responses: { [key: string]: any }) => void; // Callback when debriefing is complete
}

const DebriefComponent: React.FC<DebriefComponentProps> = ({ debriefing, onComplete }) => {
  const [responses, setResponses] = useState<{ [key: string]: any }>({});
  const listenerStartTimeRef = useRef<number>(0);

  const handleSubmit = useCallback(() => {
    // Validation
    let isValid = true;
    let validationMessage = '';

    debriefing.elements.forEach((element) => {
      if (element.type === DebriefElementType.Text && (!responses[element.id] || responses[element.id].trim() === '')) {
        isValid = false;
        validationMessage = 'Please answer all text prompts.';
      }

      if (
        (element.type === DebriefElementType.MultipleChoice || element.type === DebriefElementType.Radials) &&
        (!responses[element.id] || responses[element.id] === null)
      ) {
        isValid = false;
        validationMessage = 'Please answer all multiple-choice questions.';
      }

      // Add more validation based on element types as needed
    });

    if (!isValid) {
      Alert.alert('Validation Error', validationMessage);
      return;
    }

    // If validation passes
    console.log(`Submitting debriefing "${debriefing.name}" with responses:`, responses);
    Alert.alert('Success', 'Your debriefing has been submitted.');
    onComplete(responses);
  }, [responses, debriefing.elements, debriefing.name, onComplete]);

  const handleLogcatEvent = useCallback(
    (event: { eventName: string; timestamp: number }) => {
      const { eventName, timestamp } = event;

      if (timestamp < listenerStartTimeRef.current) {
        console.log(`DebriefComponent: Ignoring old event: ${eventName} at ${timestamp}`);
        return;
      }

      if (eventName === 'submit_debrief') {
        console.log('DebriefComponent: Submit event detected');
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  useEffect(() => {
    const logcatEventEmitter = new NativeEventEmitter(LogcatModule);
    const logcatListener = logcatEventEmitter.addListener('LogcatEvent', handleLogcatEvent);

    LogcatModule.startListening()
      .then((message: string) => {
        console.log(`DebriefComponent: ${message}`);
        listenerStartTimeRef.current = Date.now();
      })
      .catch((error: any) =>
        console.warn(`DebriefComponent: Error starting logcat listener - ${error}`)
      );

    return () => {
      logcatListener.remove();
      LogcatModule.stopListening()
        .then((message: string) => console.log(`DebriefComponent: ${message}`))
        .catch((error: any) =>
          console.warn(`DebriefComponent: Error stopping logcat listener - ${error}`)
        );
    };
  }, [handleLogcatEvent]);

  const handleOptionSelect = useCallback((elementId: string, option: string) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [elementId]: option,
    }));
  }, []);

  const handlePickerChange = useCallback((elementId: string, value: string) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [elementId]: value,
    }));
  }, []);

  const renderElement = (element: DebriefElement) => {
    switch (element.type) {
      case DebriefElementType.Prompt:
        return (
          <View key={element.id} style={styles.elementContainer}>
            <Text style={styles.prompt}>{element.prompt}</Text>
            <TextInput
              style={[commonStyles.textInput, styles.textInput]}
              multiline
              placeholder="Your response..."
              placeholderTextColor="#aaa"
              value={responses[element.id] || ''}
              onChangeText={(text) =>
                setResponses((prevResponses) => ({ ...prevResponses, [element.id]: text }))
              }
              textAlignVertical="top"
              scrollEnabled
            />
          </View>
        );

      case DebriefElementType.MultipleChoice:
      case DebriefElementType.Radials:
        return (
          <View key={element.id} style={styles.elementContainer}>
            <Text style={styles.prompt}>{element.prompt}</Text>
            {element.options?.map((option) => (
              <RadioButton
                key={option}
                label={option}
                selected={responses[element.id] === option}
                onPress={() => handleOptionSelect(element.id, option)}
                accessibilityLabel={`${option} option for ${element.prompt}`}
                accessibilityHint={`Select ${option}`}
              />
            ))}
          </View>
        );

      case DebriefElementType.Dropdown:
        return (
          <View key={element.id} style={styles.elementContainer}>
            <Text style={styles.prompt}>{element.prompt}</Text>
            <Picker
              selectedValue={responses[element.id] || ''}
              style={styles.picker}
              onValueChange={(itemValue) => handlePickerChange(element.id, itemValue)}
            >
              <Picker.Item label="Select an option..." value="" />
              {element.options?.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
        );

      case DebriefElementType.Scale:
        return (
          <View key={element.id} style={styles.elementContainer}>
            <Text style={styles.prompt}>{element.prompt}</Text>
            {/* Implement a scale component or use a third-party library */}
            {/* Placeholder implementation */}
            <Text>
              Scale from {element.scale?.min} to {element.scale?.max}
            </Text>
            <TextInput
              style={[commonStyles.textInput, styles.textInput]}
              keyboardType="numeric"
              placeholder={`Enter a value between ${element.scale?.min} and ${element.scale?.max}`}
              placeholderTextColor="#aaa"
              value={responses[element.id] ? String(responses[element.id]) : ''}
              onChangeText={(text) =>
                setResponses((prevResponses) => ({
                  ...prevResponses,
                  [element.id]: parseInt(text, 10) || 0,
                }))
              }
            />
          </View>
        );

      // Add more cases for different element types as needed

      default:
        console.warn(`Unhandled element type: ${element.type}`);
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={commonStyles.title}>{debriefing.name}</Text>
        {debriefing.elements?.map((element) => renderElement(element))}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Debrief</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
    width: '100%',
  },
  elementContainer: {
    width: '90%',
    marginBottom: 20,
  },
  prompt: {
    fontSize: 16,
    marginBottom: 10,
  },
  textInput: {
    height: 80,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DebriefComponent;
