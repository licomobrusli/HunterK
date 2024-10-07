// ProximityState.tsx
import React, { useContext, useEffect } from 'react';
import { View, Text } from 'react-native';
import usePlaySound from '../config/usePlaySound';
import { commonStyles } from '../styles/commonStyles';
import { IntervalContext } from '../contexts/SceneProvider'; // Adjust the path as necessary

const ProximityState: React.FC = () => {
  const { intervals } = useContext(IntervalContext);
  const intervalDuration = intervals.proximity || 6000; // Fallback to 6000ms if undefined

  useEffect(() => {
    console.log(`ProximityState Interval Duration: ${intervalDuration}ms`);
  }, [intervalDuration]);

  usePlaySound('Proximity', intervalDuration);

  return (
    <View style={commonStyles.container}>
      <Text
        style={commonStyles.text}
        testID="stateText"
        accessibilityLabel="stateText"
      >
        Proximity
      </Text>
    </View>
  );
};

export default ProximityState;
