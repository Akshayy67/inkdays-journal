import React from 'react';
import { RecoveryState } from '@/types/habit';
import { X, Heart, RefreshCw, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GentleRecoveryProps {
  isOpen: boolean;
  onClose: () => void;
  recoveryState: RecoveryState;
  onRestart: () => void;
  onContinue: () => void;
}

const GentleRecovery: React.FC<GentleRecoveryProps> = ({
  isOpen,
  onClose,
  recoveryState,
  onRestart,
  onContinue,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-4 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="floating-panel p-6 w-full max-w-md pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">
                    Welcome back
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Message */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  It looks like <span className="text-foreground font-medium">{recoveryState.habitName}</span> has 
                  been paused for a few days. That happens to everyone.
                </p>
                
                {/* Show intent if available - softly */}
                {recoveryState.intent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10"
                  >
                    <p className="text-xs text-muted-foreground mb-1">You wrote:</p>
                    <p className="text-sm text-foreground/80 italic leading-relaxed">
                      "{recoveryState.intent}"
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                <button
                  onClick={onContinue}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition-colors group"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Continue where you left off</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Keep your progress and move forward</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>

                <button
                  onClick={onRestart}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-secondary/30 transition-colors group"
                >
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Fresh start</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">Begin again from day one</p>
                  </div>
                  <RefreshCw className="w-4 h-4 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
                </button>
              </div>

              {/* Gentle message */}
              <p className="text-[10px] text-muted-foreground/50 text-center mt-6">
                There is no wrong choice. What matters is showing up today.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GentleRecovery;
