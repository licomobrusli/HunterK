// hooks/useLogcatListener.ts
import { useEffect, useRef } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';

const { LogcatModule } = NativeModules;

interface LogcatEvent {
  eventName: string;
  timestamp: number;
}

const useLogcatListener = (onEvent: (event: LogcatEvent) => void) => {
  const listenerStartTimeRef = useRef<number>(0);

  useEffect(() => {
    const logcatEventEmitter = new NativeEventEmitter(LogcatModule);
    const logcatListener = logcatEventEmitter.addListener('LogcatEvent', (event: LogcatEvent) => {
      if (event.timestamp < listenerStartTimeRef.current) {
        console.log(`Ignoring old event: ${event.eventName} at ${event.timestamp}`);
        return;
      }
      onEvent(event);
    });

    LogcatModule.startListening()
      .then((message: string) => {
        console.log(`LogcatModule: ${message}`);
        listenerStartTimeRef.current = Date.now();
      })
      .catch((error: any) => console.warn(`Error starting logcat listener: ${error}`));

    return () => {
      logcatListener.remove();
      LogcatModule.stopListening()
        .then((message: string) => console.log(`LogcatModule: ${message}`))
        .catch((error: any) => console.warn(`Error stopping logcat listener: ${error}`));
    };
  }, [onEvent]);
};

export default useLogcatListener;
