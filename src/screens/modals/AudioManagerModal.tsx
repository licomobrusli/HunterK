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
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { IntervalContext } from '../../contexts/SceneProvider';
import Modal from '../../styles/AppModal';
import { commonStyles } from '../../styles/commonStyles';

const AudioManagerModal: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  useContext(IntervalContext);
  const [items, setItems] = useState<{ [key: string]: RNFS.ReadDirItem[] }>({});
  const [expandedDirs, setExpandedDirs] = useState<{ [key: string]: boolean }>({});
  const [playingFilePath, setPlayingFilePath] = useState<string | null>(null);
  const audioRecorderPlayer = new AudioRecorderPlayer();

  const loadDirectory = useCallback(
    async (path: string) => {
      try {
        const exists = await RNFS.exists(path);
        if (!exists) {
          console.log('Path does not exist:', path);
          return;
        }
        const directoryItems = await RNFS.readDir(path);
        const filteredItems = directoryItems.filter(
          (item) =>
            item.isDirectory() ||
            (item.isFile() && item.name.endsWith('.mp3'))
        );
        setItems((prevItems) => ({ ...prevItems, [path]: filteredItems }));
      } catch (error) {
        console.error('Error reading directory:', error);
      }
    },
    []
  );

  useEffect(() => {
    if (visible) {
      loadDirectory(RNFS.DocumentDirectoryPath);
    }
  }, [visible, loadDirectory]);

  const toggleDirectory = (path: string) => {
    setExpandedDirs((prevExpandedDirs) => {
      const isExpanded = prevExpandedDirs[path];
      if (!isExpanded) {
        loadDirectory(path);
      }
      return {
        ...prevExpandedDirs,
        [path]: !isExpanded,
      };
    });
  };

  const playOrStopAudio = async (filePath: string) => {
    if (playingFilePath === filePath) {
      await audioRecorderPlayer.stopPlayer();
      setPlayingFilePath(null);
    } else {
      try {
        await audioRecorderPlayer.startPlayer(filePath);
        audioRecorderPlayer.addPlayBackListener((e) => {
          if (e.currentPosition >= e.duration) {
            audioRecorderPlayer.stopPlayer();
            setPlayingFilePath(null);
          }
          return;
        });
        setPlayingFilePath(filePath);
      } catch (error) {
        console.error('Error playing audio:', error);
        ToastAndroid.show('Failed to play audio.', ToastAndroid.SHORT);
      }
    }
  };

  const deleteFile = async (filePath: string) => {
    try {
      await RNFS.unlink(filePath);
      const parentPath = filePath.substring(0, filePath.lastIndexOf('/'));
      loadDirectory(parentPath);
      ToastAndroid.show('File deleted successfully.', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error deleting file:', error);
      ToastAndroid.show('Failed to delete the file.', ToastAndroid.SHORT);
    }
  };

  const renderItem = ({ item }: { item: RNFS.ReadDirItem; path: string }) => {
    const isExpanded = expandedDirs[item.path];
    return (
      <View>
        <View style={styles.itemContainer}>
          <TouchableOpacity
            style={styles.itemButton}
            onPress={() => (item.isDirectory() ? toggleDirectory(item.path) : playOrStopAudio(item.path))}
          >
            {item.isDirectory() ? (
              <Icon
                name={isExpanded ? 'minus-square' : 'plus-square'}
                size={20}
                color="white"
              />
            ) : (
              <Icon
                name={playingFilePath === item.path ? 'pause' : 'play'}
                size={20}
                color={playingFilePath === item.path ? 'green' : 'white'}
              />
            )}
            <Text
              style={
                playingFilePath === item.path
                  ? [styles.itemText, styles.playingText]
                  : styles.itemText
              }
            >
              {item.name}
            </Text>
          </TouchableOpacity>
          {item.isFile() && (
            <TouchableOpacity onPress={() => deleteFile(item.path)}>
              <Icon name="trash" size={20} color="red" />
            </TouchableOpacity>
          )}
        </View>
        {isExpanded && item.isDirectory() && items[item.path] && (
          <FlatList
            data={items[item.path]}
            keyExtractor={(subItem) => subItem.path}
            renderItem={({ item: subItem }) => renderItem({ item: subItem, path: item.path })}
            style={styles.subList}
          />
        )}
      </View>
    );
  };

  return (
    <Modal isVisible={visible} onClose={onClose}>
      <View style={commonStyles.modalContent}>
        <Text style={commonStyles.title}>Audio Manager</Text>
        <FlatList
          data={items[RNFS.DocumentDirectoryPath]}
          keyExtractor={(item) => item.path}
          renderItem={({ item }) => renderItem({ item, path: RNFS.DocumentDirectoryPath })}
          style={styles.list}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemText: {
    color: 'white',
    marginLeft: 10,
  },
  playingText: {
    color: 'green',
  },
  list: {
    width: '100%',
  },
  subList: {
    paddingLeft: 20,
  },
});

export default AudioManagerModal;
