import React from 'react';
import { View, Text } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { containerStyles } from '../styles/containerStyles';
import { textStyles } from '../styles/textStyles';
import { buttonStyles } from '../styles/buttonStyles';
import { commonStyles } from '../styles/commonStyles';
import { paddingStyles } from '../styles/paddingStyles';

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
        <View style={commonStyles.fixedWidthLabel}>
          <Text style={textStyles.text0}>{prompt}</Text>
        </View>
      </View>

      {/* Right Container with 5 Bouncy Checkboxes */}
      <View style={containerStyles.containerRight}>
        {labels.slice(0, 5).map((label, index) => (
          <View key={index} style={buttonStyles.iconButton}>
            <BouncyCheckbox
              isChecked={selectedOptions.includes(label)}
              onPress={() => onToggleOption(label)}
              size={20} // Adjust size if necessary
              text=""
              style={paddingStyles.padL16}
              useBuiltInState={true}
              disabled={false}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default RadialOptionsRow;
