import React from 'react';
import { Habit, AppSettings } from '@/types/habit';
import { calculateHabitStats, calculateOverallStats, getDateKey } from '@/lib/habitUtils';
import { X, TrendingUp, TrendingDown, Minus, Flame, Target, Activity } from 'lucide-react';
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
import { Line, Bar } from 'react-chartjs-2';

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
  habits: Habit[];
  settings: AppSettings;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  isOpen,
  onClose,
  habits,
  settings,
}) => {
  const overallStats = calculateOverallStats(habits);

  const getMomentumIcon = () => {
    switch (overallStats.momentum) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-primary" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getMomentumLabel = () => {
    switch (overallStats.momentum) {
      case 'improving': return 'Improving';
      case 'declining': return 'Declining';
      default: return 'Stable';
    }
  };

  const weeklyChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Consistency',
        data: overallStats.weeklyConsistency,
        borderColor: 'hsl(175, 35%, 45%)',
        backgroundColor: 'hsla(175, 35%, 45%, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'hsl(175, 35%, 45%)',
      },
    ],
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

  // Heat map data for last 14 days
  const heatMapDays = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return getDateKey(date);
  });

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
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-foreground">Analytics</h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Momentum indicator */}
            <div className="stat-card mb-6">
              <div className="flex items-center gap-3">
                {getMomentumIcon()}
                <div>
                  <p className="text-sm text-muted-foreground">Momentum</p>
                  <p className="text-lg font-semibold text-foreground">{getMomentumLabel()}</p>
                </div>
              </div>
            </div>

            {/* Weekly consistency chart */}
            <div className="stat-card mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Weekly Consistency</h3>
              <div className="h-48">
                <Line data={weeklyChartData} options={chartOptions} />
              </div>
            </div>

            {/* Heat intensity map */}
            <div className="stat-card mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Heat Intensity (Last 14 Days)</h3>
              <div className="grid grid-cols-7 gap-1">
                {heatMapDays.map(dateKey => {
                  const intensity = overallStats.heatMap[dateKey] || 0;
                  const opacity = intensity / 100;
                  return (
                    <div
                      key={dateKey}
                      className="aspect-square rounded-sm transition-all"
                      style={{
                        backgroundColor: `hsla(175, 35%, 45%, ${Math.max(0.1, opacity)})`,
                      }}
                      title={`${dateKey}: ${intensity}% intensity`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Per-habit stats */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Per Habit</h3>
              {habits.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No habits to analyze yet.
                </p>
              ) : (
                habits.map(habit => {
                  const stats = calculateHabitStats(habit, 30);
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
                            <p className="text-xs text-muted-foreground">Avg Intensity</p>
                            <p className="text-sm font-semibold text-foreground">{stats.averageStrokeDensity}%</p>
                          </div>
                        </div>
                        {!settings.silentMode && (
                          <>
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-morning" />
                              <div>
                                <p className="text-xs text-muted-foreground">Current Streak</p>
                                <p className="text-sm font-semibold text-foreground">{stats.currentStreak} days</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-evening" />
                              <div>
                                <p className="text-xs text-muted-foreground">Longest Streak</p>
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
