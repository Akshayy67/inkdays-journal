import { Habit, HabitStats, OverallStats, CellData } from '@/types/habit';

export const getDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDatesInRange = (startDate: string, days: number): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(getDateKey(date));
  }
  
  return dates;
};

export const calculateStrokeDensity = (strokes: { points: { x: number; y: number }[] }[]): number => {
  if (strokes.length === 0) return 0;
  
  let totalPoints = 0;
  strokes.forEach(stroke => {
    totalPoints += stroke.points.length;
  });
  
  // Normalize to 0-100 scale (assuming max ~500 points for dense fill)
  return Math.min(100, Math.round((totalPoints / 500) * 100));
};

export const calculateHabitStats = (habit: Habit, days: number): HabitStats => {
  const today = new Date();
  const dates: string[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(getDateKey(date));
  }
  
  let completions = 0;
  let totalDensity = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  dates.forEach((dateKey, index) => {
    const cell = habit.cells[dateKey];
    if (cell?.completed) {
      completions++;
      totalDensity += cell.strokeDensity;
      tempStreak++;
      
      if (index === dates.length - 1 || dates.length - 1 - index <= tempStreak) {
        currentStreak = tempStreak;
      }
      
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      if (index < dates.length - 1) {
        tempStreak = 0;
      }
    }
  });
  
  return {
    completionRate: dates.length > 0 ? Math.round((completions / dates.length) * 100) : 0,
    averageStrokeDensity: completions > 0 ? Math.round(totalDensity / completions) : 0,
    longestStreak,
    currentStreak,
    totalCompletions: completions,
  };
};

export const calculateOverallStats = (habits: Habit[]): OverallStats => {
  const today = new Date();
  const weeklyConsistency: number[] = [];
  const heatMap: Record<string, number> = {};
  
  // Calculate weekly consistency for last 4 weeks
  for (let week = 0; week < 4; week++) {
    let weekCompletions = 0;
    let weekPossible = 0;
    
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (week * 7 + day));
      const dateKey = getDateKey(date);
      
      habits.forEach(habit => {
        weekPossible++;
        if (habit.cells[dateKey]?.completed) {
          weekCompletions++;
        }
      });
    }
    
    weeklyConsistency.unshift(weekPossible > 0 ? Math.round((weekCompletions / weekPossible) * 100) : 0);
  }
  
  // Calculate heat map for last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = getDateKey(date);
    
    let dayDensity = 0;
    let count = 0;
    
    habits.forEach(habit => {
      const cell = habit.cells[dateKey];
      if (cell?.completed) {
        dayDensity += cell.strokeDensity;
        count++;
      }
    });
    
    heatMap[dateKey] = count > 0 ? Math.round(dayDensity / count) : 0;
  }
  
  // Determine momentum
  const recentAvg = weeklyConsistency.slice(-2).reduce((a, b) => a + b, 0) / 2;
  const olderAvg = weeklyConsistency.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
  
  let momentum: 'improving' | 'stable' | 'declining';
  if (recentAvg > olderAvg + 10) {
    momentum = 'improving';
  } else if (recentAvg < olderAvg - 10) {
    momentum = 'declining';
  } else {
    momentum = 'stable';
  }
  
  return {
    weeklyConsistency,
    heatMap,
    momentum,
  };
};

export const isMissedDay = (dateKey: string, cell: CellData | undefined): boolean => {
  const today = getDateKey(new Date());
  return dateKey < today && (!cell || !cell.completed);
};

export const formatDate = (dateKey: string): string => {
  const date = new Date(dateKey);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const getTimeOfDayColor = (timeOfDay: 'morning' | 'evening' | 'anytime'): string => {
  switch (timeOfDay) {
    case 'morning': return 'text-morning';
    case 'evening': return 'text-evening';
    default: return 'text-anytime';
  }
};
