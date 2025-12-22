import React from 'react';
import { Habit, CellData, AppSettings } from '@/types/habit';
import { getDatesInRange, isMissedDay, getDateKey } from '@/lib/habitUtils';
import DrawingCell from './DrawingCell';
import { Trash2, Sun, Moon, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface HabitRowProps {
  habit: Habit;
  dates: string[];
  settings: AppSettings;
  isErasing: boolean;
  onCellUpdate: (habitId: string, dateKey: string, strokes: any[], density: number) => void;
  onDeleteHabit: (habitId: string) => void;
}

const HabitRow: React.FC<HabitRowProps> = ({
  habit,
  dates,
  settings,
  isErasing,
  onCellUpdate,
  onDeleteHabit,
}) => {
  const today = getDateKey(new Date());

  const getTimeIcon = () => {
    switch (habit.timeOfDay) {
      case 'morning': return <Sun className="w-3 h-3 text-morning" />;
      case 'evening': return <Moon className="w-3 h-3 text-evening" />;
      default: return <Clock className="w-3 h-3 text-anytime" />;
    }
  };

  const getTimeColor = () => {
    switch (habit.timeOfDay) {
      case 'morning': return 'hsl(35, 60%, 50%)';
      case 'evening': return 'hsl(250, 40%, 50%)';
      default: return 'hsl(175, 35%, 45%)';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      <div className="w-32 flex-shrink-0 flex items-center gap-2 pr-2">
        <button
          onClick={() => onDeleteHabit(habit.id)}
          className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all"
        >
          <Trash2 className="w-3 h-3" />
        </button>
        {getTimeIcon()}
        <span className="text-sm text-foreground truncate font-medium">{habit.name}</span>
      </div>
      
      <div className="flex gap-1">
        {dates.map(dateKey => {
          const cell = habit.cells[dateKey];
          const isPressured = settings.pressureMode && isMissedDay(dateKey, cell);
          const isFuture = dateKey > today;
          
          return (
            <div
              key={dateKey}
              className={`
                w-12 h-12 rounded-sm border transition-all duration-200
                ${cell?.completed 
                  ? 'border-primary/30 bg-cell-completed' 
                  : isPressured 
                    ? 'border-destructive/30 bg-cell-pressure' 
                    : 'border-border/30 bg-cell-empty'
                }
                ${isFuture ? 'opacity-40' : ''}
              `}
            >
              <DrawingCell
                strokes={cell?.strokes || []}
                completed={cell?.completed || false}
                isErasing={isErasing}
                noUndoMode={settings.noUndoMode}
                isPressured={isPressured}
                timeColor={getTimeColor()}
                disabled={isFuture}
                onStrokesChange={(strokes, density) => {
                  onCellUpdate(habit.id, dateKey, strokes, density);
                }}
              />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

interface HabitGridProps {
  habits: Habit[];
  startDate: string;
  daysVisible: number;
  settings: AppSettings;
  isErasing: boolean;
  onCellUpdate: (habitId: string, dateKey: string, strokes: any[], density: number) => void;
  onDeleteHabit: (habitId: string) => void;
}

const HabitGridComponent: React.FC<HabitGridProps> = ({
  habits,
  startDate,
  daysVisible,
  settings,
  isErasing,
  onCellUpdate,
  onDeleteHabit,
}) => {
  const dates = getDatesInRange(startDate, daysVisible);
  const today = getDateKey(new Date());

  const formatDayLabel = (dateKey: string) => {
    const date = new Date(dateKey);
    const isToday = dateKey === today;
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2),
      num: date.getDate(),
      isToday,
    };
  };

  return (
    <div className="floating-panel p-4 animate-scale-in">
      {/* Header with day labels */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-32 flex-shrink-0" />
        <div className="flex gap-1">
          {dates.map(dateKey => {
            const { day, num, isToday } = formatDayLabel(dateKey);
            return (
              <div
                key={dateKey}
                className={`
                  w-12 flex flex-col items-center justify-center text-xs
                  ${isToday ? 'text-primary' : 'text-muted-foreground'}
                `}
              >
                <span className="font-medium">{day}</span>
                <span className={isToday ? 'font-bold' : ''}>{num}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Habit rows */}
      <div className="flex flex-col gap-2 group">
        {habits.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">No habits yet.</p>
            <p className="text-xs mt-1">Add your first habit to start tracking.</p>
          </div>
        ) : (
          habits.map(habit => (
            <HabitRow
              key={habit.id}
              habit={habit}
              dates={dates}
              settings={settings}
              isErasing={isErasing}
              onCellUpdate={onCellUpdate}
              onDeleteHabit={onDeleteHabit}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HabitGridComponent;
