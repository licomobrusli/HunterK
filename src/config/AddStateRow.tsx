import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { containerStyles } from '../styles/containerStyles';
import { buttonStyles } from '../styles/buttonStyles';
import { commonStyles } from '../styles/commonStyles';
import { textStyles } from '../styles/textStyles';
import Save from '../assets/icons/save.svg';

type AddStateRowProps = {
  position: string;
  setPosition: React.Dispatch<React.SetStateAction<string>>;
  stateName: string;
  setStateName: React.Dispatch<React.SetStateAction<string>>;
  onAdd: () => void;
};

const AddStateRow: React.FC<AddStateRowProps> = ({
  position,
  setPosition,
  stateName,
  setStateName,
  onAdd,
}) => {
  return (
    <View style={containerStyles.itemContainer}>
      {/* Position and State Name Section */}
      <View style={containerStyles.containerLeft}>
        <TextInput
          style={buttonStyles.iconButton}
          value={position}
          onChangeText={setPosition}
          keyboardType="numeric"
          maxLength={2}
          placeholder="Pos"
        />

        {/* State Name Input - Fixed Width Label */}
        <TextInput
          style={commonStyles.fixedWidthLabel}
          value={stateName}
          onChangeText={setStateName}
          placeholder="Name state ..."
          placeholderTextColor="#aaa"
          maxLength={20}
        />
      </View>

      {/* Interval, Audio, and Debrief Placeholders with Borders */}
      <View style={containerStyles.containerRight}>
        {/* Time Field Setup */}
        <View style={buttonStyles.timeButton}>
          <TouchableOpacity>
            <Text style={textStyles.text0}>mm:ss</Text>
          </TouchableOpacity>
        </View>

        {/* Audio Placeholder */}
        <View style={buttonStyles.iconButton} />

        {/* Debrief Placeholder */}
        <View style={buttonStyles.iconButton} />

        {/* Save Icon (in place of the Bin icon) */}
        <TouchableOpacity onPress={onAdd}>
          <View style={buttonStyles.iconButton}>
            <Save width={18} height={18} fill="#fff" stroke="#004225" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddStateRow;
