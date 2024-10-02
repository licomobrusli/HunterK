// ProximityState.tsx
import React from 'react';
import { View, Text } from 'react-native';
import usePlaySound from '../config/usePlaySound';
import { commonStyles } from '../styles/commonStyles';

const ProximityState: React.FC = () => {
  usePlaySound('Proximity', 5000);

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.text}>Proximity</Text>
    </View>
  );
};

export default ProximityState;
