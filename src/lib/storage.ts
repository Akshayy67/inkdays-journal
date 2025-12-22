import { openDB, IDBPDatabase } from 'idb';
import { AppState, HabitGrid, Habit, CellData, AppSettings, Routine, SubHabit } from '@/types/habit';

const DB_NAME = 'inkdays-db';
const DB_VERSION = 2;
const STORE_NAME = 'app-state';

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
};

const defaultSettings: AppSettings = {
  pressureMode: false,
  noUndoMode: false,
  silentMode: false,
  zoom: 1,
  panOffset: { x: 0, y: 0 },
};

const createDefaultRoutine = (): Routine => ({
  id: crypto.randomUUID(),
  name: 'My First Routine',
  habits: [],
  startDate: new Date().toISOString().split('T')[0],
  duration: 30,
  position: { x: 100, y: 100 },
  createdAt: Date.now(),
});

// Legacy grid creator for backward compatibility
const createDefaultGrid = (): HabitGrid => ({
  id: crypto.randomUUID(),
  habits: [],
  startDate: new Date().toISOString().split('T')[0],
  daysVisible: 7,
  position: { x: 100, y: 100 },
});

const defaultState: AppState = {
  grids: [],
  routines: [createDefaultRoutine()],
  settings: defaultSettings,
};

// Migrate legacy grids to routines
const migrateState = (state: any): AppState => {
  const migrated: AppState = {
    grids: state.grids || [],
    routines: state.routines || [],
    settings: { ...defaultSettings, ...state.settings },
    activeRoutineId: state.activeRoutineId,
  };

  // If there are legacy grids but no routines, convert them
  if (migrated.grids.length > 0 && migrated.routines.length === 0) {
    migrated.routines = migrated.grids.map((grid, index) => ({
      id: grid.id,
      name: `Routine ${index + 1}`,
      habits: grid.habits.map(h => ({ ...h, subHabits: [], isExpanded: true })),
      startDate: grid.startDate,
      duration: grid.daysVisible,
      position: grid.position,
      createdAt: Date.now(),
    }));
  }

  // Ensure at least one routine exists
  if (migrated.routines.length === 0) {
    migrated.routines = [createDefaultRoutine()];
  }

  // Set active routine if not set
  if (!migrated.activeRoutineId) {
    migrated.activeRoutineId = migrated.routines[0].id;
  }

  // Ensure all habits have subHabits array
  migrated.routines = migrated.routines.map(routine => ({
    ...routine,
    habits: routine.habits.map(habit => ({
      ...habit,
      subHabits: habit.subHabits || [],
      isExpanded: habit.isExpanded !== false,
    })),
  }));

  return migrated;
};

export const loadState = async (): Promise<AppState> => {
  try {
    const db = await getDB();
    const state = await db.get(STORE_NAME, 'state');
    if (state) {
      return migrateState(state);
    }
    return defaultState;
  } catch (error) {
    console.error('Failed to load state:', error);
    return defaultState;
  }
};

export const saveState = async (state: AppState): Promise<void> => {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, state, 'state');
  } catch (error) {
    console.error('Failed to save state:', error);
  }
};

export const addRoutine = async (
  state: AppState,
  routine: Omit<Routine, 'id' | 'createdAt' | 'habits'>
): Promise<AppState> => {
  const newRoutine: Routine = {
    ...routine,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    habits: [],
  };

  const newState = {
    ...state,
    routines: [...state.routines, newRoutine],
    activeRoutineId: newRoutine.id,
  };
  
  await saveState(newState);
  return newState;
};

export const updateRoutine = async (
  state: AppState,
  routineId: string,
  updates: Partial<Routine>
): Promise<AppState> => {
  const newState = {
    ...state,
    routines: state.routines.map(r =>
      r.id === routineId ? { ...r, ...updates } : r
    ),
  };
  
  await saveState(newState);
  return newState;
};

