import React, { useMemo } from 'react';
import { Routine } from '@/types/habit';
import { getDateKey, getDatesInRange } from '@/lib/habitUtils';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Activity, Calendar, Flame } from 'lucide-react';

interface ReviewIslandProps {
  routine?: Routine;
  allRoutines: Routine[];
}

const ReviewIsland: React.FC<ReviewIslandProps> = ({ routine, allRoutines }) => {
  const analytics = useMemo(() => {
    if (!routine) return null;
    
    const dates = getDatesInRange(routine.startDate, routine.duration);
    const today = getDateKey(new Date());
    const pastDates = dates.filter(d => d <= today);
    
    // Calculate weekly completion rates
    const weeks: { week: number; rate: number }[] = [];
    for (let i = 0; i < Math.ceil(pastDates.length / 7); i++) {
      const weekDates = pastDates.slice(i * 7, (i + 1) * 7);
      let completed = 0;
      let total = 0;
      
      weekDates.forEach(date => {
        routine.habits.forEach(habit => {
          total++;
          if (habit.cells[date]?.completed) completed++;
        });
      });
      
      weeks.push({ week: i + 1, rate: total > 0 ? Math.round((completed / total) * 100) : 0 });
    }
    
    // Calculate momentum
    const recentWeeks = weeks.slice(-3);
    let momentum: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentWeeks.length >= 2) {
      const trend = recentWeeks[recentWeeks.length - 1].rate - recentWeeks[0].rate;
      if (trend > 10) momentum = 'improving';
      else if (trend < -10) momentum = 'declining';
    }
    
    // Current streak
    let currentStreak = 0;
    for (let i = pastDates.length - 1; i >= 0; i--) {
      const date = pastDates[i];
      const allComplete = routine.habits.every(h => h.cells[date]?.completed);
      if (allComplete) currentStreak++;
      else break;
    }
    
    return { weeks, momentum, currentStreak, totalDays: pastDates.length };
  }, [routine]);

  if (!analytics) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Choose a routine to see insights</p>
      </div>
    );
  }

  const MomentumIcon = analytics.momentum === 'improving' ? TrendingUp : 
                       analytics.momentum === 'declining' ? TrendingDown : Minus;

  const momentumColor = analytics.momentum === 'improving' ? 'text-green-500' : 
                        analytics.momentum === 'declining' ? 'text-orange-400' : 'text-muted-foreground';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="floating-panel p-8">
        {/* Island header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Review Island</h2>
          <p className="text-muted-foreground text-sm">A quiet place to observe your journey</p>
        </div>

        {/* Momentum indicator */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-8 p-4 rounded-xl bg-secondary/50"
        >
          <MomentumIcon className={`w-6 h-6 ${momentumColor}`} />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Momentum</p>
            <p className={`text-lg font-medium capitalize ${momentumColor}`}>{analytics.momentum}</p>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="stat-card text-center"
          >
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{analytics.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Day streak</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="stat-card text-center"
          >
            <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{analytics.totalDays}</p>
            <p className="text-xs text-muted-foreground">Days tracked</p>
          </motion.div>
        </div>

        {/* Weekly flow visualization */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Weekly Flow
          </h3>
          <div className="flex items-end gap-2 h-24">
            {analytics.weeks.map((week, index) => (
              <motion.div
                key={week.week}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(week.rate, 5)}%` }}
                transition={{ delay: 0.6 + index * 0.05, duration: 0.4 }}
                className="flex-1 rounded-t-sm bg-primary/40 hover:bg-primary/60 transition-colors relative group"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {week.rate}%
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">Week 1</span>
            <span className="text-[10px] text-muted-foreground">Week {analytics.weeks.length}</span>
          </div>
        </motion.div>

        {/* Gentle message */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-muted-foreground mt-8 italic"
        >
          "Every day you show up is a day you grew."
        </motion.p>
      </div>
    </motion.div>
  );
};

export default ReviewIsland;
