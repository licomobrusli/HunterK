import React, { useState, useContext, useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text, NativeEventEmitter, NativeModules } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import StateComponent from '../config/StateComponent'; // Import the generic StateComponent
import { IntervalContext } from '../contexts/SceneProvider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../config/StackNavigator';

// Import your native module
const { LogcatModule } = NativeModules;

type Props = NativeStackScreenProps<RootStackParamList, 'Active'>;

interface LogcatEvent {
  eventName: string;
  timestamp: number;
}

const ActiveScreen: React.FC<Props> = ({ navigation }) => {
  const { states } = useContext(IntervalContext);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);

  // Ref to keep track of the latest currentStateIndex
  const currentStateIndexRef = useRef(currentStateIndex);

  // Ref to store the listener start time
  const listenerStartTimeRef = useRef<number>(0);

  // Update the ref whenever currentStateIndex changes
  useEffect(() => {
    currentStateIndexRef.current = currentStateIndex;
  }, [currentStateIndex]);

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
        // Update the listener start time **after** starting to listen
        listenerStartTimeRef.current = Date.now();
      })
      .catch((error: any) => console.warn(`ActiveScreen: Error starting logcat listener - ${error}`));

    // Cleanup the listener on component unmount
    return () => {
      logcatListener.remove();
      LogcatModule.stopListening()
        .then((message: string) => console.log(`ActiveScreen: ${message}`))
        .catch((error: any) => console.warn(`ActiveScreen: Error stopping logcat listener - ${error}`));
    };
  }, [states.length]);

  /**
   * Advances the current state index by the specified number of steps.
   * Wraps around if the end of the states array is reached.
   *
   * @param steps Number of states to advance.
   */
  const advanceState = (steps: number) => {
    setCurrentStateIndex((prevIndex) => {
      const newIndex = (prevIndex + steps) % states.length;
      console.log(`ActiveScreen: Advancing ${steps} state(s): ${prevIndex} -> ${newIndex}`);
      return newIndex;
    });
  };

  /**
   * Handles the long press event.
   * If on the first state, navigates back to the Welcome screen.
   * Otherwise, resets to the first state.
   */
  const handleLongPress = () => {
    if (currentStateIndexRef.current === 0) {
      console.log('ActiveScreen: Already on the first state. Navigating back to Welcome screen.');
      navigation.navigate('Welcome');
    } else {
      resetState();
    }
  };

  /**
   * Resets the current state index to the first state.
   */
  const resetState = () => {
    setCurrentStateIndex(0);
    console.log('ActiveScreen: State reset to first state');
  };

  const currentStateName = states[currentStateIndex];

  return (
    <View style={commonStyles.container}>
      {/* Overlay TouchableOpacity to advance state on touch */}
      <TouchableOpacity
        style={commonStyles.fullscreenTouchable}
        onPress={() => advanceState(1)}
        activeOpacity={1} // Set activeOpacity to 1 so it doesn't visually change on touch
      >
        <StateComponent stateName={currentStateName} />
      </TouchableOpacity>

      {/* Abort Button */}
      <TouchableOpacity style={commonStyles.abortButton} onPress={resetState}>
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
