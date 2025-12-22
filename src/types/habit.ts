export type TimeOfDay = 'morning' | 'evening' | 'anytime';
export type RoutineType = 'permanent' | 'seasonal' | 'temporary';

export interface Stroke {
  points: { x: number; y: number }[];
  timestamp: number;
}

export interface CellData {
  strokes: Stroke[];
  completed: boolean;
  strokeDensity: number; // 0-100
  completedAt?: number;
  timeOfDay?: TimeOfDay;
}

export interface SubHabit {
  id: string;
  name: string;
  timeOfDay: TimeOfDay;
  createdAt: number;
  cells: Record<string, CellData>; // key = date string (YYYY-MM-DD)
  intent?: string; // "Why does this matter to you?"
}

export interface Habit {
  id: string;
  name: string;
  timeOfDay: TimeOfDay;
  createdAt: number;
  cells: Record<string, CellData>; // key = date string (YYYY-MM-DD)
  subHabits?: SubHabit[];
  isExpanded?: boolean;
  intent?: string; // "Why does this matter to you?"
}

export interface WeeklyReflection {
  weekNumber: number; // Week 1, 2, 3, etc. from start date
  content: string;
  createdAt: number;
}

export interface Routine {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  duration: number; // days
  habits: Habit[];
  position: { x: number; y: number };
  createdAt: number;
  routineType: RoutineType;
  reflections?: WeeklyReflection[];
  celebrationShown?: boolean; // Track if completion celebration was shown
  endDate?: string; // For seasonal/temporary routines
}

// Legacy type for backward compatibility
export interface HabitGrid {
  id: string;
  habits: Habit[];
  startDate: string; // YYYY-MM-DD
  daysVisible: number;
  position: { x: number; y: number };
}

export interface AppSettings {
  pressureMode: boolean;
  noUndoMode: boolean;
  silentMode: boolean;
  zoom: number;
  panOffset: { x: number; y: number };
}

export interface AppState {
  grids: HabitGrid[]; // Legacy - kept for backward compatibility
  routines: Routine[];
  settings: AppSettings;
  activeRoutineId?: string;
}

export interface HabitStats {
  completionRate: number;
  averageStrokeDensity: number;
  longestStreak: number;
  currentStreak: number;
  totalCompletions: number;
}

export interface RoutineStats {
  overallConsistency: number;
  averageCompletionStrength: number;
  momentum: 'improving' | 'stable' | 'declining';
  totalHabits: number;
  daysElapsed: number;
  daysRemaining: number;
}

export interface OverallStats {
  weeklyConsistency: number[];
  heatMap: Record<string, number>;
  momentum: 'improving' | 'stable' | 'declining';
}

// Recovery state for gentle failure handling
export interface RecoveryState {
  habitId: string;
  habitName: string;
  consecutiveMissedDays: number;
  lastCompletedDate?: string;
  intent?: string;
}
