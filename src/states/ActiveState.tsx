import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import usePlaySound from '../config/usePlaySound';
import { commonStyles } from '../styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ActiveState: React.FC = () => {
  const [intervalDuration, setIntervalDuration] = useState<number>(5000); // Default interval

  useEffect(() => {
    const loadInterval = async () => {
      try {
        const storedInterval = await AsyncStorage.getItem('@interval_active');
        if (storedInterval !== null) {
          setIntervalDuration(parseInt(storedInterval, 10));
        }
      } catch (error) {
        console.error('Failed to load interval:', error);
      }
    };

    loadInterval();
  }, []);

  usePlaySound('Active', intervalDuration);

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.text}>Active</Text>
    </View>
  );
};

export default ActiveState;
