import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { commonStyles } from '../styles/commonStyles';
import Bin from '../assets/icons/bin.svg';   // Import the Bin SVG
import Queue from '../assets/icons/queue.svg'; // Import the Queue SVG

type StateRowProps = {
  state: string;
  position: string;
  intervalValue: string | null;
  isEditing: boolean;
  onChangePosition: (value: string) => void;
  onBlurPosition: () => void;
  onStatePress: () => void;
  onChangeInterval: (value: string) => void;
  onBlurInterval: () => void;
  onEditInterval: () => void;
  onLongPressInterval: () => void;
  onDeleteState: () => void;
  isGreyedOut: boolean;
};

const StateRow: React.FC<StateRowProps> = ({
  state,
  position,
  intervalValue,
  isEditing,
  onChangePosition,
  onBlurPosition,
  onStatePress,
  onChangeInterval,
  onBlurInterval,
  onEditInterval,
  onLongPressInterval,
  onDeleteState,
  isGreyedOut,
}) => {
  return (
    <View style={commonStyles.stateColumnRow}>
     <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
        <TextInput
            style={commonStyles.positionInput}
            value={position}
            onChangeText={onChangePosition}
            onBlur={onBlurPosition}
            keyboardType="numeric"
            maxLength={2}
            placeholder="Pos"
        />
        <TouchableOpacity onPress={onStatePress}>
          <Text style={commonStyles.fixedWidthLabel}>{state}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
        {isEditing ? (
          <TextInput
            style={commonStyles.input}
            value={intervalValue || ''}
            onChangeText={onChangeInterval}
            onBlur={onBlurInterval}
            keyboardType="numeric"
            maxLength={5}
            placeholder="mm:ss"
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={onEditInterval} onLongPress={onLongPressInterval}>
            <Text style={[commonStyles.inputText, isGreyedOut && { color: 'grey' }]}>
              {intervalValue !== null ? intervalValue : 'mm:ss'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onDeleteState}>
          <View style={[commonStyles.positionInput]}>
            <Bin width={18} height={18} fill="#fff" stroke="#004225" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          delayLongPress={200}
        >
          <View style={[commonStyles.positionInput]}>
            <Queue width={18} height={18} fill="#fff" stroke="#004225" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StateRow;
