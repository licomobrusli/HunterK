import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import Bin from '../assets/icons/bin.svg';   // Import the Bin SVG
import Queue from '../assets/icons/queue.svg'; // Import the Queue SVG

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
}) => {
  const handleChange = (value: string) => {
    if (value.length > 5) {
      return;
    }
    if (value.length === 2 && !value.includes(':')) {
      setLocalIntervals((prev) => ({
        ...prev,
        [stateName.toLowerCase()]: `${value}:`,
      }));
      console.log(`Updated interval for "${stateName}" to "${value}:"`);
    } else {
      setLocalIntervals((prev) => ({ ...prev, [stateName.toLowerCase()]: value }));
      console.log(`Updated interval for "${stateName}" to "${value}"`);
    }
  };

  const handleBlur = () => {
    onSaveInterval();
  };

  const handleLongPress = () => {
    setLocalIntervals((prev) => ({ ...prev, [stateName.toLowerCase()]: null }));
    console.log(`Interval for "${stateName}" has been set to null.`);
  };

  return (
    <View style={commonStyles.stateColumnRow}>
      {/* Position Number Input */}
      <TextInput
        style={commonStyles.positionInput}
        value={(index + 1).toString()}
        editable={false} // Position is handled in SceneBuilderModal
        keyboardType="numeric"
        maxLength={2}
        placeholder="Pos"
      />

      {/* State Name */}
      <TouchableOpacity onPress={onAssignAudios}>
        <Text style={commonStyles.fixedWidthLabel}>{stateName}</Text>
      </TouchableOpacity>

      {/* Interval Field */}
      {editing ? (
        <TextInput
          style={commonStyles.inputText}
          value={localInterval}
          onChangeText={handleChange}
          onBlur={handleBlur}
          keyboardType="numeric"
          maxLength={5}
          placeholder="mm:ss"
          autoFocus
        />
      ) : (
        <TouchableOpacity onPress={onEditInterval} onLongPress={handleLongPress}>
          <Text style={commonStyles.inputText}>
            {localInterval || 'mm:ss'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Delete Button */}
      <TouchableOpacity onPress={onDelete}>
        <View style={commonStyles.positionInput}>
          <Bin width={18} height={18} fill="#fff" stroke="#004225" />
        </View>
      </TouchableOpacity>

      {/* Queue Button */}
      <TouchableOpacity delayLongPress={200}>
        <View style={commonStyles.positionInput}>
          <Queue width={18} height={18} fill="#fff" stroke="#004225" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default StateRow;
