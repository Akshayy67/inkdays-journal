import { openDB, IDBPDatabase } from 'idb';
import { AppState, HabitGrid, Habit, CellData, AppSettings } from '@/types/habit';

const DB_NAME = 'inkdays-db';
const DB_VERSION = 1;
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

const createDefaultGrid = (): HabitGrid => ({
  id: crypto.randomUUID(),
  habits: [],
  startDate: new Date().toISOString().split('T')[0],
  daysVisible: 7,
  position: { x: 100, y: 100 },
});

const defaultState: AppState = {
  grids: [createDefaultGrid()],
  settings: defaultSettings,
};

export const loadState = async (): Promise<AppState> => {
  try {
    const db = await getDB();
    const state = await db.get(STORE_NAME, 'state');
    if (state) {
      return {
        ...defaultState,
        ...state,
        settings: { ...defaultSettings, ...state.settings },
      };
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

export const updateHabitCell = async (
  state: AppState,
  gridId: string,
  habitId: string,
  dateKey: string,
  cellData: Partial<CellData>
): Promise<AppState> => {
  const newState = { ...state };
  const grid = newState.grids.find(g => g.id === gridId);
  if (!grid) return state;

  const habit = grid.habits.find(h => h.id === habitId);
  if (!habit) return state;

  const existingCell = habit.cells[dateKey] || {
    strokes: [],
    completed: false,
    strokeDensity: 0,
  };

  habit.cells[dateKey] = { ...existingCell, ...cellData };
  await saveState(newState);
  return newState;
};

export const addHabit = async (
  state: AppState,
  gridId: string,
  habit: Omit<Habit, 'id' | 'createdAt' | 'cells'>
): Promise<AppState> => {
  const newState = { ...state };
  const grid = newState.grids.find(g => g.id === gridId);
  if (!grid) return state;

  const newHabit: Habit = {
    ...habit,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    cells: {},
  };

  grid.habits.push(newHabit);
  await saveState(newState);
  return newState;
};

export const deleteHabit = async (
  state: AppState,
  gridId: string,
  habitId: string
): Promise<AppState> => {
  const newState = { ...state };
  const grid = newState.grids.find(g => g.id === gridId);
  if (!grid) return state;

  grid.habits = grid.habits.filter(h => h.id !== habitId);
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
