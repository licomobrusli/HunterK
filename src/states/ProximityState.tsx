// ProximityState.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import usePlaySound from '../config/usePlaySound'; // Adjust path if needed

const ProximityState: React.FC = () => {
  usePlaySound('Proximity', 5000);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Proximity</Text>
    </View>
  );
};

export default ProximityState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 48,
    fontWeight: 'bold',
  },
});
