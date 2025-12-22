import { WorldState, JournalState, InsaneStateProgress, defaultWorldState } from '@/types/world';

const WORLD_STORAGE_KEY = 'inkdays-world-state';

export const loadWorldState = (): WorldState => {
  try {
    const stored = localStorage.getItem(WORLD_STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored);
      return {
        ...defaultWorldState,
        ...state,
        journalState: {
          ...defaultWorldState.journalState,
          ...state.journalState,
        },
        insaneProgress: {
          ...defaultWorldState.insaneProgress,
          ...state.insaneProgress,
        },
      };
    }
    return defaultWorldState;
  } catch (error) {
    console.error('Failed to load world state:', error);
    return defaultWorldState;
  }
};

export const saveWorldState = (state: WorldState): void => {
  try {
    localStorage.setItem(WORLD_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save world state:', error);
  }
};

export const updateJournalState = (
  worldState: WorldState,
  updates: Partial<JournalState>
): WorldState => {
  const newState = {
    ...worldState,
    journalState: {
      ...worldState.journalState,
      ...updates,
    },
  };
  saveWorldState(newState);
  return newState;
};

export const updateInsaneProgress = (
  worldState: WorldState,
  updates: Partial<InsaneStateProgress>
): WorldState => {
  const newState = {
    ...worldState,
    insaneProgress: {
      ...worldState.insaneProgress,
      ...updates,
    },
  };
  saveWorldState(newState);
  return newState;
};

export const calculateConsistencyDays = (routines: any[]): number => {
  // Calculate total consecutive days of consistency across all routines
  let totalConsistentDays = 0;
  
  routines.forEach(routine => {
    if (!routine.habits || routine.habits.length === 0) return;
    
    const dates = Object.keys(routine.habits[0]?.cells || {}).sort();
    let consecutiveDays = 0;
    
    for (const date of dates) {
      const allComplete = routine.habits.every((h: any) => h.cells[date]?.completed);
      if (allComplete) {
        consecutiveDays++;
      } else {
        totalConsistentDays += consecutiveDays;
        consecutiveDays = 0;
      }
    }
    totalConsistentDays += consecutiveDays;
  });
  
  return totalConsistentDays;
};
