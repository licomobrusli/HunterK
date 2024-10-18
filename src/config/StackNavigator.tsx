// src/config/StackNavigator.tsx
import { commonStyles } from '../styles/commonStyles';

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import ActiveScreen from '../screens/ActiveScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Active: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  const renderSettingsIcon = (navigation: NativeStackNavigationProp<RootStackParamList>) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Settings')}
      style={commonStyles.headerIcon}
    >
      <Icon name="settings" size={24} color="#000" />
    </TouchableOpacity>
  );

  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={({ navigation }) => ({
          headerRight: () => renderSettingsIcon(navigation),
          headerTitle: '',
          headerTransparent: true,
        })}
      />
      <Stack.Screen
        name="Active"
        component={ActiveScreen}
        options={({ navigation }) => ({
          headerRight: () => renderSettingsIcon(navigation),
          headerTitle: '',
          headerTransparent: true,
        })}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: 'Settings',
        }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
