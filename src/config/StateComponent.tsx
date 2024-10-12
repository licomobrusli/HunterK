// src/config/StateComponent.tsx
import { commonStyles } from '../styles/commonStyles';

import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { IntervalContext } from '../contexts/SceneProvider';
import usePlaySound from '../config/usePlaySound';

type StateComponentProps = {
  stateName: string;
};

const StateComponent: React.FC<StateComponentProps> = ({ stateName }) => {
  const { intervals } = useContext(IntervalContext);
  const interval = intervals[stateName.toLowerCase()] || 5000; // Default interval

  // Use the custom hook to play sound based on state
  usePlaySound(stateName, interval);

  return (
    <View style={commonStyles.container}
      testID="stateText"
      accessibilityLabel="stateText">
        <Text style={commonStyles.text}>{stateName} State</Text>
    </View>
  );
};

export default StateComponent;
