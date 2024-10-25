import { useEffect, useContext, useRef } from 'react';
import TrackPlayer, { Capability } from 'react-native-track-player';
import RNFS from 'react-native-fs';
import BackgroundTimer from 'react-native-background-timer'; // Use BackgroundTimer for intervals
import { IntervalContext } from '../contexts/SceneProvider';

let isTrackPlayerSetup = false;

const usePlaySound = (stateName: string, interval: number) => {
  const { selectedAudios } = useContext(IntervalContext);
  const audioIndexRef = useRef(0);
  const intervalRef = useRef<number | null>(null); // Use background timer's interval reference

  const AUDIOS_FOLDER = `${RNFS.DocumentDirectoryPath}/audios`;

  useEffect(() => {
    let isMounted = true;

    const setupTrackPlayer = async () => {
      if (!isTrackPlayerSetup) {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
          compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
          alwaysPauseOnInterruption: false, // Allows ducking instead of pausing
        });
        isTrackPlayerSetup = true;
        console.log('TrackPlayer initialized with background mode enabled.');
      }
    };

    const playSound = async () => {
      if (!isMounted) {return;}

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
        const randomIndex = Math.floor(Math.random() * audios.length);
        currentAudioFileName = audios[randomIndex];
      } else if (mode === 'A-Z') {
        const sortedAudios = [...audios].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        currentAudioFileName = sortedAudios[audioIndexRef.current];
        audioIndexRef.current = (audioIndexRef.current + 1) % sortedAudios.length;
      } else if (mode === 'Selected') {
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

      const currentAudioPath = `${AUDIOS_FOLDER}/${stateName.toLowerCase()}/${currentAudioFileName}`;
      console.log(`Current audio path for state ${stateName}: ${currentAudioPath}`);

      try {
        const fileExists = await RNFS.exists(currentAudioPath);
        console.log(`File exists at ${currentAudioPath}: ${fileExists}`);
        if (!fileExists) {
          console.log(`Audio file does not exist: ${currentAudioPath}`);
          return;
        }

        console.log('Resetting TrackPlayer before playing...');
        await TrackPlayer.reset();

        await TrackPlayer.add({
          id: `${stateName}-${audioIndexRef.current}`,
          url: `file://${currentAudioPath}`,
          title: 'State Audio',
          artist: 'Your App',
        });

        await TrackPlayer.play();
        console.log(`Playing audio for state: ${stateName}`);
      } catch (error) {
        console.error('Error playing audio file:', error);
      }
    };

    const initializePlayerAndPlay = async () => {
      await setupTrackPlayer();
      await playSound();

      // Clear any previous interval to avoid overlap
      if (intervalRef.current !== null) {
        BackgroundTimer.clearInterval(intervalRef.current);
        console.log('Previous interval cleared.');
      }

      intervalRef.current = BackgroundTimer.setInterval(() => {
        console.log(`Interval triggered for state: ${stateName}`);
        playSound();
      }, interval);

      console.log(`Interval set for state: ${stateName} with interval ${interval}ms`);
    };

    audioIndexRef.current = 0; // Reset index for new state
    initializePlayerAndPlay();

    return () => {
      console.log(`Cleaning up usePlaySound for state: ${stateName}`);
      isMounted = false;
      if (intervalRef.current !== null) {
        BackgroundTimer.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [stateName, interval, selectedAudios, AUDIOS_FOLDER]);

  return null; // This hook does not return anything
};

export default usePlaySound;
