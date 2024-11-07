import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { buttonStyles } from '../styles/buttonStyles';
import { containerStyles } from '../styles/containerStyles';

type AudioItemRowProps = {
  itemName: string;
  onPress: () => void;
};

const AudioItemRow: React.FC<AudioItemRowProps> = ({ itemName, onPress }) => {
  return (
    <View style={containerStyles.itemContainer}>
      <View style={containerStyles.containerLeft}>
        {/* Empty Button Icon */}
        <TouchableOpacity style={buttonStyles.iconButton} onPress={onPress}>
          {/* Icon can be added here in the future */}
        </TouchableOpacity>

        {/* Audio Item Name */}
        <Text style={commonStyles.fixedWidthLabel}>{itemName}</Text>
      </View>
    </View>
  );
};

export default AudioItemRow;
