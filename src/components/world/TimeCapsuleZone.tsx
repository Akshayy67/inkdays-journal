import React from 'react';
import { motion } from 'framer-motion';
import { TimeCapsule } from '@/types/world';
import TimeCapsules from './TimeCapsules';
import { Mail, ArrowLeft } from 'lucide-react';

interface TimeCapsuleZoneProps {
  capsules: TimeCapsule[];
  currentDay: number;
  hasReached: boolean;
  onAddCapsule: (message: string) => void;
  onBack: () => void;
}

const TimeCapsuleZone: React.FC<TimeCapsuleZoneProps> = ({
  capsules,
  currentDay,
  hasReached,
  onAddCapsule,
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Time Capsules</h2>
            <p className="text-sm text-muted-foreground">Messages to your future self</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <TimeCapsules
        capsules={capsules}
        currentDay={currentDay}
        hasReached={hasReached}
        onAddCapsule={onAddCapsule}
      />
    </motion.div>
  );
};

export default TimeCapsuleZone;
