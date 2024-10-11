import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import RNFS from 'react-native-fs';
import { Picker } from '@react-native-picker/picker';
import { IntervalContext } from '../../contexts/SceneProvider';
import { PlaybackMode } from '../../types/PlaybackMode';
import AppModal from '../../styles/AppModal';
import { commonStyles } from '../../styles/commonStyles';

const AssignAudiosModal: React.FC<{ visible: boolean; onClose: () => void; stateName: string }> = ({
  visible,
  onClose,
  stateName,
}) => {
  const { states, selectedAudios, setSelectedAudiosForState } = useContext(IntervalContext);
  const [items, setItems] = useState<RNFS.ReadDirItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<{ [key: string]: boolean }>({});
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('Selected');

  const loadDirectory = useCallback(
    async (path: string) => {
      try {
        const exists = await RNFS.exists(path);
        if (!exists) {
          console.log('Path does not exist:', path);
          return [];
        }
        const directoryItems = await RNFS.readDir(path);
        return directoryItems.filter(
          (item) =>
            (item.isDirectory() && states.includes(item.name)) ||
            (item.isFile() && item.name.endsWith('.mp3'))
        );
      } catch (error) {
        console.error('Error reading directory:', error);
        return [];
      }
    },
    [states]
  );

  useEffect(() => {
    const loadAudioFiles = async () => {
      const baseFolder = RNFS.DocumentDirectoryPath;
      const files = await loadDirectory(baseFolder);
      setItems(files.filter((item) => item.isDirectory() && states.includes(item.name)));

      const currentSelected = selectedAudios[stateName.toLowerCase()] || { audios: [], mode: 'Selected' };
      setSelectedFiles(currentSelected.audios);
      setPlaybackMode(currentSelected.mode);
    };

    if (visible) {
      loadAudioFiles();
    }
  }, [visible, stateName, selectedAudios, loadDirectory, states]);

  const toggleDirectory = async (path: string) => {
    setExpandedDirs((prevExpandedDirs) => ({
      ...prevExpandedDirs,
      [path]: !prevExpandedDirs[path],
    }));
    if (!expandedDirs[path]) {
      const subItems = await loadDirectory(path);
      setItems((prevItems) => {
        const index = prevItems.findIndex((item) => item.path === path);
        const newItems = [...prevItems];
        newItems.splice(index + 1, 0, ...subItems);
        return newItems;
      });
    } else {
      setItems((prevItems) => prevItems.filter((item) => !item.path.startsWith(path) || item.path === path));
    }
  };

  const handleSelectAudio = (filePath: string) => {
    setSelectedFiles((prevSelectedFiles) => {
      if (prevSelectedFiles.includes(filePath)) {
        return prevSelectedFiles.filter((path) => path !== filePath);
      } else {
        return [...prevSelectedFiles, filePath];
      }
    });
  };

  const handleSaveSelection = () => {
    setSelectedAudiosForState(stateName, {
      audios: selectedFiles,
      mode: playbackMode,
    });
    ToastAndroid.show('Audios assigned successfully!', ToastAndroid.SHORT);
  };

  const renderItem = ({ item }: { item: RNFS.ReadDirItem }) => {
    const isSelected = selectedFiles.includes(item.path);
    const isDirectory = item.isDirectory();

    return (
      <View>
        <TouchableOpacity onPress={() => (isDirectory ? toggleDirectory(item.path) : handleSelectAudio(item.path))} style={[styles.itemButton, isDirectory && styles.directoryButton]}>
          {isDirectory && (
            <Icon
              name={expandedDirs[item.path] ? 'minus-square' : 'plus-square'}
              size={20}
              color="white"
            />
          )}
          <Text style={[styles.itemText, isSelected && styles.selectedText]}>{item.name}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <AppModal isVisible={visible} onClose={onClose} animationIn="fadeIn" animationOut="fadeOut">
      <Text style={commonStyles.title}>Assign Audios for {stateName}</Text>

      <View style={commonStyles.pickerContainer}>
        <Text style={commonStyles.pickerLabel}>Playback Mode:</Text>
        <Picker
          selectedValue={playbackMode}
          onValueChange={(itemValue) => setPlaybackMode(itemValue as PlaybackMode)}
          style={commonStyles.picker}
        >
          <Picker.Item label="Selected" value="Selected" />
          <Picker.Item label="A-Z" value="A-Z" />
          <Picker.Item label="Random" value="Random" />
        </Picker>
      </View>

      <FlatList
        data={items.filter((item) => item.isDirectory() ? states.includes(item.name) : true)}
        keyExtractor={(item) => item.path}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  directoryButton: {
    backgroundColor: '#333',
  },
  itemText: {
    color: 'white',
    marginLeft: 10,
  },
  selectedText: {
    color: 'green',
  },
  flatList: {
    width: '100%',
  },
});

export default AssignAudiosModal;
