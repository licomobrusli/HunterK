import React, { useEffect, useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import StackNavigator from './src/config/StackNavigator';
import SceneProvider from './src/contexts/SceneProvider';
import FlashMessage from 'react-native-flash-message';

const App: React.FC = () => {
  const [_audioPermissionGranted, setAudioPermissionGranted] = useState(false);

  // Permission handling remains in App.tsx
  const handlePermissionResult = useCallback((result: string) => {
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
  }, []);

  const requestAudioPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const audioResult = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
        handlePermissionResult(audioResult);
      }
    } catch (error) {
      console.warn('Permission request failed', error);
    }
  }, [handlePermissionResult]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) {return;}

      const audioResult = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
      if (audioResult === RESULTS.GRANTED) {
        console.log('Audio recording permission already granted');
        if (isMounted) {
          setAudioPermissionGranted(true);
        }
      } else {
        requestAudioPermission();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [requestAudioPermission]);

  return (
    <SceneProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
      <FlashMessage position="top" />
    </SceneProvider>
  );
};

export default App;
