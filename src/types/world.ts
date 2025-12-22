export type ZoneType = 'center' | 'review' | 'insane' | 'focus' | 'journal' | 'recovery';

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

export interface InsaneStateProgress {
  currentDay: number;
  targetDays: number; // 500
  reachedAt?: number;
  isExploring: boolean;
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
};

export const defaultWorldState: WorldState = {
  currentZone: 'center',
  journalState: {
    pages: [],
    currentPage: 0,
  },
  insaneProgress: {
    currentDay: 0,
    targetDays: 500,
    isExploring: false,
  },
  visitedZones: ['center'],
};
