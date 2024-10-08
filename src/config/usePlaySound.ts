// src/config/usePlaySound.ts
import { useEffect, useContext } from 'react';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import { IntervalContext } from '../contexts/SceneProvider';

const usePlaySound = (stateName: string, interval: number) => {
  const { selectedAudios } = useContext(IntervalContext);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let isPlaying = false;

    const playSound = async () => {
      if (isPlaying) {
        return;
      }

      const selectedAudioPath = selectedAudios[stateName.toLowerCase()];

      if (!selectedAudioPath) {
        console.log(`No audio selected for state: ${stateName}`);
        return;
      }

      try {
        const fileExists = await RNFS.exists(selectedAudioPath);
        if (!fileExists) {
          console.log(`Selected audio file does not exist: ${selectedAudioPath}`);
          return;
        }

        // Initialize the sound
        const sound = new Sound(selectedAudioPath, '', (error) => {
          if (error) {
            console.log('Failed to load the sound', error);
            return;
          }
          // Play the sound
          isPlaying = true;
          sound.play((success) => {
            if (success) {
              console.log('Sound played successfully');
            } else {
              console.log('Playback failed due to audio decoding errors');
            }
            isPlaying = false;
            sound.release();
          });
        });
      } catch (error) {
        console.error('Error playing audio file:', error);
      }
    };

    // Play sound immediately upon component mount
    playSound();

    // Set up interval for subsequent plays
    intervalId = setInterval(playSound, interval);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [stateName, interval, selectedAudios]);

};

export default usePlaySound;
