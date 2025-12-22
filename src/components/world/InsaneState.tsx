import React, { useMemo } from 'react';
import { InsaneStateProgress, MilestoneUnlocks } from '@/types/world';
import { motion } from 'framer-motion';
import InsaneState3D from './InsaneState3D';
import MilestoneRewards from './MilestoneRewards';
import TimeCapsules from './TimeCapsules';
import DailyWisdom from './DailyWisdom';
import StreakFlame from './StreakFlame';

interface InsaneStateProps {
  progress: InsaneStateProgress;
  onExplore: () => void;
  onUpdateUnlocks?: (updates: Partial<MilestoneUnlocks>) => void;
  onAddTimeCapsule?: (message: string) => void;
}

const InsaneState: React.FC<InsaneStateProps> = ({ progress, onExplore, onUpdateUnlocks, onAddTimeCapsule }) => {
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
          
          <div className="flex justify-center">
            <StreakFlame 
              flameStrength={100} 
              consecutiveStreak={progress.consecutiveStreak} 
              hasReached={true} 
            />
          </div>
          
          <TimeCapsules 
            capsules={progress.timeCapsules} 
            currentDay={progress.currentDay} 
            hasReached={true}
            onAddCapsule={onAddTimeCapsule || (() => {})}
          />
          
          <MilestoneRewards 
            currentDay={progress.currentDay} 
            unlocks={progress.unlocks} 
            onUpdateUnlocks={onUpdateUnlocks || (() => {})} 
          />
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
        
        <div className="flex justify-center">
          <StreakFlame 
            flameStrength={progress.flameStrength} 
            consecutiveStreak={progress.consecutiveStreak} 
            hasReached={false} 
          />
        </div>
        
        <TimeCapsules 
          capsules={progress.timeCapsules} 
          currentDay={progress.currentDay} 
          hasReached={false}
          onAddCapsule={onAddTimeCapsule || (() => {})}
        />
        
        <MilestoneRewards 
          currentDay={progress.currentDay} 
          unlocks={progress.unlocks} 
          onUpdateUnlocks={onUpdateUnlocks || (() => {})} 
        />
      </div>
    </motion.div>
  );
};

export default InsaneState;
