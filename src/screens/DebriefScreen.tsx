// src/screens/DebriefScreen.tsx

import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import DebriefComponent from '../config/DebriefComponent'; // Ensure the correct import path
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../config/StackNavigator';
import { Debriefing } from '../types/Debriefing';

type DebriefScreenProps = NativeStackScreenProps<RootStackParamList, 'Debrief'>;

const DebriefScreen: React.FC<DebriefScreenProps> = ({ navigation }) => {
  const [currentDebriefing, setCurrentDebriefing] = useState<Debriefing | null>(null);

  // Sample debriefings
  const promptDebrief: Debriefing = {
    id: 'debrief1',
    name: 'Prompt Debrief',
    elements: [
      {
        id: 'q1',
        type: 'text',
        prompt: 'How did it go?',
      },
    ],
  };

  const passFailDebrief: Debriefing = {
    id: 'debrief2',
    name: 'Pass Fail',
    elements: [
      {
        id: 'q1',
        type: 'multipleChoice',
        prompt: 'Did you complete your tasks?',
        options: ['Pass', 'Fail'],
      },
      {
        id: 'q2',
        type: 'multipleChoice',
        prompt: 'Were you satisfied with the outcome?',
        options: ['Pass', 'Fail'],
      },
      {
        id: 'q3',
        type: 'multipleChoice',
        prompt: 'Would you like to improve something?',
        options: ['Pass', 'Fail'],
      },
    ],
  };

  const handleDebriefComplete = useCallback(() => {
    console.log('DebriefScreen: Debriefing complete');
    // Reset current debriefing
    setCurrentDebriefing(null);
    // Optionally navigate back or to another screen
    navigation.replace('Welcome'); // Replace 'Welcome' with the desired screen
  }, [navigation]);

  const selectDebriefing = (debriefing: Debriefing) => {
    setCurrentDebriefing(debriefing);
  };

  return (
    <View style={commonStyles.container}>
      {!currentDebriefing ? (
        <>
          <Text style={commonStyles.title}>Select Debriefing Type</Text>
          <TouchableOpacity
            style={styles.debriefTypeButton}
            onPress={() => selectDebriefing(promptDebrief)}
          >
            <Text style={styles.debriefTypeButtonText}>{promptDebrief.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.debriefTypeButton}
            onPress={() => selectDebriefing(passFailDebrief)}
          >
            <Text style={styles.debriefTypeButtonText}>{passFailDebrief.name}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <DebriefComponent debriefing={currentDebriefing} onComplete={handleDebriefComplete} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  debriefTypeButton: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  debriefTypeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DebriefScreen;
