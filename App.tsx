import React, { useEffect, useCallback, useState, createContext } from 'react';
import { Platform, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import StackNavigator from './src/config/StackNavigator';

export const IntervalContext = createContext<{
  intervals: { [key: string]: number };
  setIntervalForState: (stateName: string, interval: number) => void;
}>({
  intervals: {
    active: 5000,
    spotted: 6000,
    proximity: 7000,
    trigger: 8000,
  },
  setIntervalForState: () => {},
});

const App: React.FC = () => {
  const [_audioPermissionGranted, setAudioPermissionGranted] = useState(false);

  const [intervals, setIntervals] = useState({
    active: 5000,
    spotted: 6000,
    proximity: 7000,
    trigger: 8000,
  });

  const setIntervalForState = (stateName: string, interval: number) => {
    setIntervals((prev) => ({
      ...prev,
      [stateName.toLowerCase()]: interval,
    }));
  };

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
    <IntervalContext.Provider value={{ intervals, setIntervalForState }}>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </IntervalContext.Provider>
  );
};

export default App;
