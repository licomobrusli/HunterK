// src/screens/ActiveScreen.tsx
import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import StateComponent from '../config/StateComponent'; // Import the generic StateComponent

const STATES = ['Active', 'Spotted', 'Proximity', 'Trigger'];

const ActiveScreen: React.FC = () => {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);

  const handlePress = () => {
    setCurrentStateIndex((prevIndex) => (prevIndex + 1) % STATES.length);
  };

  const handleAbort = () => {
    setCurrentStateIndex(0); // Reset to the "Active" state (index 0)
  };

  const currentStateName = STATES[currentStateIndex];

  return (
    <View style={styles.container}>
      {/* Render the StateComponent directly */}
      <StateComponent stateName={currentStateName} />

      {/* Overlay TouchableOpacity for handling presses */}
      <TouchableOpacity style={styles.overlay} onPress={handlePress} />

      {/* Abort Button */}
      <TouchableOpacity style={styles.abortButton} onPress={handleAbort}>
        <Text
          style={styles.abortButtonText}
          testID="abortButton"
          accessibilityLabel="abortButton"
        >
          Abort
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActiveScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  abortButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'red',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  abortButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
