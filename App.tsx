import React, { useEffect, useCallback, useState } from 'react';
import { Platform, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import StackNavigator from './src/config/StackNavigator';

const App: React.FC = () => {
  const [_audioPermissionGranted, setAudioPermissionGranted] = useState(false);

  const requestAudioPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const audioResult = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
        handlePermissionResult(audioResult);
      }
    } catch (error) {
      console.warn('Permission request failed', error);
    }
  }, []);

  const handlePermissionResult = (result: string) => {
    if (result === RESULTS.GRANTED) {
      console.log('Audio recording permission granted');
      setAudioPermissionGranted(true);
    } else if (result === RESULTS.DENIED) {
      console.log('Audio recording permission not granted');
      Alert.alert('Permission Denied', 'Audio recording permission is needed for the app to function properly.');
    } else if (result === RESULTS.BLOCKED) {
      console.log('Audio recording permission blocked');
      Alert.alert(
        'Permission Blocked',
        'Audio recording permission is blocked. Please enable it from settings.',
        [
          { text: 'Open Settings', onPress: () => openSettings().catch(() => console.warn('Cannot open settings')) },
        ]
      );
    }
  };

  const checkPermission = useCallback(async () => {
    const audioResult = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
    if (audioResult !== RESULTS.GRANTED) {
      requestAudioPermission();
    }
  }, [requestAudioPermission]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
};

export default App;
