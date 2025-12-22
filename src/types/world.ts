export type ZoneType = 'center' | 'review' | 'insane' | 'focus' | 'journal' | 'recovery' | 'zen-garden';

export interface WorldZone {
  id: ZoneType;
  name: string;
  position: { x: number; y: number };
  description: string;
}

export interface JournalPage {
  id: string;
  content: string;
  drawings: string[]; // Base64 or SVG paths
  createdAt: number;
  period?: string; // Auto-associated time period
}

export interface JournalState {
  pages: JournalPage[];
  currentPage: number;
}

// Milestone unlocks tracking
export interface MilestoneUnlocks {
  day10Theme: boolean;      // Custom theme color
  day20Particles: boolean;  // Special particle effects
  day30Sounds: boolean;     // Ambient sounds
  day40Title: boolean;      // Personal title
  day50Crown: boolean;      // Insane Crown + Zen Garden access
  customTheme?: string;     // Selected theme color
  selectedSound?: 'lofi' | 'nature' | 'cosmic' | null;
  personalTitle?: string;
}

// Time capsule message
export interface TimeCapsule {
  id: string;
  message: string;
  createdAt: number;
  createdAtDay: number;
  isOpened: boolean;
}

// Daily wisdom quote
export interface DailyQuote {
  day: number;
  quote: string;
  author?: string;
}

export interface InsaneStateProgress {
  currentDay: number;
  targetDays: number; // 50
  reachedAt?: number;
  isExploring: boolean;
  // New additions
  unlocks: MilestoneUnlocks;
  timeCapsules: TimeCapsule[];
  flameStrength: number; // 0-100, grows with consistency, shrinks with misses
  lastFlameUpdate?: number;
  consecutiveStreak: number; // Current consecutive days
}

export interface FocusGame {
  id: string;
  name: string;
  type: 'breathing' | 'patterns' | 'stillness';
}

export interface WorldState {
  currentZone: ZoneType;
  journalState: JournalState;
  insaneProgress: InsaneStateProgress;
  visitedZones: ZoneType[];
}

export const ZONE_POSITIONS: Record<ZoneType, { x: number; y: number }> = {
  center: { x: 0, y: 0 },
  review: { x: 0, y: -1200 },
  insane: { x: 0, y: -2800 },
  focus: { x: 0, y: -4200 },
  journal: { x: -2000, y: 0 },
  recovery: { x: 0, y: 1500 },
  'zen-garden': { x: 0, y: -5600 },
};

export const defaultMilestoneUnlocks: MilestoneUnlocks = {
  day10Theme: false,
  day20Particles: false,
  day30Sounds: false,
  day40Title: false,
  day50Crown: false,
  customTheme: undefined,
  selectedSound: null,
  personalTitle: undefined,
};

export const defaultWorldState: WorldState = {
  currentZone: 'center',
  journalState: {
    pages: [],
    currentPage: 0,
  },
  insaneProgress: {
    currentDay: 0,
    targetDays: 50,
    isExploring: false,
    unlocks: defaultMilestoneUnlocks,
    timeCapsules: [],
    flameStrength: 0,
    consecutiveStreak: 0,
  },
  visitedZones: ['center'],
};
