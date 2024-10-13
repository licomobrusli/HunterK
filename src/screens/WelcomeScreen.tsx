import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, NativeEventEmitter, NativeModules } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../config/StackNavigator';
import { commonStyles } from '../styles/commonStyles';

const { SpenModule } = NativeModules;
const spenEventEmitter = new NativeEventEmitter(SpenModule);

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const handleButtonPress = () => {
      console.log('S Pen Button Press Detected'); // Log for debugging
      navigation.navigate('Active');
    };

    const subscription = spenEventEmitter.addListener('onButtonPress', handleButtonPress);

    SpenModule.connect((result: string) => {
      if (result.includes('Connected')) {
        console.log(result);
        // Optionally start motion tracking if needed
        SpenModule.startMotionTracking();
      } else {
        console.warn(result);
      }
    });

    return () => {
      subscription.remove();
      SpenModule.disconnect();
    };
  }, [navigation]);

  return (
    <View style={commonStyles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Active')}>
        <Text
          style={commonStyles.text}
          testID="welcomeText"
          accessibilityLabel="welcomeText"
        >
          Hunter K
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeScreen;
