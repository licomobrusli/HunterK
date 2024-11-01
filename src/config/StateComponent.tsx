import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { containerStyles } from '../styles/containerStyles.ts';
import { textStyles } from '../styles/textStyles';
import { IntervalContext } from '../contexts/SceneProvider';
import usePlaySound from '../config/usePlaySound';

type StateComponentProps = {
  stateName: string;
  interval: number;
  onComplete: () => void; // Callback to notify when repetitions are completed
};

const StateComponent: React.FC<StateComponentProps> = ({ stateName, interval, onComplete }) => {
  const { intervals } = useContext(IntervalContext);
  const currentInterval = intervals[stateName.toLowerCase()] || interval;

  // Use the custom hook to play sound, passing onComplete to trigger state transition on repetitions completion
  usePlaySound(stateName, currentInterval, onComplete);

  return (
    <View style={containerStyles.container}>
      <Text style={textStyles.text1}>{stateName} State</Text>
    </View>
  );
};

export default StateComponent;
