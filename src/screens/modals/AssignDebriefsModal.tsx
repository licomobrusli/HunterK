// src/screens/modals/AssignDebriefsModal.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import RNFS from 'react-native-fs';
import AppModal from '../../styles/AppModal';
import { commonStyles } from '../../styles/commonStyles';

const DEBRIEFS_DIR = `${RNFS.DocumentDirectoryPath}/debriefs`;

type AssignDebriefsModalProps = {
  visible: boolean;
  onClose: () => void;
  stateName: string;
  selectedDebrief: string | null; // Now holds a single debrief
  onDebriefSelected: (debrief: string | null) => void;
};

const AssignDebriefsModal: React.FC<AssignDebriefsModalProps> = ({
  visible,
  onClose,
  stateName,
  selectedDebrief,
  onDebriefSelected,
}) => {
  const [items, setItems] = useState<RNFS.ReadDirItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(selectedDebrief);

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
    } catch (error) {
      console.error('Error loading debrief files:', error);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadDebriefFiles();
    }
  }, [visible, loadDebriefFiles]);

  useEffect(() => {
    // Update selected file when selectedDebrief prop changes
    setSelectedFile(selectedDebrief);
  }, [selectedDebrief]);

  const handleSelectDebrief = (fileName: string) => {
    const newSelection = selectedFile === fileName ? null : fileName;
    setSelectedFile(newSelection);
    onDebriefSelected(newSelection); // Update parent with new selection
  };

  const renderItem = ({ item }: { item: RNFS.ReadDirItem }) => {
    const isSelected = selectedFile === item.name;
    return (
      <View>
        <TouchableOpacity onPress={() => handleSelectDebrief(item.name)} style={styles.itemButton}>
          <Text style={[styles.itemText, isSelected && styles.selectedText]}>{item.name}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <AppModal isVisible={visible} onClose={onClose}>
      <Text style={commonStyles.title}>Assign Debrief for {stateName}</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        style={styles.flatList}
      />
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
    color: 'green', // Change color to indicate selection
  },
  flatList: {
    width: '100%',
  },
});

export default AssignDebriefsModal;
