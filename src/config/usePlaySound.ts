// src/config/usePlaySound.ts
import { useEffect, useContext, useRef } from 'react';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import { IntervalContext } from '../contexts/SceneProvider';

const usePlaySound = (stateName: string, interval: number) => {
  const { selectedAudios } = useContext(IntervalContext);
  const audioIndexRef = useRef(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let isPlaying = false;

    const playSound = async () => {
      if (isPlaying) {
        return;
      }

      const stateData = selectedAudios[stateName.toLowerCase()];
      if (!stateData || stateData.audios.length === 0) {
        console.log(`No audios selected for state: ${stateName}`);
        return;
      }

      const { audios, mode } = stateData;

      let currentAudioPath: string;

      if (mode === 'Random') {
        // Randomly select an audio each time
        const randomIndex = Math.floor(Math.random() * audios.length);
        currentAudioPath = audios[randomIndex];
      } else if (mode === 'A-Z') {
        // Sort audios alphabetically and iterate through them
        const sortedAudios = [...audios].sort((a, b) => {
          const nameA = a.substring(a.lastIndexOf('/') + 1).toLowerCase();
          const nameB = b.substring(b.lastIndexOf('/') + 1).toLowerCase();
          return nameA.localeCompare(nameB);
        });

        // Get current audio index
        currentAudioPath = sortedAudios[audioIndexRef.current];
        audioIndexRef.current = (audioIndexRef.current + 1) % sortedAudios.length;
      } else {
        // 'Selected' mode: play audios in the order they were selected
        currentAudioPath = audios[audioIndexRef.current];
        audioIndexRef.current = (audioIndexRef.current + 1) % audios.length;
      }

      try {
        const fileExists = await RNFS.exists(currentAudioPath);
        if (!fileExists) {
          console.log(`Audio file does not exist: ${currentAudioPath}`);
          return;
        }

        // Initialize the sound
        const sound = new Sound(currentAudioPath, '', (error) => {
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

    // Reset audio index when dependencies change
    audioIndexRef.current = 0;

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
