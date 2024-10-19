// src/config/usePlaySound.ts
import { useEffect, useContext, useRef } from 'react';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import BackgroundTimer from 'react-native-background-timer';
import { IntervalContext } from '../contexts/SceneProvider';

const usePlaySound = (stateName: string, interval: number) => {
  const { selectedAudios } = useContext(IntervalContext);
  const audioIndexRef = useRef(0);
  const soundRef = useRef<Sound | null>(null);

  const AUDIOS_FOLDER = `${RNFS.DocumentDirectoryPath}/audios`;

  useEffect(() => {
    let intervalId: number | null = null;
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

      let currentAudioFileName: string;

      if (mode === 'Random') {
        // Randomly select an audio each time
        const randomIndex = Math.floor(Math.random() * audios.length);
        currentAudioFileName = audios[randomIndex];
      } else if (mode === 'A-Z') {
        // Sort audios alphabetically and iterate through them
        const sortedAudios = [...audios].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        // Get current audio file name
        currentAudioFileName = sortedAudios[audioIndexRef.current];
        audioIndexRef.current = (audioIndexRef.current + 1) % sortedAudios.length;
      } else {
        // 'Selected' mode: play audios in the order they were selected
        currentAudioFileName = audios[audioIndexRef.current];
        audioIndexRef.current = (audioIndexRef.current + 1) % audios.length;
      }

      // Construct the full path to the audio file
      const currentAudioPath = `${AUDIOS_FOLDER}/${stateName.toLowerCase()}/${currentAudioFileName}`;

      try {
        const fileExists = await RNFS.exists(currentAudioPath);
        if (!fileExists) {
          console.log(`Audio file does not exist: ${currentAudioPath}`);
          return;
        }

        // Stop any previously playing sound
        if (soundRef.current) {
          soundRef.current.stop(() => {
            soundRef.current?.release();
          });
          isPlaying = false;
        }

        // Initialize the sound
        const sound = new Sound(currentAudioPath, '', (error) => {
          if (error) {
            console.log('Failed to load the sound', error);
            return;
          }
          // Play the sound
          isPlaying = true;
          soundRef.current = sound;
          sound.play((success) => {
            if (success) {
              console.log('Sound played successfully');
            } else {
              console.log('Playback failed due to audio decoding errors');
            }
            isPlaying = false;
            sound.release();
            soundRef.current = null;
          });
        });
      } catch (error) {
        console.error('Error playing audio file:', error);
      }
    };

    // Reset audio index when dependencies change
    audioIndexRef.current = 0;

    // Stop any previously playing sound when state changes
    if (soundRef.current) {
      soundRef.current.stop(() => {
        soundRef.current?.release();
      });
      soundRef.current = null;
    }

    // Play sound immediately upon component mount
    playSound();

    // Set up interval for subsequent plays using BackgroundTimer
    intervalId = BackgroundTimer.setInterval(playSound, interval);

    return () => {
      if (intervalId !== null) {
        BackgroundTimer.clearInterval(intervalId);
      }
      if (soundRef.current) {
        soundRef.current.stop(() => {
          soundRef.current?.release();
        });
        soundRef.current = null;
      }
    };
  }, [stateName, interval, selectedAudios]);
};

export default usePlaySound;
