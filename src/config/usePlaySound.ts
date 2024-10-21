// src/config/usePlaySound.ts
import { useEffect, useContext, useRef } from 'react';
import TrackPlayer, { Capability, State } from 'react-native-track-player';
import RNFS from 'react-native-fs';
import BackgroundTimer from 'react-native-background-timer';
import { IntervalContext } from '../contexts/SceneProvider';

const usePlaySound = (stateName: string, interval: number) => {
  const { selectedAudios } = useContext(IntervalContext);
  const audioIndexRef = useRef(0);

  const AUDIOS_FOLDER = `${RNFS.DocumentDirectoryPath}/audios`;

  useEffect(() => {
    let intervalId: number | null = null;

    const setupTrackPlayer = async () => {
      await TrackPlayer.setupPlayer();

      // Enable audio focus without pausing on interruptions to allow ducking
      await TrackPlayer.updateOptions({
        capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
        compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
        // Removing `alwaysPauseOnInterruption` to allow ducking instead of pausing other audio
      });
    };

    const playSound = async () => {
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
        const sortedAudios = [...audios].sort((a, b) =>
          a.toLowerCase().localeCompare(b.toLowerCase())
        );

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

        // Stop the current track if any
        const currentTrackState = await TrackPlayer.getState();
        if (currentTrackState === State.Playing || currentTrackState === State.Paused) {
          await TrackPlayer.stop();
          await TrackPlayer.reset();
        }

        // Add the track to TrackPlayer and play it
        await TrackPlayer.add({
          id: `${audioIndexRef.current}`,
          url: `file://${currentAudioPath}`,
          title: `State Audio`,
          artist: 'Your App',
        });

        await TrackPlayer.play();
      } catch (error) {
        console.error('Error playing audio file:', error);
      }
    };

    // Reset audio index when dependencies change
    audioIndexRef.current = 0;

    // Set up TrackPlayer
    setupTrackPlayer();

    // Play sound immediately upon component mount
    playSound();

    // Set up interval for subsequent plays using BackgroundTimer
    intervalId = BackgroundTimer.setInterval(playSound, interval);

    return () => {
      if (intervalId !== null) {
        BackgroundTimer.clearInterval(intervalId);
      }

      TrackPlayer.stop();
      TrackPlayer.reset();
    };
  }, [stateName, interval, selectedAudios]);
};

export default usePlaySound;
