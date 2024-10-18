import React, { useEffect, useCallback, useState } from 'react';
import { Platform, NativeEventEmitter, NativeModules } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import StackNavigator from './src/config/StackNavigator';
import SceneProvider from './src/contexts/SceneProvider';
import FlashMessage from 'react-native-flash-message';

const { LogcatModule } = NativeModules;

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
      // Add iOS permissions if needed
    } catch (error) {
      console.warn('Permission request failed', error);
    }
  }, [handlePermissionResult]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;

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

  // Logcat Event Listener for Single and Long Presses
  useEffect(() => {
    const logcatEventEmitter = new NativeEventEmitter(LogcatModule);

    const logcatListener = logcatEventEmitter.addListener('LogcatEvent', (event) => {
      if (event === 'single_press') {
        console.log('Single press detected');
        // Handle single press logic here
      } else if (event === 'long_press') {
        console.log('Long press detected');
        // Handle long press logic here
      } else if (event === 'double_press') {
        console.log('Double press detected');
        // Handle double press logic here
      }
    });

    // Start listening to logs
    LogcatModule.startListening()
      .then((message: string) => console.log(message))
      .catch((error: any) => console.warn('Error starting logcat listener', error));

    return () => {
      logcatListener.remove(); // Cleanup listener on component unmount
    };
  }, []);

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
