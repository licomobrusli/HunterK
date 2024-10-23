import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, NativeEventEmitter, NativeModules } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { NavigationProp } from '@react-navigation/native';

// Import your native module (as in WelcomeScreen)
const { LogcatModule } = NativeModules;

interface DebriefScreenProps {
  navigation: NavigationProp<any>;
}

const DebriefScreen: React.FC<DebriefScreenProps> = ({ navigation }) => {
  const [debriefText, setDebriefText] = useState('');

  // Ref to store the listener start time
  const listenerStartTimeRef = useRef<number>(0);

  // Add useEffect for LogcatModule similar to WelcomeScreen
  useEffect(() => {
    const logcatEventEmitter = new NativeEventEmitter(LogcatModule);

    const logcatListener = logcatEventEmitter.addListener('LogcatEvent', (event) => {
      const { eventName, timestamp } = event;

      // Only process events that occurred after the listener started
      if (timestamp < listenerStartTimeRef.current) {
        console.log(`DebriefScreen Ignoring old event: ${eventName} at ${timestamp}`);
        return;
      }

      // Handle logcat events if needed, e.g., navigate to another screen or perform actions
      if (eventName === 'long_press') {
        console.log('DebriefScreen: Long press detected, navigating to Welcome screen');
        navigation.navigate('Welcome');
      }
    });

    // Start listening to logs
    LogcatModule.startListening()
      .then((message: string) => {
        console.log(`DebriefScreen: ${message}`);
        // Update the listener start time **after** starting to listen
        listenerStartTimeRef.current = Date.now();
      })
      .catch((error: any) => console.warn(`DebriefScreen: Error starting logcat listener - ${error}`));

    // Cleanup the listener on component unmount
    return () => {
      logcatListener.remove();
      LogcatModule.stopListening()
        .then((message: string) => console.log(`DebriefScreen: ${message}`))
        .catch((error: any) => console.warn(`DebriefScreen: Error stopping logcat listener - ${error}`));
    };
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={commonStyles.title}>Debrief Screen</Text>
      <TextInput
        style={[commonStyles.textInput, styles.debriefInput]}
        multiline
        placeholder="Type your debrief here..."
        placeholderTextColor="#aaa"
        value={debriefText}
        onChangeText={setDebriefText}
        textAlignVertical="top" // Ensures text starts at the top-left
        scrollEnabled
      />
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
});

export default DebriefScreen;
