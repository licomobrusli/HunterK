import { useEffect, useContext, useRef } from 'react';
import TrackPlayer, { Capability } from 'react-native-track-player';
import RNFS from 'react-native-fs';
import BackgroundTimer from 'react-native-background-timer';
import { IntervalContext } from '../contexts/SceneProvider';

let isTrackPlayerSetup = false;

const usePlaySound = (stateName: string, interval: number, onComplete: () => void) => {
  const { selectedAudios } = useContext(IntervalContext);
  const audioIndexRef = useRef(0);
  const totalPlayCountRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const AUDIOS_FOLDER = `${RNFS.DocumentDirectoryPath}/audios`;

  // Implement the stopAudioAndCleanup function
  const stopAudioAndCleanup = async () => {
    try {
      // Stop audio playback
      console.log('Stopping audio playback and clearing interval');
      await TrackPlayer.stop();

      // Clear the interval timer
      if (intervalRef.current !== null) {
        BackgroundTimer.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  useEffect(() => {
    return () => {
      stopAudioAndCleanup();
      console.log('usePlaySound: Cleanup on unmount');
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const setupTrackPlayer = async () => {
      if (!isTrackPlayerSetup) {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
          compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
          alwaysPauseOnInterruption: false,
        });
        isTrackPlayerSetup = true;
        console.log('TrackPlayer initialized.');
      }
    };

    const playSound = async () => {
      if (!isMounted) {return;}

      const stateData = selectedAudios[stateName.toLowerCase()];
      if (!stateData || stateData.audios.length === 0) {
        console.log(`No audios selected for state: ${stateName}`);
        return;
      }

      const { audios, mode, repetitions } = stateData;
      const maxRepetitions = repetitions || Infinity;

      if (totalPlayCountRef.current >= maxRepetitions) {
        console.log(`Reached max repetitions (${maxRepetitions}) for state: ${stateName}`);
        onComplete();
        return;
      }

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

      const currentAudioPath = `${AUDIOS_FOLDER}/${stateName.toLowerCase()}/${currentAudioFileName}`;
      try {
        const fileExists = await RNFS.exists(currentAudioPath);
        if (!fileExists) {
          console.log(`Audio file does not exist: ${currentAudioPath}`);
          return;
        }

        await TrackPlayer.reset();
        await TrackPlayer.add({
          id: `${stateName}-${audioIndexRef.current}-${totalPlayCountRef.current}`,
          url: `file://${currentAudioPath}`,
          title: 'State Audio',
          artist: 'Your App',
        });
        await TrackPlayer.play();
        console.log(`Playing audio for state: ${stateName}`);

        totalPlayCountRef.current += 1;
        console.log(`Play count for state "${stateName}": ${totalPlayCountRef.current}`);
      } catch (error) {
        console.error('Error playing audio file:', error);
      }
    };

    const initializePlayerAndPlay = async () => {
      await setupTrackPlayer();
      await playSound();

      if (intervalRef.current !== null) {
        BackgroundTimer.clearInterval(intervalRef.current);
      }

      intervalRef.current = BackgroundTimer.setInterval(() => {
        console.log(`Interval triggered for state: ${stateName}`);
        playSound();
      }, interval);

      console.log(`Interval set for state: ${stateName} with interval ${interval}ms`);
    };

    audioIndexRef.current = 0;
    totalPlayCountRef.current = 0;
    initializePlayerAndPlay();

    return () => {
      isMounted = false;
      if (intervalRef.current !== null) {
        BackgroundTimer.clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log(`Interval cleared for state: ${stateName}`);
      }
    };
  }, [stateName, interval, selectedAudios, AUDIOS_FOLDER, onComplete]);

  return null;
};

export default usePlaySound;
