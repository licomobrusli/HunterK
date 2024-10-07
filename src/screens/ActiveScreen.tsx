// ActiveScreen.tsx
import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';

import ActiveState from '../states/ActiveState';
import SpottedState from '../states/SpottedState';
import ProximityState from '../states/ProximityState';
import TriggerState from '../states/TriggerState';

const STATES = ['Active', 'Spotted', 'Proximity', 'Trigger'];

const ActiveScreen: React.FC = () => {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);

  const handlePress = () => {
    setCurrentStateIndex((prevIndex) => (prevIndex + 1) % STATES.length);
  };

  const handleAbort = () => {
    setCurrentStateIndex(0); // Reset to the "Active" state (index 0)
  };

  const renderStateComponent = () => {
    switch (STATES[currentStateIndex]) {
      case 'Active':
        return <ActiveState />;
      case 'Spotted':
        return <SpottedState />;
      case 'Proximity':
        return <ProximityState />;
      case 'Trigger':
        return <TriggerState />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Render the state component without wrapping it in TouchableOpacity */}
      {renderStateComponent()}

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
