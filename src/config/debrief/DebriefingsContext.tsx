// src/config/debrief/DebriefingsContext.tsx

import { createContext } from 'react';
import { Debriefing } from '../../types/Debriefing';

interface DebriefingsContextProps {
  debriefings: Debriefing[];
  addDebriefing: (debriefing: Debriefing) => Promise<void>;
  removeDebriefing: (id: string) => Promise<void>;
  // You can add more functions like updateDebriefing if needed
}

export const DebriefingsContext = createContext<DebriefingsContextProps>({
  debriefings: [],
  addDebriefing: async () => {},
  removeDebriefing: async () => {},
});
