// App.tsx
import React, { useEffect, useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import StackNavigator from './src/config/StackNavigator';
import SceneProvider from './src/contexts/SceneProvider'; // Adjust the path as necessary

const App: React.FC = () => {
  const [_audioPermissionGranted, setAudioPermissionGranted] = useState(false);

  // Permission handling remains in App.tsx
  const requestAudioPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const audioResult = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
        handlePermissionResult(audioResult);
      }
      // Add iOS permissions if needed
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
      // Handle denied permissions without alerts
    } else if (result === RESULTS.BLOCKED) {
      console.log('Audio recording permission blocked');
      // Handle blocked permissions without alerts
    }
  };

  const checkPermission = useCallback(async () => {
    const audioResult = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
    if (audioResult !== RESULTS.GRANTED) {
      requestAudioPermission();
    } else {
      console.log('Audio recording permission already granted');
      setAudioPermissionGranted(true);
    }
  }, [requestAudioPermission]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return (
    <SceneProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </SceneProvider>
  );
};

export default App;
