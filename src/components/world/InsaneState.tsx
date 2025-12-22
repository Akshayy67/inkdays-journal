import React, { useMemo } from 'react';
import { InsaneStateProgress } from '@/types/world';
import { motion } from 'framer-motion';
import InsaneState3D from './InsaneState3D';

interface InsaneStateProps {
  progress: InsaneStateProgress;
  onExplore: () => void;
}

const InsaneState: React.FC<InsaneStateProps> = ({ progress, onExplore }) => {
  const hasReached = progress.currentDay >= progress.targetDays;
  
  // Calculate evolution tier (every 10 days = 1 tier, max 50 tiers)
  const evolutionTier = Math.min(Math.floor(progress.currentDay / 10), 50);
  
  // Visual progress for spatial movement
  const visualProgress = useMemo(() => {
    const ratio = Math.min(progress.currentDay / progress.targetDays, 1);
    return 1 - Math.pow(1 - ratio, 4);
  }, [progress.currentDay, progress.targetDays]);

  // Journey ideas based on current tier
  const journeyInsight = useMemo(() => {
    if (evolutionTier < 5) return "The journey begins with small steps...";
    if (evolutionTier < 10) return "Patterns start to form in the distance...";
    if (evolutionTier < 20) return "Something glows faintly above...";
    if (evolutionTier < 30) return "The path becomes clearer with each day...";
    if (evolutionTier < 40) return "Warmth radiates from beyond...";
    if (evolutionTier < 50) return "Almost within reach...";
    return null;
  }, [evolutionTier]);

  // Reached and exploring - the calm space
  if (hasReached && progress.isExploring) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="w-full min-h-[800px] relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        
        <div className="relative z-10">
          <InsaneState3D 
            evolutionTier={50} 
            visualProgress={1} 
            hasReached={true} 
          />
          
          {/* Calm exploration space */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center mt-8"
          >
            <p className="text-muted-foreground dark:text-muted-foreground/60 text-sm italic">
              This space is yours now.
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Just reached - silent transition
  if (hasReached) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3 }}
        className="w-full min-h-[700px] flex flex-col items-center justify-center"
      >
        <InsaneState3D 
          evolutionTier={50} 
          visualProgress={1} 
          hasReached={true} 
        />
        
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

  // Unreached state - the journey visualization
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-h-[700px] relative"
    >
      {/* 3D Journey Visualization */}
      <InsaneState3D 
        evolutionTier={evolutionTier} 
        visualProgress={visualProgress} 
        hasReached={false} 
      />
      
      {/* Journey insights - no numbers, just feelings */}
      {journeyInsight && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-muted-foreground dark:text-muted-foreground/50 text-sm italic">
            {journeyInsight}
          </p>
        </motion.div>
      )}

      {/* Journey Map Legend - subtle visual guide */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 left-4 right-4"
      >
        <div className="floating-panel p-4 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            {/* Journey stages - no numbers */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground dark:text-muted-foreground/60">Beginning</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: i * 10 <= evolutionTier 
                        ? `hsl(${175 - i * 8}, ${40 + i * 6}%, ${45 + i * 3}%)`
                        : 'hsl(var(--muted))',
                    }}
                    animate={i * 10 <= evolutionTier ? {
                      scale: [1, 1.2, 1],
                    } : {}}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground dark:text-muted-foreground/60">Destination</span>
            </div>

            {/* Current state indicator */}
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{
                  background: `hsl(${175 - evolutionTier * 0.8}, ${40 + evolutionTier * 0.4}%, 50%)`,
                  boxShadow: `0 0 10px hsl(${175 - evolutionTier * 0.8}, ${40 + evolutionTier * 0.4}%, 50% / 0.5)`,
                }}
              />
              <span className="text-xs text-muted-foreground dark:text-muted-foreground/50">You are here</span>
            </div>
          </div>

          {/* Visual journey phases */}
          <div className="mt-4 grid grid-cols-5 gap-2">
            {['Awakening', 'Building', 'Deepening', 'Transcending', 'Arriving'].map((phase, i) => {
              const phaseStart = i * 10;
              const isActive = evolutionTier >= phaseStart;
              const isCurrent = evolutionTier >= phaseStart && evolutionTier < (i + 1) * 10;
              
              return (
                <div 
                  key={phase}
                  className={`text-center py-2 px-1 rounded-lg transition-all ${
                    isCurrent 
                      ? 'bg-primary/10 border border-primary/20' 
                      : isActive 
                        ? 'bg-secondary/30' 
                        : 'bg-transparent'
                  }`}
                >
                  <p className={`text-[10px] ${
                    isActive ? 'text-foreground dark:text-muted-foreground' : 'text-muted-foreground/50 dark:text-muted-foreground/30'
                  }`}>
                    {phase}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InsaneState;
