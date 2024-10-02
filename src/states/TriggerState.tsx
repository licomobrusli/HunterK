// TriggerState.tsx
import React from 'react';
import { View, Text } from 'react-native';
import usePlaySound from '../config/usePlaySound';
import { commonStyles } from '../styles/commonStyles';

const TriggerState: React.FC = () => {
  usePlaySound('Trigger', 5000);

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.text}>Trigger</Text>
    </View>
  );
};

export default TriggerState;
