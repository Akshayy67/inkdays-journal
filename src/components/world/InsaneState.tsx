import React, { useMemo } from 'react';
import { InsaneStateProgress } from '@/types/world';
import { motion } from 'framer-motion';
import InsaneState3D from './InsaneState3D';
import DailyWisdom from './DailyWisdom';

interface InsaneStateProps {
  progress: InsaneStateProgress;
  onExplore: () => void;
}

const InsaneState: React.FC<InsaneStateProps> = ({ progress, onExplore }) => {
  const hasReached = progress.currentDay >= progress.targetDays;
  const evolutionTier = Math.min(Math.floor(progress.currentDay / 10), 5);
  
  const visualProgress = useMemo(() => {
    const ratio = Math.min(progress.currentDay / progress.targetDays, 1);
    return 1 - Math.pow(1 - ratio, 4);
  }, [progress.currentDay, progress.targetDays]);

  const daysRemaining = Math.max(0, progress.targetDays - progress.currentDay);

  // Reached and exploring
  if (hasReached && progress.isExploring) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="w-full min-h-[800px] relative space-y-8 pb-12"
      >
        <InsaneState3D evolutionTier={5} visualProgress={1} hasReached={true} />
        
        {/* Personal title display */}
        {progress.unlocks.personalTitle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <span className="text-xl font-bold text-primary">{progress.unlocks.personalTitle}</span>
          </motion.div>
        )}
        
        <div className="max-w-2xl mx-auto space-y-8 px-4">
          <DailyWisdom currentDay={progress.currentDay} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30"
          >
            <p className="text-muted-foreground text-sm">
              Explore the <strong>Milestone Rewards</strong>, <strong>Time Capsules</strong>, and <strong>Flame Shrine</strong> 
              {' '}using the <strong>Others</strong> button in the navigator.
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Just reached
  if (hasReached) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3 }}
        className="w-full min-h-[700px] flex flex-col items-center justify-center"
      >
        <InsaneState3D evolutionTier={5} visualProgress={1} hasReached={true} />
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          onClick={onExplore}
          className="mt-8 px-6 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-foreground transition-all"
        >
          Enter
        </motion.button>
      </motion.div>
    );
  }

  // Unreached state - the journey
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-h-[700px] relative space-y-6 pb-12"
    >
      <InsaneState3D evolutionTier={evolutionTier} visualProgress={visualProgress} hasReached={false} />
      
      {/* Days counter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border">
          <span className="text-2xl font-bold text-foreground">{daysRemaining} days to reach insane</span>
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto space-y-6 px-4">
        <DailyWisdom currentDay={progress.currentDay} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center p-4 rounded-xl bg-secondary/50 border border-border"
        >
          <p className="text-muted-foreground text-sm">
            Use the <strong>Others</strong> button to explore Milestone Rewards, Time Capsules, and your Flame Shrine.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InsaneState;
