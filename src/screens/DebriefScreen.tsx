// src/screens/DebriefScreen.tsx
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import DebriefComponent from '../config/DebriefComponent'; // Ensure the correct import path
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../config/StackNavigator';

type DebriefScreenProps = NativeStackScreenProps<RootStackParamList, 'Debrief'>;

const DebriefScreen: React.FC<DebriefScreenProps> = ({ navigation }) => {
  const [currentDebriefType, setCurrentDebriefType] = useState<string>('General');

  const handleDebriefComplete = useCallback(() => {
    console.log('DebriefScreen: Debriefing complete');
    // Navigate to another screen or perform other actions
    // Replace 'Summary' with a valid screen name in your RootStackParamList
    navigation.replace('Welcome'); // Example navigation
  }, [navigation]);

  return (
    <View style={commonStyles.container}>
      {/* Allow the user to select the type of debriefing */}
      <View style={styles.debriefTypeSelector}>
        <TouchableOpacity
          style={[
            styles.debriefTypeButton,
            currentDebriefType === 'General' && styles.selectedDebriefTypeButton,
          ]}
          onPress={() => setCurrentDebriefType('General')}
        >
          <Text style={styles.debriefTypeButtonText}>General</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.debriefTypeButton,
            currentDebriefType === 'Session' && styles.selectedDebriefTypeButton,
          ]}
          onPress={() => setCurrentDebriefType('Session')}
        >
          <Text style={styles.debriefTypeButtonText}>Session</Text>
        </TouchableOpacity>
        {/* Add more debrief types as needed */}
      </View>

      {/* Render the DebriefComponent based on the selected type */}
      <DebriefComponent debriefType={currentDebriefType} onComplete={handleDebriefComplete} />
    </View>
  );
};

const styles = StyleSheet.create({
  debriefTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  debriefTypeButton: {
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  selectedDebriefTypeButton: {
    backgroundColor: '#4CAF50',
  },
  debriefTypeButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default DebriefScreen;
