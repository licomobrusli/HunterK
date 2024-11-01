// src/screens/ActiveScreen.tsx

import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { TouchableOpacity, View, Text, NativeEventEmitter, NativeModules } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { textStyles } from '../styles/textStyles';
import StateComponent from '../config/StateComponent';
import { IntervalContext } from '../contexts/SceneProvider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../config/StackNavigator';
import TrackPlayer from 'react-native-track-player';
import RNFS from 'react-native-fs';
import { Journey, StateLog } from '../types/Journey';
import { containerStyles } from '../styles/containerStyles.ts';
import { buttonStyles } from '../styles/buttonStyles.ts';

const { LogcatModule } = NativeModules;

type Props = NativeStackScreenProps<RootStackParamList, 'Active'>;

interface LogcatEvent {
  eventName: string;
  timestamp: number;
}

const ActiveScreen: React.FC<Props> = ({ navigation, route }) => {
  const { states, selectedDebriefs } = useContext(IntervalContext);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  const listenerStartTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Journey-related state
  const [journeyId] = useState<string>(`journey_${Date.now()}`);
  const [journeyStartTime] = useState<number>(Date.now());
  const [stateLogs, setStateLogs] = useState<StateLog[]>([]);
  const currentStateStartTimeRef = useRef<number>(Date.now());

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
      .catch((error: any) =>
        console.warn(`ActiveScreen: Error stopping logcat listener - ${error}`)
      );
  };

  // Helper function to find the assigned debrief
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

  // Function to advance the state
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
          console.log('ActiveScreen: Reached the end of states.');
          setIsNavigating(true);
          stopAudioAndCleanup();

          const debriefToShow = findAssignedDebrief(prevIndex);

          if (debriefToShow) {
            navigation.replace('Debrief', {
              debriefName: debriefToShow,
              journeyId,
              journeyStartTime,
              stateLogs,
            });
          } else {
            const journeyEndTime = Date.now();
            const journeyDuration = journeyEndTime - journeyStartTime;

            const journeyData: Journey = {
              id: journeyId,
              sceneName: route.params?.sceneName || 'Unknown Scene',
              startTime: journeyStartTime,
              endTime: journeyEndTime,
              duration: journeyDuration,
              stateLogs: [...stateLogs],
            };

            saveJourneyData(journeyData);
            navigation.replace('Welcome');
          }

          return prevIndex;
        } else {
          const wrappedIndex = newIndex % states.length;
          console.log(`ActiveScreen: Advancing ${steps} state(s): ${prevIndex} -> ${wrappedIndex}`);
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
      route.params?.sceneName,
    ]
  );

  const handleLongPress = useCallback(() => {
    console.log('ActiveScreen: Long press detected. Triggering abort.');
    if (!isNavigating) {
      setIsNavigating(true);
      stopAudioAndCleanup();

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

      const debriefToShow = findAssignedDebrief(currentStateIndex);

      if (debriefToShow) {
        navigation.replace('Debrief', {
          debriefName: debriefToShow,
          journeyId,
          journeyStartTime,
          stateLogs,
        });
      } else {
        const journeyEndTime = Date.now();
        const journeyDuration = journeyEndTime - journeyStartTime;

        const journeyData: Journey = {
          id: journeyId,
          sceneName: route.params?.sceneName || 'Unknown Scene',
          startTime: journeyStartTime,
          endTime: journeyEndTime,
          duration: journeyDuration,
          stateLogs: [...stateLogs],
        };

        saveJourneyData(journeyData);
        setCurrentStateIndex(0);
        setIsNavigating(false);
        console.log('ActiveScreen: Resetting to initial active state.');
      }
    }
  }, [
    isNavigating,
    navigation,
    currentStateIndex,
    findAssignedDebrief,
    states,
    journeyId,
    journeyStartTime,
    stateLogs,
    route.params?.sceneName,
  ]);

  const saveJourneyData = async (journeyData: Journey) => {
    const journeyDir = `${RNFS.DocumentDirectoryPath}/journeys`;
    const journeyPath = `${journeyDir}/${journeyData.id}.json`;

    try {
      const dirExists = await RNFS.exists(journeyDir);
      if (!dirExists) {
        await RNFS.mkdir(journeyDir);
      }

      await RNFS.writeFile(journeyPath, JSON.stringify(journeyData), 'utf8');
      console.log(`ActiveScreen: Journey data saved to ${journeyPath}`);
    } catch (error) {
      console.error('ActiveScreen: Error saving journey data', error);
    }
  };

  useEffect(() => {
    const logcatEventEmitter = new NativeEventEmitter(LogcatModule);
    const logcatListener = logcatEventEmitter.addListener('LogcatEvent', (event: LogcatEvent) => {
      const { eventName, timestamp } = event;

      if (timestamp < listenerStartTimeRef.current) {
        console.log(`ActiveScreen: Ignoring old event: ${eventName} at ${timestamp}`);
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
  }, [advanceState, handleLongPress]);

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
