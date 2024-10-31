// src/screens/DebriefScreen.tsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text } from 'react-native';
import RNFS from 'react-native-fs';
import { commonStyles } from '../styles/commonStyles';
import DebriefComponent from '../config/debrief/DebriefComponent';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../config/StackNavigator';
import { Debriefing } from '../types/Debriefing';
import { Journey } from '../types/Journey';

type DebriefScreenProps = NativeStackScreenProps<RootStackParamList, 'Debrief'>;

const DebriefScreen: React.FC<DebriefScreenProps> = ({ navigation, route }) => {
  const { debriefName, journeyId, journeyStartTime, stateLogs } = route.params || {};
  const [currentDebriefing, setCurrentDebriefing] = useState<Debriefing | null>(null);

  const debriefStartTimeRef = useRef<number>(Date.now());

  const handleDebriefComplete = useCallback(
    (responses: { [key: string]: any }) => {
      console.log('DebriefScreen: Debriefing complete with responses:', responses);

      const debriefEndTime = Date.now();
      const debriefDuration = debriefEndTime - debriefStartTimeRef.current;

      const journeyEndTime = debriefEndTime;
      const journeyDuration = journeyStartTime ? journeyEndTime - journeyStartTime : 0;

      const journeyData: Journey = {
        id: journeyId!,
        sceneName: 'Your Scene Name',
        startTime: journeyStartTime!,
        endTime: journeyEndTime,
        duration: journeyDuration,
        stateLogs: stateLogs || [],
        debriefLog: {
          debriefName: debriefName!,
          startTime: debriefStartTimeRef.current,
          endTime: debriefEndTime,
          duration: debriefDuration,
          responses: responses,
        },
      };

      const journeyDir = `${RNFS.DocumentDirectoryPath}/journeys`;
      const journeyPath = `${journeyDir}/${journeyData.id}.json`;

      RNFS.mkdir(journeyDir)
        .then(() => {
          return RNFS.writeFile(journeyPath, JSON.stringify(journeyData), 'utf8');
        })
        .then(() => {
          console.log(`DebriefScreen: Journey data saved to ${journeyPath}`);
        })
        .catch((error) => {
          console.error('DebriefScreen: Error saving journey data', error);
        });

      setCurrentDebriefing(null);
      navigation.replace('Welcome');
    },
    [navigation, debriefName, journeyId, journeyStartTime, stateLogs]
  );

  useEffect(() => {
    debriefStartTimeRef.current = Date.now();

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
