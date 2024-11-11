// src/config/RadialOptionsRow.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { containerStyles } from '../styles/containerStyles';
import { buttonStyles } from '../styles/buttonStyles';
import { textStyles } from '../styles/textStyles';

interface RadialOptionsRowProps {
  prompt: string;
  labels: string[];
  selectedOptions: string[];
  onToggleOption: (label: string) => void;
}

const RadialOptionsRow: React.FC<RadialOptionsRowProps> = ({
  prompt,
  labels,
  selectedOptions,
  onToggleOption,
}) => {
  return (
    <View style={containerStyles.itemContainer}>
      {/* Left Container */}
      <View style={containerStyles.containerLeft}>
        {/* Icon Button Placeholder */}
        <View style={buttonStyles.iconButton} />
        {/* Fixed Width Label with Prompt */}
        <Text style={textStyles.text0}>{prompt}</Text>
      </View>

      {/* Right Container with 5 Icon Buttons containing Bouncy Checkboxes */}
      <View style={containerStyles.containerRight}>
        {labels.slice(0, 5).map((label, index) => (
          <View key={index} style={styles.checkboxContainer}>
            <BouncyCheckbox
              isChecked={selectedOptions.includes(label)}
              onPress={() => onToggleOption(label)}
              size={25}
              fillColor="#004225" // Adjust to match your theme
              unFillColor="#FFFFFF"
              text="" // No text as labels are in the labels row
              iconStyle={styles.iconStyle}
              innerIconStyle={styles.innerIconStyle}
              useBuiltInState // We'll control the state externally
              disabled={false}
              // Accessibility Props
              accessibilityLabel={`Select ${label}`}
              accessibilityHint={`Toggle selection for ${label}`}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconStyle: {
    borderColor: '#004225',
  },
  innerIconStyle: {
    borderWidth: 2,
  },
  checkboxContainer: {
    marginRight: 5,
  },
});

export default RadialOptionsRow;
