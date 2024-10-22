// src/config/usePlaySound.ts

import { useEffect, useContext, useRef } from 'react';
import TrackPlayer, { Capability, State } from 'react-native-track-player';
import RNFS from 'react-native-fs';
import { IntervalContext } from '../contexts/SceneProvider';

let isTrackPlayerSetup = false; // Module-level variable to track initialization

const usePlaySound = (stateName: string, interval: number) => {
  const { selectedAudios } = useContext(IntervalContext);
  const audioIndexRef = useRef(0);

  const AUDIOS_FOLDER = `${RNFS.DocumentDirectoryPath}/audios`;

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const setupTrackPlayer = async () => {
      if (!isTrackPlayerSetup) {
        await TrackPlayer.setupPlayer();

        // Ensure audio focus is handled properly with ducking
        await TrackPlayer.updateOptions({
          capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
          compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
          alwaysPauseOnInterruption: false,  // Allows ducking instead of pausing
        });

        isTrackPlayerSetup = true;
        console.log('TrackPlayer has been initialized with ducking enabled.');
      }
    };

    const playSound = async () => {
      console.log(`playSound called for state: ${stateName}`);
      const stateData = selectedAudios[stateName.toLowerCase()];
      console.log(`stateData for state ${stateName}:`, stateData);

      if (!stateData || stateData.audios.length === 0) {
        console.log(`No audios selected for state: ${stateName}`);
        return;
      }

      const { audios, mode } = stateData;

      let currentAudioFileName: string | undefined;

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
      } else if (mode === 'Selected') {
        // 'Selected' mode: play audios in the order they were selected
        currentAudioFileName = audios[audioIndexRef.current];
        audioIndexRef.current = (audioIndexRef.current + 1) % audios.length;
      } else {
        console.error(`Unknown mode: ${mode}`);
        return;
      }

      if (!currentAudioFileName) {
        console.error('currentAudioFileName is undefined.');
        return;
      }

      // Construct the full path to the audio file
      const currentAudioPath = `${AUDIOS_FOLDER}/${stateName.toLowerCase()}/${currentAudioFileName}`;
      console.log(`Current audio path for state ${stateName}: ${currentAudioPath}`);

      try {
        const fileExists = await RNFS.exists(currentAudioPath);
        console.log(`File exists at ${currentAudioPath}: ${fileExists}`);
        if (!fileExists) {
          console.log(`Audio file does not exist: ${currentAudioPath}`);
          return;
        }

        // Only reset the player if there's something else playing
        const currentTrackState = await TrackPlayer.getState();
        if (currentTrackState === State.Playing || currentTrackState === State.Paused) {
          await TrackPlayer.stop();
          await TrackPlayer.reset();
        }

        // Add the track to TrackPlayer and play it
        await TrackPlayer.add({
          id: `${stateName}-${audioIndexRef.current}`,
          url: `file://${currentAudioPath}`,
          title: `State Audio`,
          artist: 'Your App',
        });

        await TrackPlayer.play();
        console.log(`Playing audio for state: ${stateName}`);
      } catch (error) {
        console.error('Error playing audio file:', error);
      }
    };

    // Initialize the player and then play sound
    const initializePlayerAndPlay = async () => {
      await setupTrackPlayer();
      await playSound();

      // Set up interval for subsequent plays
      intervalId = setInterval(() => {
        console.log(`Interval triggered for state: ${stateName}`);
        playSound();
      }, interval);
      console.log(`Interval set for state: ${stateName} with interval ${interval}ms`);
    };

    // Reset audio index when dependencies change
    audioIndexRef.current = 0;

    initializePlayerAndPlay();

    return () => {
      console.log(`Cleaning up usePlaySound for state: ${stateName}`);
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      // Do not reset or stop the player here to avoid uninitialization
    };
  }, [stateName, interval, selectedAudios]);

  // Note: This hook does not return anything. Ensure you call it within a component.
};

export default usePlaySound;
