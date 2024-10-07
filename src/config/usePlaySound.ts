// usePlaySound.ts
import { useEffect, useRef } from 'react';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';

const defaultAudioFiles: { [key: string]: any } = {
  active: require('../assets/audio/Active/active.mp3'),
  spotted: require('../assets/audio/Spotted/spotted.mp3'),
  proximity: require('../assets/audio/Proximity/proximity.mp3'),
  trigger: require('../assets/audio/Trigger/trigger.mp3'),
};

// Global registry to track active sounds per state
const activeSounds = new Set<string>();

const usePlaySound = (stateName: string, intervalDuration: number) => {
  console.log(`usePlaySound initialized for state: ${stateName}`);

  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Sound | null>(null);
  const isUnmountedRef = useRef(false);
  const isPlayingRef = useRef(false); // Flag to indicate if playback is ongoing

  useEffect(() => {
    if (activeSounds.has(stateName)) {
      console.log(`usePlaySound already active for state: ${stateName}`);
      return;
    }

    activeSounds.add(stateName);

    isUnmountedRef.current = false;

    const getSoundFile = async (): Promise<string | number | undefined> => {
      const stateFolderPath = `${RNFS.DocumentDirectoryPath}/${stateName}`;

      try {
        const dirExists = await RNFS.exists(stateFolderPath);
        console.log(`Directory ${stateFolderPath} exists: ${dirExists}`);

        if (dirExists) {
          const files = await RNFS.readDir(stateFolderPath);
          const mp3Files = files.filter(
            (file) => file.isFile() && file.name.endsWith('.mp3')
          );

          if (mp3Files.length > 0) {
            const sortedFiles = mp3Files.sort(
              (a, b) => (b.ctime?.getTime() || 0) - (a.ctime?.getTime() || 0)
            );
            const latestFile = sortedFiles[0];
            console.log(`Latest custom audio file found: ${latestFile.path}`);
            return latestFile.path;
          } else {
            console.log(`No custom recordings found. Using default for ${stateName}`);
            return defaultAudioFiles[stateName.toLowerCase()];
          }
        } else {
          console.log(`Directory not found. Using default for ${stateName}`);
          return defaultAudioFiles[stateName.toLowerCase()];
        }
      } catch (error) {
        console.error('Error accessing custom audio files:', error);
        return defaultAudioFiles[stateName.toLowerCase()];
      }
    };

    const playSound = async () => {
      if (isUnmountedRef.current) {return;}

      if (isPlayingRef.current) {
        console.log('Playback already in progress. Skipping this playSound call.');
        return;
      }

      const soundFile = await getSoundFile();

      if (!soundFile) {
        console.warn(`No audio file found for state: ${stateName}`);
        return;
      }

      const isBundledAsset = typeof soundFile !== 'string';

      // Introduce a short delay to ensure the file is accessible
      setTimeout(() => {
        soundRef.current = new Sound(
          soundFile,
          isBundledAsset ? Sound.MAIN_BUNDLE : Sound.DOCUMENT, // Use Sound.DOCUMENT for custom audio
          (error) => {
            if (error) {
              console.log('Failed to load sound:', error);
              // Schedule the next playback after intervalDuration
              if (!isUnmountedRef.current) {
                timeoutIdRef.current = setTimeout(playSound, intervalDuration);
              }
              return;
            }

            console.log('Sound loaded successfully:', soundFile);
            isPlayingRef.current = true;

            soundRef.current?.play((success) => {
              if (!success) {
                console.log('Sound playback failed');
              } else {
                console.log('Sound playback succeeded');
              }
              soundRef.current?.release();
              soundRef.current = null;
              isPlayingRef.current = false;

              if (!isUnmountedRef.current) {
                // Schedule the next playback after intervalDuration
                timeoutIdRef.current = setTimeout(playSound, intervalDuration);
              }
            });
          }
        );
      }, 500); // 500ms delay
    };

    // Start the playback chain
    playSound();

    // Cleanup function
    return () => {
      isUnmountedRef.current = true;

      // Clear any pending timeouts
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }

      // Stop and release any playing sound
      if (soundRef.current) {
        soundRef.current.stop(() => {
          soundRef.current?.release();
          soundRef.current = null;
        });
      }

      // Remove from active sounds
      activeSounds.delete(stateName);
    };
  }, [stateName, intervalDuration]);

  return null; // Since it's a hook, no return value
};

export default usePlaySound;
