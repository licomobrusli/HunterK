// ActiveScreen.tsx
import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

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
    <TouchableOpacity style={styles.touchable} onPress={handlePress}>
      {renderStateComponent()}
    </TouchableOpacity>
  );
};

export default ActiveScreen;

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    backgroundColor: '#08591C', // British Racing Green
  },
});
