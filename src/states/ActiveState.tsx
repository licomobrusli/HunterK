// ActiveState.tsx
import React from 'react';
import { View, Text } from 'react-native';
import usePlaySound from '../config/usePlaySound';
import { commonStyles } from '../styles/commonStyles';

const ActiveState: React.FC = () => {
  usePlaySound('Active', 5000);

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.text}>Active</Text>
    </View>
  );
};

export default ActiveState;
