// src/config/RadialLabelsRow.tsx

import React from 'react';
import { View, Text } from 'react-native';
import { containerStyles } from '../styles/containerStyles';
import { buttonStyles } from '../styles/buttonStyles';
import { textStyles } from '../styles/textStyles';
import { commonStyles } from '../styles/commonStyles';

interface RadialLabelsRowProps {
  labels: string[];
}

const RadialLabelsRow: React.FC<RadialLabelsRowProps> = ({ labels }) => {
  return (
    <View style={containerStyles.itemContainer}>
      {/* Left Container */}
      <View style={containerStyles.containerLeft}>
        {/* Icon Button Placeholder */}
        <View style={buttonStyles.iconButton} />
        {/* Fixed Width Label */}
        <View style={commonStyles.fixedWidthLabel}>
          <Text style={textStyles.text0}>Labels</Text>
        </View>
      </View>

      {/* Right Container with 5 Icon Buttons */}
      <View style={containerStyles.containerRight}>
        {labels.slice(0, 5).map((label, index) => (
          <View key={index} style={buttonStyles.iconButton}>
            <Text style={textStyles.text0}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default RadialLabelsRow;
