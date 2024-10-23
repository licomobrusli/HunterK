import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { commonStyles } from '../styles/commonStyles';

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
        <Icon name="trash-2" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default StateRow;
