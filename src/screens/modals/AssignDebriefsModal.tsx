// src/screens/modals/AssignDebriefsModal.tsx

import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import RNFS from 'react-native-fs';
import { IntervalContext } from '../../contexts/SceneProvider';
import AppModal from '../../styles/AppModal';
import { commonStyles } from '../../styles/commonStyles';

const DEBRIEFS_DIR = `${RNFS.DocumentDirectoryPath}/debriefs`;

type AssignDebriefsModalProps = {
  visible: boolean;
  onClose: () => void;
  stateName: string;
  onDebriefSelected: (debrief: string) => void; // New prop for handling selection
};

const AssignDebriefsModal: React.FC<AssignDebriefsModalProps> = ({
  visible,
  onClose,
  stateName,
  onDebriefSelected, // Include this in the component's arguments
}) => {
  const { selectedDebriefs, setSelectedDebriefsForState } = useContext(IntervalContext);
  const [items, setItems] = useState<RNFS.ReadDirItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const loadDebriefFiles = useCallback(async () => {
    try {
      const exists = await RNFS.exists(DEBRIEFS_DIR);
      if (!exists) {
        console.log('Debrief folder does not exist:', DEBRIEFS_DIR);
        return;
      }
      const directoryItems = await RNFS.readDir(DEBRIEFS_DIR);
      const debriefFiles = directoryItems.filter((item) => item.isFile() && item.name.endsWith('.json'));
      setItems(debriefFiles);

      const currentSelected = selectedDebriefs[stateName.toLowerCase()] || [];
      setSelectedFiles(currentSelected);
    } catch (error) {
      console.error('Error loading debrief files:', error);
    }
  }, [stateName, selectedDebriefs]);

  useEffect(() => {
    if (visible) {
      loadDebriefFiles();
    }
  }, [visible, loadDebriefFiles]);

  const handleSelectDebrief = (fileName: string) => {
    setSelectedFiles((prevSelectedFiles) => {
      if (prevSelectedFiles.includes(fileName)) {
        return prevSelectedFiles.filter((name) => name !== fileName);
      } else {
        return [...prevSelectedFiles, fileName];
      }
    });
    onDebriefSelected(fileName); // Notify parent of the selected debrief
  };

  const handleSaveSelection = () => {
    setSelectedDebriefsForState(stateName, selectedFiles);
    ToastAndroid.show('Debriefs assigned successfully!', ToastAndroid.SHORT);
    onClose();
  };

  const renderItem = ({ item }: { item: RNFS.ReadDirItem }) => {
    const isSelected = selectedFiles.includes(item.name);
    return (
      <View>
        <TouchableOpacity onPress={() => handleSelectDebrief(item.name)} style={styles.itemButton}>
          <Text style={[styles.itemText, isSelected && styles.selectedText]}>{item.name}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <AppModal isVisible={visible} onClose={onClose} animationIn="fadeIn" animationOut="fadeOut">
      <Text style={commonStyles.title}>Assign Debriefs for {stateName}</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        style={styles.flatList}
      />
      <TouchableOpacity onPress={handleSaveSelection} style={commonStyles.saveButton}>
        <Text style={commonStyles.saveButtonText}>Save Selection</Text>
      </TouchableOpacity>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  itemButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  itemText: {
    color: 'white',
  },
  selectedText: {
    color: 'green',
  },
  flatList: {
    width: '100%',
  },
});

export default AssignDebriefsModal;
