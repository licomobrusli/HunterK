// src/components/ElementRow.tsx

import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { DebriefElement, DebriefElementType } from '../types/Debriefing';
import Bin from '../assets/icons/bin.svg';
import { containerStyles } from '../styles/containerStyles';
import { textStyles } from '../styles/textStyles';
import { buttonStyles } from '../styles/buttonStyles';
import { commonStyles } from '../styles/commonStyles';

interface ElementRowProps {
  element: DebriefElement;
  index: number;
  onRemove: () => void;
}

const ElementRow: React.FC<ElementRowProps> = ({ element, onRemove }) => {
  return (
    <View style={containerStyles.itemContainer}>
      <View style={containerStyles.containerLeft}>
        <View style={buttonStyles.iconButton} />
        <TextInput
            style={commonStyles.fixedWidthLabel}
            value={element.prompt}
            maxLength={100}
          />
      </View>
      <View style={containerStyles.containerRight}>
        {/* Element Type Display */}
        <View style={buttonStyles.timeButton}>
          <Text style={textStyles.text0}>{capitalizeFirstLetter(element.type)}</Text>
        </View>
        {/* First Icon Button: Shows number of radial options if Radials */}
        {element.type === DebriefElementType.Radials && element.options && (
          <View style={buttonStyles.iconButton}>
            <Text style={textStyles.text0}>{element.options.length}</Text>
          </View>
        )}
        {/* Second Icon Button: Reserved for future use */}
        <View style={buttonStyles.iconButton} />
        {/* Remove Icon Button */}
        <TouchableOpacity onPress={onRemove} style={buttonStyles.iconButton}>
          <Bin width={18} height={18} fill="#fff" stroke="#004225" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export default ElementRow;
