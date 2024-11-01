// src/screens/modals/DeleteCustomAudiosModal.tsx

import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import AppModal from '../../styles/AppModal'; // Adjust the import path if necessary
import RNFS from 'react-native-fs';
import { textStyles } from '../../styles/textStyles';
import { containerStyles } from '../../styles/containerStyles.ts';
import { buttonStyles } from '../../styles/buttonStyles.ts';

interface DeleteCustomAudiosModalProps {
  visible: boolean;
  onClose: () => void;
}

const DeleteAudiosModal: React.FC<DeleteCustomAudiosModalProps> = ({
  visible,
  onClose,
}) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Function to delete all .mp3 files in a directory and its subdirectories
  const deleteMp3FilesInDirectory = async (directoryPath: string) => {
    const exists = await RNFS.exists(directoryPath);
    if (exists) {
      console.log(`Directory exists: ${directoryPath}`);
      const directoryItems = await RNFS.readDir(directoryPath);
      console.log(`Items in directory ${directoryPath}:`, directoryItems);

      for (const item of directoryItems) {
        if (item.isFile() && item.name.toLowerCase().endsWith('.mp3')) {
          try {
            await RNFS.unlink(item.path);
            console.log(`Deleted custom audio file: ${item.path}`);
          } catch (unlinkError) {
            console.error(`Failed to delete file: ${item.path}`, unlinkError);
          }
        } else if (item.isDirectory()) {
          console.log(`Entering directory: ${item.path}`);
          await deleteMp3FilesInDirectory(item.path);

          // Check if directory is empty after deleting files
          const remainingItems = await RNFS.readDir(item.path);
          if (remainingItems.length === 0) {
            try {
              await RNFS.unlink(item.path);
              console.log(`Deleted empty directory: ${item.path}`);
            } catch (unlinkError) {
              console.error(`Failed to delete directory: ${item.path}`, unlinkError);
            }
          }
        }
      }
    } else {
      console.log('Directory does not exist:', directoryPath);
    }
  };

  const handleConfirmDelete = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete all custom audios?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            setIsDeleting(true);
            try {
              console.log('Initiating deletion of all audio files in the main directory.');

              // Set the main directory path (e.g., DocumentDirectoryPath)
              const parentDirectoryPath = `${RNFS.DocumentDirectoryPath}`;

              // Start the deletion process from the main directory
              const rootItems = await RNFS.readDir(parentDirectoryPath);
              for (const item of rootItems) {
                if (item.isDirectory()) {
                  await deleteMp3FilesInDirectory(item.path);
                }
              }

              // Attempt to delete any remaining empty directories in the root
              for (const item of rootItems) {
                if (item.isDirectory()) {
                  const remainingItems = await RNFS.readDir(item.path);
                  if (remainingItems.length === 0) {
                    try {
                      await RNFS.unlink(item.path);
                      console.log(`Deleted empty root directory: ${item.path}`);
                    } catch (unlinkError) {
                      console.error(`Failed to delete root directory: ${item.path}`, unlinkError);
                    }
                  }
                }
              }

              console.log('All custom audio files and empty directories deleted successfully.');
              Alert.alert('Success', 'All custom audios have been deleted successfully.');
            } catch (error) {
              console.error('Error during audio file cleanup:', error);
              Alert.alert('Error', 'An error occurred while deleting audios.');
            } finally {
              setIsDeleting(false);
              onClose();
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <AppModal isVisible={visible} onClose={onClose}>
      <Text style={textStyles.text1}>
        Are you sure you want to delete all custom audios?
      </Text>
      {isDeleting ? (
        <ActivityIndicator size="large" color="#FFFFFF" />
      ) : (
        <View style={containerStyles.container}>
          <TouchableOpacity onPress={handleConfirmDelete} style={buttonStyles.button}>
            <Text style={textStyles.text0}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={buttonStyles.button}>
            <Text style={textStyles.text0}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </AppModal>
  );
};

export default DeleteAudiosModal;
