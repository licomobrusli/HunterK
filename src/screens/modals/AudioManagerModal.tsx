// src/screens/modals/AudioManagerModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';

type AudioManagerModalProps = {
  visible: boolean;
  onClose: () => void;
};

const STATES = ['Active', 'Spotted', 'Proximity', 'Trigger'];

const AudioManagerModal: React.FC<AudioManagerModalProps> = ({
  visible,
  onClose,
}) => {
  const [currentPath, setCurrentPath] = useState<string>(RNFS.DocumentDirectoryPath);
  const [items, setItems] = useState<RNFS.ReadDirItem[]>([]);
  const [pathHistory, setPathHistory] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setCurrentPath(RNFS.DocumentDirectoryPath);
      setPathHistory([]);
      loadDirectory(RNFS.DocumentDirectoryPath);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      loadDirectory(currentPath);
    }
  }, [currentPath, visible]);

  const loadDirectory = async (path: string) => {
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
          (item.isDirectory() && STATES.includes(item.name)) ||
          (item.isFile() && item.name.endsWith('.mp3'))
      );
      setItems(filteredItems);
    } catch (error) {
      console.error('Error reading directory:', error);
      setItems([]);
    }
  };

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
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleItemPress(item)}
    >
      <Text style={styles.itemText}>
        {item.isDirectory() ? '[Folder] ' : ''}{item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.currentPath}>
            {currentPath.replace(RNFS.DocumentDirectoryPath, '') || '/'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>{'Close'}</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.path}
          renderItem={renderItem}
          style={styles.list}
        />
      </View>
    </Modal>
  );
};

export default AudioManagerModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#004225',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: '#003015',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  currentPath: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    color: '#fff',
    fontSize: 16,
  },
});
