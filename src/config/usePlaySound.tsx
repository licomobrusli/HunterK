import { useEffect, useContext, useRef } from 'react';
import TrackPlayer, { Capability, Event } from 'react-native-track-player'; // Import Event
import RNFS from 'react-native-fs';
import { IntervalContext } from '../contexts/SceneProvider';

let isTrackPlayerSetup = false;

// Move AUDIOS_FOLDER outside the component
const AUDIOS_FOLDER = `${RNFS.DocumentDirectoryPath}/audios`;

const usePlaySound = (stateName: string, interval: number, onComplete: () => void) => {
  const { selectedAudios } = useContext(IntervalContext);
  const audioIndexRef = useRef(0);
  const totalPlayCountRef = useRef(0);

  // Use a ref to store onComplete
  const onCompleteRef = useRef(onComplete);

  // Update the ref if onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let isMounted = true;

    // Define stopAudioAndCleanup inside useEffect
    const stopAudioAndCleanup = async () => {
      try {
        console.log('Stopping audio playback');
        await TrackPlayer.stop();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    };

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
      if (!isMounted) {
        return;
      }

      const stateData = selectedAudios[stateName.toLowerCase()];
      if (!stateData || stateData.audios.length === 0) {
        console.log(`No audios selected for state: ${stateName}`);
        return;
      }

      const { audios, mode, repetitions } = stateData;
      const maxRepetitions = repetitions || Infinity;

      if (totalPlayCountRef.current >= maxRepetitions) {
        console.log(`Reached max repetitions (${maxRepetitions}) for state: ${stateName}`);
        onCompleteRef.current();
        return;
      }

      let currentAudioFileName: string | undefined;
      if (mode === 'Random') {
        const randomIndex = Math.floor(Math.random() * audios.length);
        currentAudioFileName = audios[randomIndex];
      } else if (mode === 'A-Z') {
        const sortedAudios = [...audios].sort((a, b) =>
          a.toLowerCase().localeCompare(b.toLowerCase())
        );
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

        // Wait for playback to finish
        await new Promise<void>((resolve) => {
          const sub = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
            console.log(`Playback ended for state: ${stateName}`);
            sub.remove();
            resolve();
          });
        });

        totalPlayCountRef.current += 1;
        console.log(`Play count for state "${stateName}": ${totalPlayCountRef.current}`);

        // Wait for 'interval' milliseconds
        await new Promise<void>((resolve) => setTimeout(resolve, interval));

        // Recursively call playSound
        if (isMounted) {
          playSound();
        }
      } catch (error) {
        console.error('Error playing audio file:', error);
      }
    };

    const initializePlayerAndPlay = async () => {
      await setupTrackPlayer();
      await playSound();
    };

    audioIndexRef.current = 0;
    totalPlayCountRef.current = 0;
    initializePlayerAndPlay();

    return () => {
      isMounted = false;
      stopAudioAndCleanup();
      console.log(`usePlaySound unmounted for state: ${stateName}`);
    };
  }, [stateName, interval, selectedAudios]);

  return null;
};

export default usePlaySound;
