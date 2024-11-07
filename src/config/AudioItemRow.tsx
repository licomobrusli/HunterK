// src/components/AudioItemRow.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { containerStyles } from '../styles/containerStyles';
import { buttonStyles } from '../styles/buttonStyles';
import { textStyles } from '../styles/textStyles';
import Weight from '../assets/icons/weight.svg';
import Play from '../assets/icons/play.svg';
import Bin from '../assets/icons/bin.svg';

type AudioItemRowProps = {
  item: { name: string };
  isSelected: boolean;
  weightValue: string;
  onWeightChange: (value: string) => void;
  onSelectAudio: () => void;
  onDeleteAudio: () => void;
};

const AudioItemRow: React.FC<AudioItemRowProps> = ({
  item,
  isSelected,
  weightValue,
  onWeightChange,
  onSelectAudio,
}) => {
  const [isEditingWeight, setIsEditingWeight] = useState(false);

  return (
    <View style={containerStyles.itemContainer}>
      <View style={containerStyles.containerLeft}>
        {isEditingWeight ? (
          <TextInput
            style={buttonStyles.iconButton}
            value={weightValue}
            keyboardType="numeric"
            maxLength={2}
            onChangeText={onWeightChange}
            onBlur={() => setIsEditingWeight(false)}
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditingWeight(true)}>
            <View style={buttonStyles.iconButton}>
              <Weight width={22} height={22} fill="#fff" stroke="#004225" strokeWidth={5} />
              <Text style={textStyles.textAlo}>{weightValue}</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onSelectAudio}>
          <Text
            style={[
              commonStyles.fixedWidthLabel,
              isSelected ? textStyles.greenText : null,
            ]}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={containerStyles.containerRight}>
        <TouchableOpacity onPress={() => {}}>
          <View style={buttonStyles.iconButton}>
            <Play width={18} height={18} fill="#fff" stroke="#004225" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <View style={buttonStyles.iconButton}>
            <Bin width={18} height={18} fill="#fff" stroke="#004225" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AudioItemRow;
