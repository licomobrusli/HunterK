// SpottedState.tsx
import React, { useContext, useEffect } from 'react';
import { View, Text } from 'react-native';
import usePlaySound from '../config/usePlaySound';
import { commonStyles } from '../styles/commonStyles';
import { IntervalContext } from '../contexts/SceneProvider'; // Adjust the path as necessary

const SpottedState: React.FC = () => {
  const { intervals } = useContext(IntervalContext);
  const intervalDuration = intervals.spotted || 6000; // Fallback to 6000ms if undefined

  useEffect(() => {
    console.log(`SpottedState Interval Duration: ${intervalDuration}ms`);
  }, [intervalDuration]);

  usePlaySound('Spotted', intervalDuration);

  return (
    <View style={commonStyles.container}>
      <Text
        style={commonStyles.text}
        testID="stateText"
        accessibilityLabel="stateText"
      >
        Spotted
      </Text>
    </View>
  );
};

export default SpottedState;
