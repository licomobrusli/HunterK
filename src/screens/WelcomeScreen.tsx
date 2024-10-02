// WelcomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../config/StackNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Active')}>
        <Text style={styles.text}>Hunter K</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#08591C', // British Racing Green
  },
  text: {
    fontSize: 48,
    fontWeight: 'bold',
  },
});
