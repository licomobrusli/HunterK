// src/config/StateComponent.tsx

import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { containerStyles } from '../styles/containerStyles.ts';
import { textStyles } from '../styles/textStyles';
import { IntervalContext } from '../contexts/SceneProvider';
import usePlaySound from '../config/usePlaySound';

type StateComponentProps = {
  stateName: string;
  interval?: string | null; // Allow interval to be string or null
  onComplete: () => void; // Callback to notify when repetitions are completed
};

// Function to parse "mm:ss" format to milliseconds
const parseInterval = (intervalStr: string | number | null): number | null => {
  if (intervalStr === null || intervalStr === undefined) {
    return null;
  }

  if (typeof intervalStr === 'number') {
    // If it's already a number, return it directly
    return intervalStr;
  }

  // Now intervalStr is a string
  const [minutes, seconds] = intervalStr.split(':').map(Number);
  if (isNaN(minutes) || isNaN(seconds)) {
    return null;
  }
  return (minutes * 60 + seconds) * 1000;
};

const StateComponent: React.FC<StateComponentProps> = ({
  stateName,
  interval,
  onComplete,
}) => {
  const { intervals } = useContext(IntervalContext);
  const stateIntervalStr = intervals[stateName.toLowerCase()];

  // Parse state interval and fallback to component's interval prop
  const currentInterval =
    parseInterval(stateIntervalStr) || parseInterval(interval || null);

  // Use the custom hook to play sound, passing onComplete to trigger state transition on repetitions completion
  usePlaySound(stateName, currentInterval, onComplete);

  return (
    <View style={containerStyles.container}>
      <Text style={textStyles.text1}>{stateName} State</Text>
    </View>
  );
};

export default StateComponent;
