import React from 'react';
import { motion } from 'framer-motion';
import StreakFlame from './StreakFlame';
import { Flame, ArrowLeft } from 'lucide-react';

interface FlameShrineZoneProps {
  flameStrength: number;
  consecutiveStreak: number;
  hasReached: boolean;
  onBack: () => void;
}

const FlameShrineZone: React.FC<FlameShrineZoneProps> = ({
  flameStrength,
  consecutiveStreak,
  hasReached,
  onBack,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="floating-panel p-8 max-w-md"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Flame Shrine</h2>
            <p className="text-sm text-muted-foreground">Your sacred fire of consistency</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex justify-center py-8">
        <StreakFlame
          flameStrength={flameStrength}
          consecutiveStreak={consecutiveStreak}
          hasReached={hasReached}
        />
      </div>

      <div className="mt-8 p-4 rounded-xl bg-secondary/30 border border-border">
        <h3 className="text-sm font-medium text-foreground mb-2">The Sacred Flame</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your flame grows stronger with each day of consistency. It represents your dedication 
          and commitment to your habits. Miss a day, and the flame will flicker and shrink. 
          But maintain 50 consecutive days, and your flame becomes eternal - never to diminish again.
        </p>
      </div>

      {hasReached && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-center"
        >
          <p className="text-amber-600 dark:text-amber-400 font-medium">
            ✧ Your flame burns eternal ✧
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FlameShrineZone;
