import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { TouchableOpacity, View, Text, NativeEventEmitter, NativeModules } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { textStyles } from '../styles/textStyles';
import StateComponent from '../config/StateComponent';
import { IntervalContext } from '../contexts/SceneProvider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../config/StackNavigator';
import TrackPlayer from 'react-native-track-player';
import { StateLog } from '../types/Journey';
import { containerStyles } from '../styles/containerStyles';
import { buttonStyles } from '../styles/buttonStyles';
import { CommonActions } from '@react-navigation/native'; // Import CommonActions

const { LogcatModule } = NativeModules;

type Props = NativeStackScreenProps<RootStackParamList, 'Active'>;

interface LogcatEvent {
  eventName: string;
  timestamp: number;
}

const ActiveScreen: React.FC<Props> = ({ navigation }) => {
  const { states, selectedDebriefs } = useContext(IntervalContext);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  const listenerStartTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [journeyId] = useState<string>(`journey_${Date.now()}`);
  const [journeyStartTime] = useState<number>(Date.now());
  const [stateLogs, setStateLogs] = useState<StateLog[]>([]);
  const currentStateStartTimeRef = useRef<number>(Date.now());

  const stopAudioAndCleanup = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      await TrackPlayer.stop();
    } catch (error) {
      console.error('ActiveScreen: Error stopping audio', error);
    }

    LogcatModule.stopListening()
      .then((message: string) => console.log(`ActiveScreen: ${message}`))
      .catch((error: any) => console.warn(`ActiveScreen: Error stopping logcat listener - ${error}`));
  };

  const findAssignedDebrief = useCallback(
    (index: number): string | null => {
      for (let i = index; i >= 0; i--) {
        const stateName = states[i].toLowerCase();
        const debrief = selectedDebriefs[stateName];
        if (debrief) {
          return debrief;
        }
      }
      return null;
    },
    [states, selectedDebriefs]
  );

  const advanceState = useCallback(
    (steps: number) => {
      if (isNavigating) {
        return;
      }

      const currentStateEndTime = Date.now();
      const currentStateDuration = currentStateEndTime - currentStateStartTimeRef.current;
      const currentStateName = states[currentStateIndex];

      setStateLogs((prevLogs) => [
        ...prevLogs,
        {
          stateName: currentStateName,
          startTime: currentStateStartTimeRef.current,
          endTime: currentStateEndTime,
          duration: currentStateDuration,
        },
      ]);

      currentStateStartTimeRef.current = currentStateEndTime;

      setCurrentStateIndex((prevIndex) => {
        const newIndex = prevIndex + steps;

        if (newIndex >= states.length) {
          setIsNavigating(true);
          stopAudioAndCleanup();

          const debriefToShow = findAssignedDebrief(prevIndex);

          if (debriefToShow) {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'Debrief',
                    params: {
                      debriefName: debriefToShow,
                      journeyId,
                      journeyStartTime,
                      stateLogs,
                    },
                  },
                ],
              })
            );
          } else {
            navigation.replace('Welcome');
          }

          return prevIndex;
        } else {
          const wrappedIndex = newIndex % states.length;
          return wrappedIndex;
        }
      });
    },
    [
      isNavigating,
      states,
      currentStateIndex,
      navigation,
      findAssignedDebrief,
      journeyId,
      journeyStartTime,
      stateLogs,
    ]
  );

  const handleLongPress = useCallback(() => {
    if (!isNavigating) {
      setIsNavigating(true);
      stopAudioAndCleanup();
      navigation.replace('Welcome');
    }
  }, [isNavigating, navigation]);

  useEffect(() => {
    const logcatEventEmitter = new NativeEventEmitter(LogcatModule);
    const logcatListener = logcatEventEmitter.addListener('LogcatEvent', (event: LogcatEvent) => {
      const { eventName, timestamp } = event;

      if (timestamp < listenerStartTimeRef.current) {
        return;
      }

      if (eventName === 'single_press') {
        advanceState(1);
      } else if (eventName === 'double_press') {
        advanceState(2);
      } else if (eventName === 'long_press') {
        handleLongPress();
      }
    });

    LogcatModule.startListening()
      .then(() => {
        listenerStartTimeRef.current = Date.now();
      })
      .catch((error: any) => console.warn(`ActiveScreen: Error starting logcat listener - ${error}`));

    return () => {
      logcatListener.remove();
      stopAudioAndCleanup();
    };
  }, [advanceState, handleLongPress]);

  useEffect(() => {
    const unsubscribeBlur = navigation.addListener('blur', () => {
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
  const interval = 5000;

  return (
    <View style={containerStyles.container}>
      <TouchableOpacity
        style={commonStyles.fullscreenTouchable}
        onPress={() => advanceState(1)}
        activeOpacity={1}
      >
        <StateComponent
          stateName={currentStateName}
          interval={interval}
          onComplete={() => advanceState(1)}
        />
      </TouchableOpacity>

      <View style={containerStyles.containerBottom}>
        <TouchableOpacity style={buttonStyles.button} onPress={handleLongPress}>
          <Text style={textStyles.text0}>Abort</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ActiveScreen;
