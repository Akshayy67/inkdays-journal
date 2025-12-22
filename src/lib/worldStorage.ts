import { WorldState, JournalState, InsaneStateProgress, defaultWorldState, MilestoneUnlocks, TimeCapsule, defaultMilestoneUnlocks } from '@/types/world';

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
          unlocks: {
            ...defaultMilestoneUnlocks,
            ...state.insaneProgress?.unlocks,
          },
          timeCapsules: state.insaneProgress?.timeCapsules || [],
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

export const updateMilestoneUnlocks = (
  worldState: WorldState,
  updates: Partial<MilestoneUnlocks>
): WorldState => {
  const newState = {
    ...worldState,
    insaneProgress: {
      ...worldState.insaneProgress,
      unlocks: {
        ...worldState.insaneProgress.unlocks,
        ...updates,
      },
    },
  };
  saveWorldState(newState);
  return newState;
};

export const addTimeCapsule = (
  worldState: WorldState,
  message: string
): WorldState => {
  const newCapsule: TimeCapsule = {
    id: Date.now().toString(),
    message,
    createdAt: Date.now(),
    createdAtDay: worldState.insaneProgress.currentDay,
    isOpened: false,
  };
  
  const newState = {
    ...worldState,
    insaneProgress: {
      ...worldState.insaneProgress,
      timeCapsules: [...worldState.insaneProgress.timeCapsules, newCapsule],
    },
  };
  saveWorldState(newState);
  return newState;
};

export const calculateConsistencyDays = (routines: any[]): number => {
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