export const deleteRoutine = async (
  state: AppState,
  routineId: string
): Promise<AppState> => {
  const newRoutines = state.routines.filter(r => r.id !== routineId);
  
  // Ensure at least one routine exists
  if (newRoutines.length === 0) {
    newRoutines.push(createDefaultRoutine());
  }
  
  const newState = {
    ...state,
    routines: newRoutines,
    activeRoutineId: newRoutines[0].id,
  };
  
  await saveState(newState);
  return newState;
};

export const updateHabitCell = async (
  state: AppState,
  routineId: string,
  habitId: string,
  dateKey: string,
  cellData: Partial<CellData>,
  subHabitId?: string
): Promise<AppState> => {
  const newState = { ...state };
  const routine = newState.routines.find(r => r.id === routineId);
  if (!routine) return state;

  const habit = routine.habits.find(h => h.id === habitId);
  if (!habit) return state;

  // Update sub-habit cell if specified
  if (subHabitId) {
    const subHabit = habit.subHabits?.find(sh => sh.id === subHabitId);
    if (subHabit) {
      const existingCell = subHabit.cells[dateKey] || {
        strokes: [],
        completed: false,
        strokeDensity: 0,
      };
      subHabit.cells[dateKey] = { ...existingCell, ...cellData };
    }
  } else {
    // Update main habit cell
    const existingCell = habit.cells[dateKey] || {
      strokes: [],
      completed: false,
      strokeDensity: 0,
    };
    habit.cells[dateKey] = { ...existingCell, ...cellData };
  }

  await saveState(newState);
  return newState;
};

export const addHabit = async (
  state: AppState,
  routineId: string,
  habit: Omit<Habit, 'id' | 'createdAt' | 'cells' | 'subHabits' | 'isExpanded'>,
  parentHabitId?: string
): Promise<AppState> => {
  const newState = { ...state };
  const routine = newState.routines.find(r => r.id === routineId);
  if (!routine) return state;

  if (parentHabitId) {
    // Adding as sub-habit
    const parentHabit = routine.habits.find(h => h.id === parentHabitId);
    if (!parentHabit) return state;

    const newSubHabit: SubHabit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      cells: {},
    };

    parentHabit.subHabits = [...(parentHabit.subHabits || []), newSubHabit];
  } else {
    // Adding as main habit
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      cells: {},
      subHabits: [],
      isExpanded: true,
    };

    routine.habits.push(newHabit);
  }

  await saveState(newState);
  return newState;
};

export const deleteHabit = async (
  state: AppState,
  routineId: string,
  habitId: string,
  subHabitId?: string
): Promise<AppState> => {
  const newState = { ...state };
  const routine = newState.routines.find(r => r.id === routineId);
  if (!routine) return state;

  if (subHabitId) {
    // Delete sub-habit
    const habit = routine.habits.find(h => h.id === habitId);
    if (habit && habit.subHabits) {
      habit.subHabits = habit.subHabits.filter(sh => sh.id !== subHabitId);
    }
  } else {
    // Delete main habit
    routine.habits = routine.habits.filter(h => h.id !== habitId);
  }

  await saveState(newState);
  return newState;
};

export const toggleHabitExpanded = async (
  state: AppState,
  routineId: string,
  habitId: string
): Promise<AppState> => {
  const newState = { ...state };
  const routine = newState.routines.find(r => r.id === routineId);
  if (!routine) return state;

  const habit = routine.habits.find(h => h.id === habitId);
  if (habit) {
    habit.isExpanded = !habit.isExpanded;
  }

  await saveState(newState);
  return newState;
};

export const updateSettings = async (
  state: AppState,
  settings: Partial<AppSettings>
): Promise<AppState> => {
  const newState = {
    ...state,
    settings: { ...state.settings, ...settings },
  };
  await saveState(newState);
  return newState;
};

export const setActiveRoutine = async (
  state: AppState,
  routineId: string
): Promise<AppState> => {
  const newState = {
    ...state,
    activeRoutineId: routineId,
  };
  await saveState(newState);
  return newState;
};

export const exportData = (): void => {
  loadState().then(state => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inkdays-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
};
