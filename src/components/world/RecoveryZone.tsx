import React from 'react';
import { Habit, RecoveryState } from '@/types/habit';
import { motion } from 'framer-motion';
import { Heart, RefreshCw, ArrowRight, Leaf } from 'lucide-react';

interface RecoveryZoneProps {
  habits: Habit[];
  onRestart: (habitId: string) => void;
  onContinue: (habitId: string) => void;
}

interface HabitRecoveryState {
  habit: Habit;
  missedDays: number;
  lastCompleted?: string;
}

const RecoveryZone: React.FC<RecoveryZoneProps> = ({ habits, onRestart, onContinue }) => {
  // Find habits that need gentle recovery (missed 3+ consecutive days)
  const needsRecovery: HabitRecoveryState[] = habits.map(habit => {
    const dates = Object.keys(habit.cells).sort().reverse();
    let missedDays = 0;
    let lastCompleted: string | undefined;
    
    for (const date of dates) {
      if (habit.cells[date]?.completed) {
        lastCompleted = date;
        break;
      }
      missedDays++;
    }
    
    return { habit, missedDays, lastCompleted };
  }).filter(h => h.missedDays >= 3);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="floating-panel p-8 bg-gradient-to-b from-card to-card/80">
        {/* Gentle header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart className="w-10 h-10 text-primary/60 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Recovery Zone</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Life happens. This is a gentle space to reconnect with your habits, without judgment.
          </p>
        </div>

        {/* Recovery items */}
        {needsRecovery.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Leaf className="w-12 h-12 text-primary/40 mx-auto mb-4" />
            <p className="text-muted-foreground">
              All is well. You're doing great.
            </p>
            <p className="text-sm text-muted-foreground/60 mt-2">
              This space is here whenever you need a gentle restart.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {needsRecovery.map((item, index) => (
              <motion.div
                key={item.habit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-5 rounded-xl bg-secondary/30 border border-border/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-foreground">{item.habit.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Paused for {item.missedDays} days
                    </p>
                  </div>
                </div>
                
                {/* Show intent if available */}
                {item.habit.intent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <p className="text-xs text-muted-foreground mb-1">You wrote:</p>
                    <p className="text-sm text-foreground/80 italic">"{item.habit.intent}"</p>
                  </motion.div>
                )}

                {/* Gentle options */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onContinue(item.habit.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary text-foreground text-sm transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Continue where you left off
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onRestart(item.habit.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border/50 hover:bg-secondary/30 text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Fresh start
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Compassionate message */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground/60 italic">
            "Pausing is not failing. Returning is always welcome."
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RecoveryZone;
