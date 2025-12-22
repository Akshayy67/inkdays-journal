import React from 'react';
import { motion } from 'framer-motion';
import { MilestoneUnlocks } from '@/types/world';
import MilestoneRewards from './MilestoneRewards';
import { Crown, ArrowLeft } from 'lucide-react';

interface MilestonesZoneProps {
  currentDay: number;
  unlocks: MilestoneUnlocks;
  onUpdateUnlocks: (updates: Partial<MilestoneUnlocks>) => void;
  onBack: () => void;
}

const MilestonesZone: React.FC<MilestonesZoneProps> = ({
  currentDay,
  unlocks,
  onUpdateUnlocks,
  onBack,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="floating-panel p-8 max-w-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-400/20 border border-amber-500/30">
            <Crown className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Milestone Rewards</h2>
            <p className="text-sm text-muted-foreground">Unlock abilities as you progress</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <MilestoneRewards
        currentDay={currentDay}
        unlocks={unlocks}
        onUpdateUnlocks={onUpdateUnlocks}
      />
    </motion.div>
  );
};

export default MilestonesZone;
