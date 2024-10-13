// src/config/SpenModule.ts
import { NativeModules } from 'react-native';

const { SpenModule } = NativeModules;

export default {
  connect: (callback: (arg: any) => void) => SpenModule.connect(callback),
  disconnect: () => SpenModule.disconnect(),
  startMotionTracking: () => SpenModule.startMotionTracking(),
};
