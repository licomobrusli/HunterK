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
      // Add iOS permissions if needed
    } catch (error) {
      console.warn('Permission request failed', error);
    }
  }, [handlePermissionResult]);


  const requestBluetoothPermissions = useCallback(async () => {
    try {
        if (Platform.OS === 'android') {
            const bluetoothScanResult = await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
            const bluetoothConnectResult = await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);

            if (bluetoothScanResult === RESULTS.GRANTED && bluetoothConnectResult === RESULTS.GRANTED) {
                console.log('Bluetooth permissions granted');
            } else {
                console.log('Bluetooth permissions not granted');
            }
        }
    } catch (error) {
        console.warn('Bluetooth permission request failed', error);
    }
}, []);

useEffect(() => {
    // Call the function to request Bluetooth permissions along with audio permissions
    requestBluetoothPermissions();
}, [requestBluetoothPermissions]);


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
