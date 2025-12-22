import { Habit, HabitStats, OverallStats, CellData, Routine, RoutineStats, SubHabit } from '@/types/habit';

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

export const getDayNumber = (dateKey: string, startDate: string): number => {
  const date = new Date(dateKey);
  const start = new Date(startDate);
  const diffTime = date.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Day 1 is the start date
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

export const calculateHabitStats = (habit: Habit | SubHabit, days: number, startDate?: string): HabitStats => {
  const today = new Date();
  const dates: string[] = [];
  
  if (startDate) {
    // Use routine start date for calculation
    const start = new Date(startDate);
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      if (date <= today) {
        dates.push(getDateKey(date));
      }
    }
  } else {
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(getDateKey(date));
    }
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

export const calculateRoutineStats = (routine: Routine): RoutineStats => {
  const today = new Date();
  const startDate = new Date(routine.startDate);
  const daysElapsed = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const daysRemaining = Math.max(0, routine.duration - daysElapsed);
  
  // Get all habits including sub-habits
  const allHabits: (Habit | SubHabit)[] = [];
  routine.habits.forEach(habit => {
    allHabits.push(habit);
    if (habit.subHabits) {
      allHabits.push(...habit.subHabits);
    }
  });
  
  if (allHabits.length === 0) {
    return {
      overallConsistency: 0,
      averageCompletionStrength: 0,
      momentum: 'stable',
      totalHabits: 0,
      daysElapsed: Math.min(daysElapsed, routine.duration),
      daysRemaining,
    };
  }
  
  // Calculate stats across all habits
  const dates = getDatesInRange(routine.startDate, Math.min(daysElapsed, routine.duration));
  let totalCompletions = 0;
  let totalPossible = 0;
  let totalDensity = 0;
  let densityCount = 0;
  
  dates.forEach(dateKey => {
    if (new Date(dateKey) <= today) {
      allHabits.forEach(habit => {
        totalPossible++;
        const cell = habit.cells[dateKey];
        if (cell?.completed) {
          totalCompletions++;
          totalDensity += cell.strokeDensity;
          densityCount++;
        }
      });
    }
  });
  
  // Calculate weekly consistency for momentum
  const weeklyConsistency: number[] = [];
  for (let week = 0; week < 4; week++) {
    let weekCompletions = 0;
    let weekPossible = 0;
    
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (week * 7 + day));
      const dateKey = getDateKey(date);
      
      if (date >= startDate && date <= today) {
        allHabits.forEach(habit => {
          weekPossible++;
          if (habit.cells[dateKey]?.completed) {
            weekCompletions++;
          }
        });
      }
    }
    
    if (weekPossible > 0) {
      weeklyConsistency.unshift(Math.round((weekCompletions / weekPossible) * 100));
    }
  }
  
  // Determine momentum
  let momentum: 'improving' | 'stable' | 'declining' = 'stable';
  if (weeklyConsistency.length >= 2) {
    const recentAvg = weeklyConsistency.slice(-2).reduce((a, b) => a + b, 0) / 2;
    const olderAvg = weeklyConsistency.slice(0, Math.min(2, weeklyConsistency.length)).reduce((a, b) => a + b, 0) / 2;
    
    if (recentAvg > olderAvg + 10) {
      momentum = 'improving';
    } else if (recentAvg < olderAvg - 10) {
      momentum = 'declining';
    }
  }
  
  return {
    overallConsistency: totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0,
    averageCompletionStrength: densityCount > 0 ? Math.round(totalDensity / densityCount) : 0,
    momentum,
    totalHabits: routine.habits.length,
    daysElapsed: Math.min(daysElapsed, routine.duration),
    daysRemaining,
  };
};

export const calculateOverallStats = (habits: Habit[]): OverallStats => {
  const today = new Date();
  const weeklyConsistency: number[] = [];
  const heatMap: Record<string, number> = {};
  
  // Get all habits including sub-habits
  const allHabits: (Habit | SubHabit)[] = [];
  habits.forEach(habit => {
    allHabits.push(habit);
    if (habit.subHabits) {
      allHabits.push(...habit.subHabits);
    }
  });
  
  // Calculate weekly consistency for last 4 weeks
  for (let week = 0; week < 4; week++) {
    let weekCompletions = 0;
    let weekPossible = 0;
    
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (week * 7 + day));
      const dateKey = getDateKey(date);
      
      allHabits.forEach(habit => {
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
    
    allHabits.forEach(habit => {
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

// Calculate effective completion strength for a parent habit including sub-habits
export const calculateParentCompletionStrength = (
  habit: Habit,
  dateKey: string
): { completed: boolean; effectiveDensity: number } => {
  const parentCell = habit.cells[dateKey];
  const parentDensity = parentCell?.strokeDensity || 0;
  const parentCompleted = parentCell?.completed || false;
  
  if (!habit.subHabits || habit.subHabits.length === 0) {
    return { completed: parentCompleted, effectiveDensity: parentDensity };
  }
  
  // Calculate weighted average with sub-habits
  let totalDensity = parentDensity;
  let completedCount = parentCompleted ? 1 : 0;
  let totalCount = 1;
  
  habit.subHabits.forEach(subHabit => {
    const subCell = subHabit.cells[dateKey];
    totalCount++;
    if (subCell?.completed) {
      completedCount++;
      totalDensity += subCell.strokeDensity;
    }
  });
  
  return {
    completed: completedCount > 0,
    effectiveDensity: completedCount > 0 ? Math.round(totalDensity / completedCount) : 0,
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

export const formatShortDate = (dateKey: string): string => {
  const date = new Date(dateKey);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getTimeOfDayColor = (timeOfDay: 'morning' | 'evening' | 'anytime'): string => {
  switch (timeOfDay) {
    case 'morning': return 'text-morning';
    case 'evening': return 'text-evening';
    default: return 'text-anytime';
  }
};
