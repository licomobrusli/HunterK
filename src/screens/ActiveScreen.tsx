import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { TouchableOpacity, View, Text, NativeEventEmitter, NativeModules } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import StateComponent from '../config/StateComponent'; // Import the generic StateComponent
import { IntervalContext } from '../contexts/SceneProvider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../config/StackNavigator';

// Import your native module
const { LogcatModule } = NativeModules;

// Assume you're using an audio player module like react-native-sound or react-native-track-player
import TrackPlayer from 'react-native-track-player'; // Example for react-native-track-player

type Props = NativeStackScreenProps<RootStackParamList, 'Active'>;

interface LogcatEvent {
  eventName: string;
  timestamp: number;
}

const ActiveScreen: React.FC<Props> = ({ navigation }) => {
  const { states } = useContext(IntervalContext);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false); // Optional flag to prevent multiple navigations

  // Ref to store the listener start time
  const listenerStartTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // Ref to store the interval ID

  // Clean up audio and intervals
  const stopAudioAndCleanup = async () => {
    if (intervalRef.current) {
      console.log('ActiveScreen: Clearing interval');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      console.log('ActiveScreen: Stopping audio playback');
      await TrackPlayer.stop(); // Adjust this according to your audio library
    } catch (error) {
      console.error('ActiveScreen: Error stopping audio', error);
    }

    // Stop listening to logcat events
    LogcatModule.stopListening()
      .then((message: string) => console.log(`ActiveScreen: ${message}`))
      .catch((error: any) => console.warn(`ActiveScreen: Error stopping logcat listener - ${error}`));
  };

  // Wrap advanceState in useCallback to avoid recreating on every render
  const advanceState = useCallback((steps: number) => {
    if (isNavigating) {return;}

    setCurrentStateIndex((prevIndex) => {
      const newIndex = prevIndex + steps;

      if (newIndex >= states.length) {
        console.log('ActiveScreen: Reached the end of states. Navigating to DebriefScreen.');
        setIsNavigating(true);
        stopAudioAndCleanup(); // Ensure cleanup before navigating away
        navigation.replace('Debrief'); // Use replace to remove ActiveScreen from the stack
        return prevIndex; // Optionally, you can reset or keep the current index
      } else {
        const wrappedIndex = newIndex % states.length;
        console.log(`ActiveScreen: Advancing ${steps} state(s): ${prevIndex} -> ${wrappedIndex}`);
        return wrappedIndex;
      }
    });
  }, [isNavigating, states.length, navigation]);

  // Wrap handleLongPress in useCallback
  const handleLongPress = useCallback(() => {
    console.log('ActiveScreen: Long press detected. Triggering abort.');
    if (!isNavigating) {
      setIsNavigating(true);
      stopAudioAndCleanup();
      navigation.replace('Debrief');
    }
  }, [isNavigating, navigation]);

  useEffect(() => {
    const logcatEventEmitter = new NativeEventEmitter(LogcatModule);

    const logcatListener = logcatEventEmitter.addListener('LogcatEvent', (event: LogcatEvent) => {
      const { eventName, timestamp } = event;

      // Only process events that occurred after the listener started
      if (timestamp < listenerStartTimeRef.current) {
        console.log(`ActiveScreen Ignoring old event: ${eventName} at ${timestamp}`);
        return;
      }

      if (eventName === 'single_press') {
        console.log('ActiveScreen: Single press detected from peripheral device');
        advanceState(1);
      } else if (eventName === 'double_press') {
        console.log('ActiveScreen: Double press detected from peripheral device');
        advanceState(2);
      } else if (eventName === 'long_press') {
        console.log('ActiveScreen: Long press detected from peripheral device');
        handleLongPress();
      }
    });

    // Start listening to logs
    LogcatModule.startListening()
      .then((message: string) => {
        console.log(`ActiveScreen: ${message}`);
        listenerStartTimeRef.current = Date.now();
      })
      .catch((error: any) => console.warn(`ActiveScreen: Error starting logcat listener - ${error}`));

    // Cleanup the listener on component unmount or screen navigation
    return () => {
      logcatListener.remove();
      stopAudioAndCleanup();
    };
  }, [states.length, advanceState, handleLongPress]); // Include advanceState and handleLongPress as dependencies

  // Ensure audio and interval cleanup when navigating away
  useEffect(() => {
    const unsubscribeBlur = navigation.addListener('blur', () => {
      console.log('ActiveScreen: Screen blurred, performing cleanup');
      stopAudioAndCleanup();
    });

    return () => {
      unsubscribeBlur();
    };
  }, [navigation]);

  // Reset navigation flag when screen gains focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setIsNavigating(false);
    });

    return unsubscribe;
  }, [navigation]);

  const currentStateName = states[currentStateIndex];

  return (
    <View style={commonStyles.container}>
      {/* Overlay TouchableOpacity to advance state on touch */}
      <TouchableOpacity
        style={commonStyles.fullscreenTouchable}
        onPress={() => advanceState(1)}
        activeOpacity={1}
      >
        <StateComponent stateName={currentStateName} />
      </TouchableOpacity>

      {/* Abort Button */}
      <TouchableOpacity style={commonStyles.abortButton} onPress={handleLongPress}>
        <Text
          style={commonStyles.abortButtonText}
          testID="abortButton"
          accessibilityLabel="abortButton"
        >
          Abort
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActiveScreen;
