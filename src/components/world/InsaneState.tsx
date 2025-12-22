import React, { useMemo } from 'react';
import { InsaneStateProgress } from '@/types/world';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';

interface InsaneStateProps {
  progress: InsaneStateProgress;
  onExplore: () => void;
}

const InsaneState: React.FC<InsaneStateProps> = ({ progress, onExplore }) => {
  const hasReached = progress.currentDay >= progress.targetDays;
  
  // Calculate visual distance - island gets closer as days increase
  const visualProgress = useMemo(() => {
    const ratio = Math.min(progress.currentDay / progress.targetDays, 1);
    // Use easeOutExpo for subtle acceleration as you get closer
    return 1 - Math.pow(1 - ratio, 3);
  }, [progress.currentDay, progress.targetDays]);

  // Opacity increases as you approach
  const opacity = 0.3 + visualProgress * 0.7;
  // Scale increases as you approach
  const scale = 0.6 + visualProgress * 0.4;

  if (hasReached && progress.isExploring) {
    // Explorable calm space after reaching
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full min-h-[800px] relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[600px]">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -8, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 3,
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Star className="w-6 h-6 text-primary fill-primary/30" />
                </motion.div>
              ))}
            </div>
            
            <h2 className="text-3xl font-bold text-foreground mb-3">The Insane State</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              You've reached a place few ever see. 500 days of consistent presence.
              This space is yours now — a monument to your commitment.
            </p>

            {/* Floating particles */}
            <div className="relative h-48 w-full max-w-lg mx-auto">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-primary/40"
                  style={{
                    left: `${10 + (i * 7)}%`,
                    top: `${20 + (i % 3) * 25}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.7, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4 + i * 0.5,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            <motion.p 
              className="text-sm text-muted-foreground/70 italic mt-8"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              "Consistency is the quiet art of becoming."
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (hasReached) {
    // Just reached - show entry
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full min-h-[600px] flex items-center justify-center"
      >
        <div className="text-center floating-panel p-12">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-foreground mb-4">You've Arrived</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            500 days of consistency. This legendary space is now yours to explore.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExplore}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium"
          >
            Enter The Insane State
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Distant floating island - gets closer over time
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-h-[600px] flex items-center justify-center relative"
    >
      {/* Atmospheric haze */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-primary/5 to-background/0" />
      
      {/* The distant island */}
      <motion.div
        style={{ opacity, scale }}
        className="text-center relative"
      >
        {/* Ethereal glow */}
        <motion.div
          className="absolute inset-0 -z-10 blur-3xl"
          style={{
            background: `radial-gradient(circle, hsl(var(--primary) / ${visualProgress * 0.3}) 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Island content */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="floating-panel p-8 border-primary/20"
        >
          <Sparkles className="w-12 h-12 text-primary/60 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground/80 mb-2">The Insane State</h2>
          <p className="text-sm text-muted-foreground/60 max-w-xs">
            A legendary destination for those who persist. 
            It draws closer with each consistent day.
          </p>
        </motion.div>
        
        {/* Subtle hint - no numbers */}
        <motion.p
          className="mt-6 text-xs text-muted-foreground/40 italic"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          Keep showing up...
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default InsaneState;
