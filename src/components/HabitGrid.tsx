import React from 'react';
import { Habit, SubHabit, CellData, AppSettings, Routine } from '@/types/habit';
import { getDatesInRange, isMissedDay, getDateKey, getDayNumber, formatShortDate, calculateParentCompletionStrength } from '@/lib/habitUtils';
import DrawingCell from './DrawingCell';
import { Trash2, Sun, Moon, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SubHabitRowProps {
  subHabit: SubHabit;
  parentHabitId: string;
  dates: string[];
  settings: AppSettings;
  isErasing: boolean;
  onCellUpdate: (habitId: string, dateKey: string, strokes: any[], density: number, subHabitId?: string) => void;
  onDeleteSubHabit: (habitId: string, subHabitId: string) => void;
}

const SubHabitRow: React.FC<SubHabitRowProps> = ({
  subHabit,
  parentHabitId,
  dates,
  settings,
  isErasing,
  onCellUpdate,
  onDeleteSubHabit,
}) => {
  const today = getDateKey(new Date());

  const getTimeColor = () => {
    switch (subHabit.timeOfDay) {
      case 'morning': return 'hsl(35, 60%, 50%)';
      case 'evening': return 'hsl(250, 40%, 50%)';
      default: return 'hsl(175, 35%, 45%)';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-2 pl-6 border-l border-border/30 ml-4"
    >
      <div className="w-[200px] flex-shrink-0 flex items-center gap-2 pr-2">
        <button
          onClick={() => onDeleteSubHabit(parentHabitId, subHabit.id)}
          className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all flex-shrink-0"
        >
          <Trash2 className="w-2.5 h-2.5" />
        </button>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{subHabit.name}</span>
      </div>
      
      <div className="flex gap-1 flex-shrink-0">
        {dates.map(dateKey => {
          const cell = subHabit.cells[dateKey];
          const isPressured = settings.pressureMode && isMissedDay(dateKey, cell);
          const isFuture = dateKey > today;
          
          return (
            <div
              key={dateKey}
              className={`
                w-10 h-10 flex-shrink-0 rounded-sm border-2 transition-all duration-200
                ${cell?.completed 
                  ? 'border-primary/50 bg-cell-completed' 
                  : isPressured 
                    ? 'border-destructive/40 bg-cell-pressure' 
                    : 'border-border bg-cell-empty'
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
                  onCellUpdate(parentHabitId, dateKey, strokes, density, subHabit.id);
                }}
              />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

interface HabitRowProps {
  habit: Habit;
  dates: string[];
  settings: AppSettings;
  isErasing: boolean;
  onCellUpdate: (habitId: string, dateKey: string, strokes: any[], density: number, subHabitId?: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onDeleteSubHabit: (habitId: string, subHabitId: string) => void;
  onToggleExpanded: (habitId: string) => void;
}

const HabitRow: React.FC<HabitRowProps> = ({
  habit,
  dates,
  settings,
  isErasing,
  onCellUpdate,
  onDeleteHabit,
  onDeleteSubHabit,
  onToggleExpanded,
}) => {
  const today = getDateKey(new Date());
  const hasSubHabits = habit.subHabits && habit.subHabits.length > 0;

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
    <div className="space-y-1">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <div className="w-[200px] flex-shrink-0 flex items-center gap-1 pr-2">
          {hasSubHabits && (
            <button
              onClick={() => onToggleExpanded(habit.id)}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              {habit.isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
          {!hasSubHabits && <div className="w-4 flex-shrink-0" />}
          <button
            onClick={() => onDeleteHabit(habit.id)}
            className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all flex-shrink-0"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <span className="flex-shrink-0">{getTimeIcon()}</span>
          <span className="text-sm text-foreground font-medium whitespace-nowrap">{habit.name}</span>
        </div>
        
        <div className="flex gap-1 flex-shrink-0">
          {dates.map(dateKey => {
            const cell = habit.cells[dateKey];
            const isPressured = settings.pressureMode && isMissedDay(dateKey, cell);
            const isFuture = dateKey > today;
            
            // Calculate effective strength including sub-habits
            const { effectiveDensity } = calculateParentCompletionStrength(habit, dateKey);
            const hasSubHabitActivity = hasSubHabits && effectiveDensity > (cell?.strokeDensity || 0);
            
            return (
              <div
                key={dateKey}
                className={`
                  w-12 h-12 flex-shrink-0 rounded-sm border-2 transition-all duration-200 relative
                  ${cell?.completed 
                    ? 'border-primary/60 bg-cell-completed' 
                    : isPressured 
                      ? 'border-destructive/50 bg-cell-pressure' 
                      : 'border-border bg-cell-empty'
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
                {/* Sub-habit indicator */}
                {hasSubHabitActivity && (
                  <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary/60" />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
      
      {/* Sub-habits */}
      <AnimatePresence>
        {hasSubHabits && habit.isExpanded && (
          <div className="space-y-1">
            {habit.subHabits!.map(subHabit => (
              <SubHabitRow
                key={subHabit.id}
                subHabit={subHabit}
                parentHabitId={habit.id}
                dates={dates}
                settings={settings}
                isErasing={isErasing}
                onCellUpdate={onCellUpdate}
                onDeleteSubHabit={onDeleteSubHabit}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface HabitGridProps {
  routine: Routine;
  settings: AppSettings;
  isErasing: boolean;
  onCellUpdate: (habitId: string, dateKey: string, strokes: any[], density: number, subHabitId?: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onDeleteSubHabit: (habitId: string, subHabitId: string) => void;
  onToggleExpanded: (habitId: string) => void;
}

const HabitGridComponent: React.FC<HabitGridProps> = ({
  routine,
  settings,
  isErasing,
  onCellUpdate,
  onDeleteHabit,
  onDeleteSubHabit,
  onToggleExpanded,
}) => {
  const dates = getDatesInRange(routine.startDate, routine.duration);
  const today = getDateKey(new Date());

  return (
    <div className="floating-panel p-4 animate-scale-in border-2 border-border">
      {/* Routine header */}
      <div className="mb-4 pb-3 border-b border-border/30">
        <h2 className="text-lg font-semibold text-foreground">{routine.name}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {routine.duration} day journey • Started {formatShortDate(routine.startDate)}
        </p>
      </div>
      
      {/* Scrollable content area */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-max">
          {/* Header with day labels */}
          <div className="flex items-end gap-2 mb-3">
            <div className="w-[200px] flex-shrink-0" />
            <div className="flex gap-1">
              {dates.map(dateKey => {
                const dayNum = getDayNumber(dateKey, routine.startDate);
                const isToday = dateKey === today;
                const isFuture = dateKey > today;
                
                return (
                  <div
                    key={dateKey}
                    className={`
                      w-12 flex-shrink-0 flex flex-col items-center justify-center
                      ${isFuture ? 'opacity-40' : ''}
                    `}
                  >
                    {/* Day number - primary */}
                    <span className={`
                      text-sm font-bold
                      ${isToday ? 'text-primary' : 'text-foreground'}
                    `}>
                      {dayNum}
                    </span>
                    {/* Calendar date - secondary/muted */}
                    <span className={`
                      text-[10px] leading-tight whitespace-nowrap
                      ${isToday ? 'text-primary/70' : 'text-muted-foreground/60'}
                    `}>
                      {formatShortDate(dateKey)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Habit rows */}
          <div className="flex flex-col gap-2 group">
            {routine.habits.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-sm">No habits yet.</p>
                <p className="text-xs mt-1">Add your first habit to start tracking.</p>
              </div>
            ) : (
              routine.habits.map(habit => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  dates={dates}
                  settings={settings}
                  isErasing={isErasing}
                  onCellUpdate={onCellUpdate}
                  onDeleteHabit={onDeleteHabit}
                  onDeleteSubHabit={onDeleteSubHabit}
                  onToggleExpanded={onToggleExpanded}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitGridComponent;
