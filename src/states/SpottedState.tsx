// SpottedState.tsx
import React from 'react';
import { View, Text } from 'react-native';
import usePlaySound from '../config/usePlaySound';
import { commonStyles } from '../styles/commonStyles';

const SpottedState: React.FC = () => {
  usePlaySound('Spotted', 5000);

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.text}>Spotted</Text>
    </View>
  );
};

export default SpottedState;
