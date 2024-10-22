// src/config/playbackService.ts

import TrackPlayer, { Event } from 'react-native-track-player';

const playbackService = async () => {
  // Handle remote control events
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.reset();
  });

  // Handle audio focus changes (ducking)
  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    if (event.permanent) {
      // Permanent loss of audio focus, pause playback
      await TrackPlayer.pause();
      console.log('Audio focus permanently lost. Pausing playback.');
    } else {
      if (event.paused) {
        // Temporary loss of audio focus, lower volume (duck)
        await TrackPlayer.setVolume(0.5); // Lower volume to 50%
        console.log('Audio focus temporarily lost. Lowering volume to 50%.');
      } else {
        // Audio focus regained, restore volume
        await TrackPlayer.setVolume(1.0); // Restore volume to 100%
        console.log('Audio focus regained. Restoring volume to 100%.');
      }
    }
  });
};

export default playbackService;
