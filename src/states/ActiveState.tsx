// ActiveState.tsx
import React, { useContext, useEffect } from 'react';
import { View, Text } from 'react-native';
import usePlaySound from '../config/usePlaySound';
import { commonStyles } from '../styles/commonStyles';
import { IntervalContext } from '../contexts/SceneProvider'; // Adjust the path as necessary

const ActiveState: React.FC = () => {
  const { intervals } = useContext(IntervalContext);
  const intervalDuration = intervals.active || 5000; // Fallback to 5000ms if undefined

  useEffect(() => {
    console.log(`ActiveState Interval Duration: ${intervalDuration}ms`);
  }, [intervalDuration]);

  usePlaySound('Active', intervalDuration);

  return (
    <View style={commonStyles.container}>
      <Text
        style={commonStyles.text}
        testID="stateText"
        accessibilityLabel="stateText"
      >
        Active
      </Text>
    </View>
  );
};

export default ActiveState;
