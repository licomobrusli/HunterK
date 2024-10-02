import { useEffect, useRef } from 'react';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';

const defaultAudioFiles: { [key: string]: any } = {
  active: require('../assets/audio/Active/active.mp3'),
  spotted: require('../assets/audio/Spotted/spotted.mp3'),
  proximity: require('../assets/audio/Proximity/proximity.mp3'),
  trigger: require('../assets/audio/Trigger/trigger.mp3'),
};

const usePlaySound = (stateName: string, intervalDuration: number) => {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const playSound = async () => {
      let soundFile;

      const customAudioPath = `${RNFS.DocumentDirectoryPath}/${stateName.toLowerCase()}.mp3`;

      const fileExists = await RNFS.exists(customAudioPath);

      if (fileExists) {
        console.log(`Playing custom audio file from: ${customAudioPath}`);
        soundFile = customAudioPath;
      } else {
        // Fallback to bundled audio file from the static mapping
        soundFile = defaultAudioFiles[stateName.toLowerCase()];
        console.log(`Using default audio file for state: ${stateName}`);
      }

      const sound = new Sound(soundFile, '', (error) => {
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

    // Clear previous interval if any
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    // Set interval to play sound
    intervalIdRef.current = setInterval(() => {
      playSound();
    }, intervalDuration);

    // Cleanup on unmount or when intervalDuration changes
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [stateName, intervalDuration]);
};

export default usePlaySound;
