// src/config/StackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import ActiveScreen from '../screens/ActiveScreen';
import DebriefScreen from '../screens/DebriefScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { containerStyles } from '../styles/containerStyles.ts';

export type RootStackParamList = {
  Welcome: undefined;
  Active: { sceneName: string };
  Debrief: {
    debriefName?: string;
    journeyId?: string;
    journeyStartTime?: number;
    stateLogs?: any[]
  };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  const renderSettingsIcon = (navigation: NativeStackNavigationProp<RootStackParamList>) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Settings')}
      style={containerStyles.containerRight}
    >
      <Icon name="settings" size={24} color="#fff" />
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
        name="Debrief"
        component={DebriefScreen}
        options={{ title: 'Debrief' }}
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
