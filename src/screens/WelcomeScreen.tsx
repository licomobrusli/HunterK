// WelcomeScreen.tsx
import { commonStyles } from '../styles/commonStyles';

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../config/StackNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={commonStyles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Active')}>
        <Text style={commonStyles.text}
        testID="welcomeText"
        accessibilityLabel="welcomeText">Hunter K</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeScreen;
