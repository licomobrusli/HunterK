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
      <TouchableOpacity style={styles.touchable} onPress={handlePress}>
        {renderStateComponent()}
      </TouchableOpacity>

      {/* Abort Button */}
      <TouchableOpacity style={styles.abortButton} onPress={handleAbort}>
        <Text style={styles.abortButtonText}>Abort</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActiveScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  touchable: {
    flex: 1,
    backgroundColor: '#004225', // British Racing Green
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
