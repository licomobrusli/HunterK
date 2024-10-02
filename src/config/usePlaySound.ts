// usePlaySound.ts
import { useEffect } from 'react';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';

// Create a static mapping of state names to their audio files
const defaultAudioFiles: { [key: string]: any } = {
  active: require('../assets/audio/Active/active.mp3'),
  spotted: require('../assets/audio/Spotted/spotted.mp3'),
  proximity: require('../assets/audio/Proximity/proximity.mp3'),
  trigger: require('../assets/audio/Trigger/trigger.mp3'),
};

const usePlaySound = (stateName: string, intervalDuration: number) => {
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const playSound = async () => {
      let soundFile;

      // Path to custom audio file
      const customAudioPath = `${RNFS.DocumentDirectoryPath}/${stateName.toLowerCase()}.mp3`;

      // Check if custom audio file exists
      const fileExists = await RNFS.exists(customAudioPath);

      if (fileExists) {
        soundFile = { uri: 'file://' + customAudioPath };
      } else {
        // Fallback to bundled audio file from the static mapping
        soundFile = defaultAudioFiles[stateName.toLowerCase()];
      }

      const sound = new Sound(soundFile, undefined, (error) => {
        if (error) {
          console.log('Failed to load sound', error);
          return;
        }
        sound.play((success) => {
          if (!success) {
            console.log('Sound playback failed');
          }
          sound.release();
        });
      });
    };

    // Play sound immediately
    playSound();

    // Set interval to play sound
    intervalId = setInterval(() => {
      playSound();
    }, intervalDuration);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [stateName, intervalDuration]);
};

export default usePlaySound;
