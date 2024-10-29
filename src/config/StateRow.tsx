import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import Bin from '../assets/icons/bin.svg';
import Debrief from '../assets/icons/debrief.svg';
import AssignDebriefsModal from '../screens/modals/AssignDebriefsModal'; // Import the new modal component

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
  onAssignDebrief: (debrief: string) => void; // Add a prop to handle debrief assignment
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
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempStateName, setTempStateName] = useState(stateName);
  const [isDebriefModalVisible, setDebriefModalVisible] = useState(false); // Modal state

  const handleChange = (value: string) => {
    if (value.length > 5) {return;}

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

  const handleLongPress = () => {
    setIsRenaming(true);
  };

  const handleRenameBlur = () => {
    setIsRenaming(false);
    onRenameState(tempStateName);
  };

  const handleIntervalLongPress = () => {
    setLocalIntervals((prev) => ({ ...prev, [stateName.toLowerCase()]: null }));
  };

  const openDebriefModal = () => {
    setDebriefModalVisible(true);
  };

  const handleDebriefSelected = (debrief: string) => {
    onAssignDebrief(debrief); // Assign selected debrief to the state
    setDebriefModalVisible(false);
  };

  return (
    <View style={commonStyles.stateColumnRow}>
      <TextInput
        style={commonStyles.positionInput}
        value={(index + 1).toString()}
        editable={false}
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
        <TouchableOpacity onPress={onAssignAudios} onLongPress={handleLongPress}>
          <Text style={commonStyles.fixedWidthLabel}>{stateName}</Text>
        </TouchableOpacity>
      )}

      {editing ? (
        <TextInput
          style={commonStyles.inputText}
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
          <Text style={commonStyles.inputText}>{localInterval || 'mm:ss'}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onDelete}>
        <View style={commonStyles.positionInput}>
          <Bin width={18} height={18} fill="#fff" stroke="#004225" />
        </View>
      </TouchableOpacity>

      {/* Debrief Button */}
      <TouchableOpacity onPress={openDebriefModal} delayLongPress={200}>
        <View style={commonStyles.positionInput}>
          <Debrief width={18} height={18} fill="#fff" stroke="#004225" />
        </View>
      </TouchableOpacity>

      {/* Debrief Modal */}
      <AssignDebriefsModal
        visible={isDebriefModalVisible}
        onClose={() => setDebriefModalVisible(false)}
        onDebriefSelected={handleDebriefSelected} stateName={''}      />
    </View>
  );
};

export default StateRow;
