// src/screens/modals/AudioManagerModal.tsx
import { commonStyles } from '../../styles/commonStyles';

import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';
import { IntervalContext } from '../../contexts/SceneProvider';

type AudioManagerModalProps = {
  visible: boolean;
  onClose: () => void;
};

const AudioManagerModal: React.FC<AudioManagerModalProps> = ({
  visible,
  onClose,
}) => {
  const { states } = useContext(IntervalContext);
  const [currentPath, setCurrentPath] = useState<string>(RNFS.DocumentDirectoryPath);
  const [items, setItems] = useState<RNFS.ReadDirItem[]>([]);
  const [pathHistory, setPathHistory] = useState<string[]>([]);

  const loadDirectory = useCallback(
    async (path: string) => {
      try {
        const exists = await RNFS.exists(path);
        if (!exists) {
          console.log('Path does not exist:', path);
          setItems([]);
          return;
        }
        const directoryItems = await RNFS.readDir(path);
        // Filter to only show state folders and audio files
        const filteredItems = directoryItems.filter(
          (item) =>
            (item.isDirectory() && states.includes(item.name)) ||
            (item.isFile() && item.name.endsWith('.mp3'))
        );
        setItems(filteredItems);
      } catch (error) {
        console.error('Error reading directory:', error);
        setItems([]);
      }
    },
    [states] // Dependencies of loadDirectory
  );

  useEffect(() => {
    if (visible) {
      setCurrentPath(RNFS.DocumentDirectoryPath);
      setPathHistory([]);
      loadDirectory(RNFS.DocumentDirectoryPath);
    }
  }, [visible, loadDirectory]);

  useEffect(() => {
    if (visible) {
      loadDirectory(currentPath);
    }
  }, [currentPath, visible, loadDirectory]);

  const handleItemPress = (item: RNFS.ReadDirItem) => {
    if (item.isDirectory()) {
      setPathHistory([...pathHistory, currentPath]);
      setCurrentPath(item.path);
    } else {
      // Handle file press
      Alert.alert(
        'Delete File',
        `Are you sure you want to delete ${item.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteFile(item.path),
          },
        ],
        { cancelable: true }
      );
    }
  };

  const deleteFile = async (filePath: string) => {
    try {
      await RNFS.unlink(filePath);
      // Refresh the directory listing
      loadDirectory(currentPath);
      Alert.alert('Success', 'File deleted successfully.');
    } catch (error) {
      console.error('Error deleting file:', error);
      Alert.alert('Error', 'Failed to delete the file.');
    }
  };

  const handleBack = () => {
    if (pathHistory.length > 0) {
      const previousPath = pathHistory[pathHistory.length - 1];
      setPathHistory(pathHistory.slice(0, -1));
      setCurrentPath(previousPath);
    } else {
      // Already at root, maybe close the modal
      onClose();
    }
  };

  const renderItem = ({ item }: { item: RNFS.ReadDirItem }) => (
    <TouchableOpacity style={commonStyles.item} onPress={() => handleItemPress(item)}>
      <Text style={commonStyles.itemText}>
        {item.isDirectory() ? '[Folder] ' : ''}
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={commonStyles.modalContainer}>
        {/* Header */}
        <View style={commonStyles.header}>
          <TouchableOpacity onPress={handleBack} style={commonStyles.backButton}>
            <Text style={commonStyles.backButtonText}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={commonStyles.currentPath}>
            {currentPath.replace(RNFS.DocumentDirectoryPath, '') || '/'}
          </Text>
          <TouchableOpacity onPress={onClose} style={commonStyles.closeButton}>
            <Text style={commonStyles.closeButtonText}>{'Close'}</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.path}
          renderItem={renderItem}
          style={commonStyles.list}
        />
      </View>
    </Modal>
  );
};

export default AudioManagerModal;
