import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ToastAndroid,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import RNFS from 'react-native-fs';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Modal from '../../styles/AppModal';
import { commonStyles } from '../../styles/commonStyles';

const AUDIOS_DIR = `${RNFS.DocumentDirectoryPath}/audios`;
const DEBRIEFS_DIR = `${RNFS.DocumentDirectoryPath}/debriefs`;
const JOURNEYS_DIR = `${RNFS.DocumentDirectoryPath}/journeys`;

const FileManager: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  const [items, setItems] = useState<{ [key: string]: RNFS.ReadDirItem[] }>({});
  const [expandedDirs, setExpandedDirs] = useState<{ [key: string]: boolean }>({});
  const [playingFilePath, setPlayingFilePath] = useState<string | null>(null);
  const [jsonContent, setJsonContent] = useState<string | null>(null);
  const audioRecorderPlayer = new AudioRecorderPlayer();

  const loadDirectory = useCallback(async (path: string) => {
    try {
      const exists = await RNFS.exists(path);
      if (!exists) {
        await RNFS.mkdir(path);
      }
      const directoryItems = await RNFS.readDir(path);
      const filteredItems = directoryItems.filter(
        (item) =>
          item.isDirectory() ||
          (item.isFile() && (item.name.endsWith('.mp3') || item.name.endsWith('.json')))
      );
      setItems((prevItems) => ({ ...prevItems, [path]: filteredItems }));
    } catch (error) {
      console.error('Error reading directory:', error);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadDirectory(AUDIOS_DIR);
      loadDirectory(DEBRIEFS_DIR);
      loadDirectory(JOURNEYS_DIR);
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

  const showJsonContent = async (filePath: string) => {
    try {
      const content = await RNFS.readFile(filePath, 'utf8');
      setJsonContent(content);
    } catch (error) {
      console.error('Error reading JSON file:', error);
      ToastAndroid.show('Failed to read JSON file.', ToastAndroid.SHORT);
    }
  };

  const renderItem = ({ item }: { item: RNFS.ReadDirItem; path: string }) => {
    const isExpanded = expandedDirs[item.path];
    const isAudioFile = item.name.endsWith('.mp3');
    const isJsonFile = item.name.endsWith('.json');
    return (
      <View>
        <View style={commonStyles.itemContainer}>
          <TouchableOpacity
            style={commonStyles.button}
            onPress={() =>
              item.isDirectory()
                ? toggleDirectory(item.path)
                : isAudioFile
                ? playOrStopAudio(item.path)
                : isJsonFile
                ? showJsonContent(item.path)
                : null
            }
          >
            {item.isDirectory() ? (
              <Icon name={isExpanded ? 'minus-square' : 'plus-square'} size={20} color="white" />
            ) : (
              <Icon name={isAudioFile ? (playingFilePath === item.path ? 'pause' : 'play') : 'file'} size={20} color={isAudioFile && playingFilePath === item.path ? 'green' : 'white'} />
            )}
            <Text
              style={playingFilePath === item.path ? [commonStyles.text0, commonStyles.greenText] : commonStyles.text0}
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
            style={commonStyles.subList}
          />
        )}
      </View>
    );
  };

  return (
    <Modal isVisible={visible} onClose={onClose}>
      <View style={commonStyles.modalContent}>
        <FlatList
          data={[
            {
              name: 'audios',
              path: AUDIOS_DIR,
              isDirectory: () => true,
              isFile: () => false,
              ctime: new Date(),
              mtime: new Date(),
              size: 0,
            },
            {
              name: 'debriefs',
              path: DEBRIEFS_DIR,
              isDirectory: () => true,
              isFile: () => false,
              ctime: new Date(),
              mtime: new Date(),
              size: 0,
            },
            {
              name: 'journeys',
              path: JOURNEYS_DIR,
              isDirectory: () => true,
              isFile: () => false,
              ctime: new Date(),
              mtime: new Date(),
              size: 0,
            },
          ]}
          keyExtractor={(item) => item.path}
          renderItem={({ item }) => renderItem({ item, path: item.path })}
          style={commonStyles.list}
        />
        {/* JSON Viewer Modal */}
        <Modal isVisible={!!jsonContent} onClose={() => setJsonContent(null)}>
          <ScrollView style={commonStyles.jsonViewer}>
            <Text style={commonStyles.text0}>{jsonContent}</Text>
          </ScrollView>
        </Modal>
      </View>
    </Modal>
  );
};

export default FileManager;
