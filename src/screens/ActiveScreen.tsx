// ActiveScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ActiveScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Active</Text>
    </View>
  );
};

export default ActiveScreen;

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
