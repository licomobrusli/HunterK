// usePlaySound.ts
import { useEffect } from 'react';
import Sound from 'react-native-sound';

const usePlaySound = (soundFile: any, intervalDuration: number) => {
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const playSound = () => {
      const sound = new Sound(soundFile, (error) => {
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

    // Set interval to play sound
    intervalId = setInterval(() => {
      playSound();
    }, intervalDuration);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [soundFile, intervalDuration]);
};

export default usePlaySound;
