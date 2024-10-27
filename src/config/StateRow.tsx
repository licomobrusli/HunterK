// src/config/StateRow.tsx

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import Bin from '../assets/icons/bin.svg';
import Queue from '../assets/icons/queue.svg';

type StateRowProps = {
  state: string;
  position: string;
  intervalValue: string;
  onChangePosition: (value: string) => void;
  onBlurPosition: () => void;
  onStatePress: () => void;
  onChangeInterval: (value: string) => void;
  onBlurInterval: () => void;
  onDeleteState: () => void;
  isGreyedOut: boolean;
};

const StateRow: React.FC<StateRowProps> = React.memo(
  ({
    state,
    position,
    intervalValue,
    onChangePosition,
    onBlurPosition,
    onStatePress,
    onChangeInterval,
    onBlurInterval,
    onDeleteState,
    isGreyedOut,
  }) => {
    const [localInterval, setLocalInterval] = useState<string>(() => intervalValue || '00:00');
    const [isEditing, setIsEditing] = useState(false);

    const handleEditChange = (text: string) => {
      const cleanedText = text.replace(/\D/g, '').substring(0, 4);
      const formattedText =
        cleanedText.length <= 2
          ? `00:${cleanedText.padStart(2, '0')}`
          : `${cleanedText.slice(0, -2).padStart(2, '0')}:${cleanedText.slice(-2)}`;
      setLocalInterval(formattedText);
    };

    const handleEditStart = () => {
      setIsEditing(true);
    };

    const handleEditBlur = () => {
      setIsEditing(false);
      onChangeInterval(localInterval); // Update parent only after editing is done
      onBlurInterval();
    };

    return (
      <View style={commonStyles.stateColumnRow}>
        <View style={styles.rowStart}>
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
        <View style={styles.rowEnd}>
          {isEditing ? (
            <TextInput
              style={commonStyles.input}
              value={localInterval}
              onChangeText={handleEditChange}
              onBlur={handleEditBlur}
              keyboardType="numeric"
              maxLength={5}
              placeholder="00:00"
              autoFocus
            />
          ) : (
            <TouchableOpacity onPress={handleEditStart}>
              <Text style={[commonStyles.inputText, isGreyedOut && styles.greyedOutText]}>
                {localInterval}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onDeleteState}>
            <View style={commonStyles.positionInput}>
              <Bin width={18} height={18} fill="#fff" stroke="#004225" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <View style={commonStyles.positionInput}>
              <Queue width={18} height={18} fill="#fff" stroke="#004225" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Prevent re-render unless necessary
    return (
      prevProps.position === nextProps.position &&
      prevProps.state === nextProps.state &&
      prevProps.isGreyedOut === nextProps.isGreyedOut
      // Do not include intervalValue in comparison to prevent re-rendering during editing
    );
  }
);

const styles = StyleSheet.create({
  rowStart: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  rowEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  greyedOutText: {
    color: 'grey',
  },
});

export default StateRow;
