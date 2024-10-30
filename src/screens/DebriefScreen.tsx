// src/screens/DebriefScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import RNFS from 'react-native-fs';
import { commonStyles } from '../styles/commonStyles';
import DebriefComponent from '../config/debrief/DebriefComponent';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../config/StackNavigator';
import { Debriefing } from '../types/Debriefing';

type DebriefScreenProps = NativeStackScreenProps<RootStackParamList, 'Debrief'>;

const DebriefScreen: React.FC<DebriefScreenProps> = ({ navigation, route }) => {
  const { debriefName } = route.params || {};
  const [currentDebriefing, setCurrentDebriefing] = useState<Debriefing | null>(null);

  const handleDebriefComplete = useCallback(
    (responses: { [key: string]: any }) => {
      console.log('DebriefScreen: Debriefing complete with responses:', responses);
      setCurrentDebriefing(null);
      navigation.replace('Welcome');
    },
    [navigation]
  );

  useEffect(() => {
    if (debriefName) {
      const debriefPath = `${RNFS.DocumentDirectoryPath}/debriefs/${debriefName}`;
      RNFS.readFile(debriefPath, 'utf8')
        .then((data) => {
          try {
            const debriefing = JSON.parse(data) as Debriefing;
            setCurrentDebriefing(debriefing);
          } catch (parseError) {
            console.error('Failed to parse debrief JSON:', parseError);
            navigation.replace('Welcome');
          }
        })
        .catch((error) => {
          console.error('Failed to load debrief:', error);
          navigation.replace('Welcome');
        });
    } else {
      navigation.replace('Welcome');
    }
  }, [debriefName, navigation]);

  console.log('DebriefScreen: currentDebriefing:', currentDebriefing);

  return (
    <View style={commonStyles.container}>
      {currentDebriefing ? (
        <DebriefComponent debriefing={currentDebriefing} onComplete={handleDebriefComplete} />
      ) : (
        <Text style={commonStyles.text}>Loading debrief...</Text>
      )}
    </View>
  );
};

export default DebriefScreen;
