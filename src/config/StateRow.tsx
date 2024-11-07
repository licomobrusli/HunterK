import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import Bin from '../assets/icons/bin.svg';
import Debrief from '../assets/icons/debrief.svg';
import Audio from '../assets/icons/audio.svg';
import { containerStyles } from '../styles/containerStyles';
import { textStyles } from '../styles/textStyles';
import { buttonStyles } from '../styles/buttonStyles.ts';

type StateRowProps = {
  stateName: string;
  index: number;
  localInterval: string;
  setLocalIntervals: React.Dispatch<React.SetStateAction<{ [key: string]: string | null }>>;
  editing: boolean;
  onAssignAudios: () => void;
  onDelete: () => void;
  onEditInterval: () => void;
  onSaveInterval: () => void;
  onRenameState: (newName: string) => void;
  onAssignDebrief: () => void;
  selectedDebrief: string | null;
  hasAssignedAudios: boolean; // New prop for audio assignment status
};

const StateRow: React.FC<StateRowProps> = ({
  stateName,
  index,
  localInterval,
  setLocalIntervals,
  editing,
  onAssignAudios,
  onDelete,
  onEditInterval,
  onSaveInterval,
  onRenameState,
  onAssignDebrief,
  selectedDebrief,
  hasAssignedAudios,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempStateName, setTempStateName] = useState(stateName);

  const handleChange = (value: string) => {
    if (value.length > 5) { return; }

    if (value.length === 2 && !value.includes(':')) {
      setLocalIntervals((prev) => ({
        ...prev,
        [stateName.toLowerCase()]: `${value}:`,
      }));
    } else {
      setLocalIntervals((prev) => ({ ...prev, [stateName.toLowerCase()]: value }));
    }
  };

  const handleBlur = () => {
    onSaveInterval();
  };

  const handleRenameBlur = () => {
    setIsRenaming(false);
    onRenameState(tempStateName);
  };

  const handleIntervalLongPress = () => {
    setLocalIntervals((prev) => ({ ...prev, [stateName.toLowerCase()]: null }));
  };

  return (
    <View style={containerStyles.itemContainer}>
      <View style={containerStyles.containerLeft}>
        <TextInput
          style={buttonStyles.iconButton}
          value={(index + 1).toString()}
          editable={true}
          keyboardType="numeric"
          maxLength={2}
          placeholder="Pos"
        />

        {isRenaming ? (
          <TextInput
            style={commonStyles.fixedWidthLabel}
            value={tempStateName}
            onChangeText={setTempStateName}
            onBlur={handleRenameBlur}
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setIsRenaming(true)}>
            <Text style={commonStyles.fixedWidthLabel}>{stateName}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={containerStyles.containerRight}>
        <View style={buttonStyles.timeButton}>
          {editing ? (
            <TextInput
              style={textStyles.text0}
              value={localInterval ?? 'mm:ss'}
              onChangeText={handleChange}
              onBlur={handleBlur}
              keyboardType="numeric"
              maxLength={5}
              placeholder="mm:ss"
              autoFocus
            />
          ) : (
            <TouchableOpacity onPress={onEditInterval} onLongPress={handleIntervalLongPress}>
              <Text style={textStyles.text0}>{localInterval || 'mm:ss'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Audio icon for audio assignment with color change */}
        <TouchableOpacity onPress={onAssignAudios}>
          <View style={buttonStyles.iconButton}>
            <Audio
              width={18}
              height={18}
              fill={hasAssignedAudios ? '#00ff00' : '#fff'} // Green if audios are assigned
              stroke="#004225"
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onAssignDebrief} delayLongPress={200}>
          <View style={buttonStyles.iconButton}>
            <Debrief
              width={18}
              height={18}
              fill={selectedDebrief ? '#00ff00' : '#fff'}
              stroke="#004225"
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onDelete}>
          <View style={buttonStyles.iconButton}>
            <Bin width={18} height={18} fill="#fff" stroke="#004225" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StateRow;
