import React from 'react';
import { Routine, AppSettings } from '@/types/habit';
import { calculateHabitStats, calculateRoutineStats, getDateKey } from '@/lib/habitUtils';
import { X, TrendingUp, TrendingDown, Minus, Flame, Target, Activity, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler
);

interface AnalyticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  routine?: Routine;
  settings: AppSettings;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  isOpen,
  onClose,
  routine,
  settings,
}) => {
  if (!routine) return null;

  const routineStats = calculateRoutineStats(routine);

  const getMomentumIcon = () => {
    switch (routineStats.momentum) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-primary" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getMomentumLabel = () => {
    switch (routineStats.momentum) {
      case 'improving': return 'Improving';
      case 'declining': return 'Declining';
      default: return 'Stable';
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'hsl(220, 10%, 10%)',
        titleColor: 'hsl(220, 10%, 92%)',
        bodyColor: 'hsl(220, 10%, 92%)',
        borderColor: 'hsl(220, 10%, 18%)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { color: 'hsla(220, 10%, 18%, 0.5)' },
        ticks: { color: 'hsl(220, 10%, 55%)' },
      },
      y: {
        grid: { color: 'hsla(220, 10%, 18%, 0.5)' },
        ticks: { color: 'hsl(220, 10%, 55%)' },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{routine.name}</h2>
                <p className="text-xs text-muted-foreground mt-1">Routine Analytics</p>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Routine progress */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="stat-card">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Day</p>
                    <p className="text-lg font-bold text-foreground">
                      {routineStats.daysElapsed} <span className="text-sm font-normal text-muted-foreground">/ {routine.duration}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="text-lg font-bold text-foreground">{routineStats.daysRemaining} days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Momentum */}
            <div className="stat-card mb-6">
              <div className="flex items-center gap-3">
                {getMomentumIcon()}
                <div>
                  <p className="text-sm text-muted-foreground">Momentum</p>
                  <p className="text-lg font-semibold text-foreground">{getMomentumLabel()}</p>
                </div>
              </div>
            </div>

            {/* Consistency & Strength */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="stat-card">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Consistency</p>
                    <p className="text-lg font-bold text-foreground">{routineStats.overallConsistency}%</p>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Strength</p>
                    <p className="text-lg font-bold text-foreground">{routineStats.averageCompletionStrength}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Per-habit stats */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Per Habit</h3>
              {routine.habits.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No habits to analyze yet.
                </p>
              ) : (
                routine.habits.map(habit => {
                  const stats = calculateHabitStats(habit, routine.duration, routine.startDate);
                  return (
                    <div key={habit.id} className="stat-card">
                      <h4 className="font-medium text-foreground mb-3">{habit.name}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Completion</p>
                            <p className="text-sm font-semibold text-foreground">{stats.completionRate}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Intensity</p>
                            <p className="text-sm font-semibold text-foreground">{stats.averageStrokeDensity}%</p>
                          </div>
                        </div>
                        {!settings.silentMode && (
                          <>
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-morning" />
                              <div>
                                <p className="text-xs text-muted-foreground">Current</p>
                                <p className="text-sm font-semibold text-foreground">{stats.currentStreak} days</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-evening" />
                              <div>
                                <p className="text-xs text-muted-foreground">Best</p>
                                <p className="text-sm font-semibold text-foreground">{stats.longestStreak} days</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnalyticsPanel;
