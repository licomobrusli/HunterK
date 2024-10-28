import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { TouchableOpacity, View, Text, NativeEventEmitter, NativeModules } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import StateComponent from '../config/StateComponent';
import { IntervalContext } from '../contexts/SceneProvider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../config/StackNavigator';

// Import the audio player module and native logcat module
import TrackPlayer from 'react-native-track-player';
const { LogcatModule } = NativeModules;

type Props = NativeStackScreenProps<RootStackParamList, 'Active'>;

interface LogcatEvent {
  eventName: string;
  timestamp: number;
}

const ActiveScreen: React.FC<Props> = ({ navigation }) => {
  const { states } = useContext(IntervalContext);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  const listenerStartTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopAudioAndCleanup = async () => {
    if (intervalRef.current) {
      console.log('ActiveScreen: Clearing interval');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      console.log('ActiveScreen: Stopping audio playback');
      await TrackPlayer.stop();
    } catch (error) {
      console.error('ActiveScreen: Error stopping audio', error);
    }

    LogcatModule.stopListening()
      .then((message: string) => console.log(`ActiveScreen: ${message}`))
      .catch((error: any) => console.warn(`ActiveScreen: Error stopping logcat listener - ${error}`));
  };

  const advanceState = useCallback((steps: number) => {
    if (isNavigating) {return;}

    setCurrentStateIndex((prevIndex) => {
      const newIndex = prevIndex + steps;

      if (newIndex >= states.length) {
        console.log('ActiveScreen: Reached the end of states. Navigating to DebriefScreen.');
        setIsNavigating(true);
        stopAudioAndCleanup();
        navigation.replace('Debrief');
        return prevIndex;
      } else {
        const wrappedIndex = newIndex % states.length;
        console.log(`ActiveScreen: Advancing ${steps} state(s): ${prevIndex} -> ${wrappedIndex}`);
        return wrappedIndex;
      }
    });
  }, [isNavigating, states.length, navigation]);

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

    LogcatModule.startListening()
      .then((message: string) => {
        console.log(`ActiveScreen: ${message}`);
        listenerStartTimeRef.current = Date.now();
      })
      .catch((error: any) => console.warn(`ActiveScreen: Error starting logcat listener - ${error}`));

    return () => {
      logcatListener.remove();
      stopAudioAndCleanup();
    };
  }, [states.length, advanceState, handleLongPress]);

  useEffect(() => {
    const unsubscribeBlur = navigation.addListener('blur', () => {
      console.log('ActiveScreen: Screen blurred, performing cleanup');
      stopAudioAndCleanup();
    });

    return () => {
      unsubscribeBlur();
    };
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setIsNavigating(false);
    });

    return unsubscribe;
  }, [navigation]);

  const currentStateName = states[currentStateIndex];
  const interval = 5000; // Default interval

  return (
    <View style={commonStyles.container}>
      <TouchableOpacity
        style={commonStyles.fullscreenTouchable}
        onPress={() => advanceState(1)}
        activeOpacity={1}
      >
        {/* Pass the onComplete function to StateComponent to advance the state when repetitions complete */}
        <StateComponent
          stateName={currentStateName}
          interval={interval}
          onComplete={() => advanceState(1)}
        />
      </TouchableOpacity>

      <TouchableOpacity style={commonStyles.abortButton} onPress={handleLongPress}>
        <Text style={commonStyles.abortButtonText}>Abort</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActiveScreen;
