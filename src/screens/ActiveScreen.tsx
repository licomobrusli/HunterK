// src/screens/ActiveScreen.tsx
import { commonStyles } from '../styles/commonStyles';

import React, { useState, useContext } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import StateComponent from '../config/StateComponent'; // Import the generic StateComponent
import { IntervalContext } from '../contexts/SceneProvider';

const ActiveScreen: React.FC = () => {
  const { states } = useContext(IntervalContext);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);

  const handlePress = () => {
    setCurrentStateIndex((prevIndex) => (prevIndex + 1) % states.length);
  };

  const handleAbort = () => {
    setCurrentStateIndex(0); // Reset to the "Active" state (index 0)
  };

  const currentStateName = states[currentStateIndex];

  return (
    <View style={commonStyles.container}>
      {/* Render the StateComponent directly */}
      <StateComponent stateName={currentStateName} />

      {/* Overlay TouchableOpacity for handling presses */}
      <TouchableOpacity style={commonStyles.overlay} onPress={handlePress} />

      {/* Abort Button */}
      <TouchableOpacity style={commonStyles.abortButton} onPress={handleAbort}>
        <Text
          style={commonStyles.abortButtonText}
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
