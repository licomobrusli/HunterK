// src/components/DebriefComponent.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { NativeEventEmitter, NativeModules } from 'react-native';

const { LogcatModule } = NativeModules;

interface DebriefComponentProps {
  debriefType: string; // Identifier for the debrief type
  onComplete: () => void; // Callback when debriefing is complete
}

interface LogcatEvent {
  eventName: string;
  timestamp: number;
}

const DebriefComponent: React.FC<DebriefComponentProps> = ({ debriefType, onComplete }) => {
  const [debriefText, setDebriefText] = useState('');
  const listenerStartTimeRef = useRef<number>(0);

  const handleSubmit = useCallback(() => {
    if (debriefText.trim() === '') {
      console.warn('DebriefComponent: Debrief text is empty');
      return;
    }
    console.log(`DebriefComponent: Submitting debrief for type "${debriefType}": ${debriefText}`);
    // Add logic to handle the submitted debrief text, such as saving to a database
    onComplete();
  }, [debriefText, debriefType, onComplete]);

  const handleLogcatEvent = useCallback((event: LogcatEvent) => {
    const { eventName, timestamp } = event;

    if (timestamp < listenerStartTimeRef.current) {
      console.log(`DebriefComponent: Ignoring old event: ${eventName} at ${timestamp}`);
      return;
    }

    if (eventName === 'submit_debrief') {
      console.log('DebriefComponent: Submit event detected');
      handleSubmit();
    }
  }, [handleSubmit]);

  useEffect(() => {
    const logcatEventEmitter = new NativeEventEmitter(LogcatModule);
    const logcatListener = logcatEventEmitter.addListener('LogcatEvent', handleLogcatEvent);

    LogcatModule.startListening()
      .then((message: string) => {
        console.log(`DebriefComponent: ${message}`);
        listenerStartTimeRef.current = Date.now();
      })
      .catch((error: any) => console.warn(`DebriefComponent: Error starting logcat listener - ${error}`));

    return () => {
      logcatListener.remove();
      LogcatModule.stopListening()
        .then((message: string) => console.log(`DebriefComponent: ${message}`))
        .catch((error: any) => console.warn(`DebriefComponent: Error stopping logcat listener - ${error}`));
    };
  }, [handleLogcatEvent]);

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={commonStyles.title}>{debriefType} Debrief</Text>
      <TextInput
        style={[commonStyles.textInput, styles.debriefInput]}
        multiline
        placeholder={`Type your ${debriefType.toLowerCase()} debrief here...`}
        placeholderTextColor="#aaa"
        value={debriefText}
        onChangeText={setDebriefText}
        textAlignVertical="top" // Ensures text starts at the top-left
        scrollEnabled
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Debrief</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  debriefInput: {
    flex: 1,
    width: '90%', // Adjust as needed
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    color: '#000',
    // Optional: Add shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android shadow
    // Optional: Add a border to distinguish the input area
    borderWidth: 1,
    borderColor: '#ccc',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DebriefComponent;
