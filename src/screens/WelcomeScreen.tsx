// src/screens/WelcomeScreen.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, NativeEventEmitter, NativeModules } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../config/StackNavigator';
import { containerStyles } from '../styles/containerStyles.ts';
import { textStyles } from '../styles/textStyles';

// Import your native module
const { LogcatModule } = NativeModules;

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

interface LogcatEvent {
  eventName: string;
  timestamp: number;
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  // Ref to store the listener start time
  const listenerStartTimeRef = useRef<number>(0);

  useEffect(() => {
    const logcatEventEmitter = new NativeEventEmitter(LogcatModule);

    const logcatListener = logcatEventEmitter.addListener('LogcatEvent', (event: LogcatEvent) => {
      const { eventName, timestamp } = event;

      // Only process events that occurred after the listener started
      if (timestamp < listenerStartTimeRef.current) {
        console.log(`WelcomeScreen Ignoring old event: ${eventName} at ${timestamp}`);
        return;
      }

      if (eventName === 'long_press') {
        console.log('WelcomeScreen: Long press detected from peripheral device');
        navigation.navigate({ name: 'Active', params: { sceneName: 'defaultScene' } });
      }
      // Handle other events if needed
      // else if (eventName === 'single_press') {
        // console.log('WelcomeScreen: Single press detected');
        // Handle single press logic here
      // } else if (eventName === 'double_press') {
        // console.log('WelcomeScreen: Double press detected');
        // Handle double press logic here
      // }
    });

    // Start listening to logs
    LogcatModule.startListening()
      .then((message: string) => {
        console.log(`WelcomeScreen: ${message}`);
        // Update the listener start time **after** starting to listen
        listenerStartTimeRef.current = Date.now();
      })
      .catch((error: any) => console.warn(`WelcomeScreen: Error starting logcat listener - ${error}`));

    // Cleanup the listener on component unmount
    return () => {
      logcatListener.remove();
      LogcatModule.stopListening()
        .then((message: string) => console.log(`WelcomeScreen: ${message}`))
        .catch((error: any) => console.warn(`WelcomeScreen: Error stopping logcat listener - ${error}`));
    };
  }, [navigation]);

  return (
    <View style={containerStyles.container}>
      <TouchableOpacity onPress={() => navigation.navigate({ name: 'Active', params: { sceneName: 'defaultScene' } })}>
        <Text
          style={textStyles.boldText1}
          testID="welcomeText"
          accessibilityLabel="welcomeText"
        >
          Hunter K
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeScreen;
