import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakFlameProps {
  flameStrength: number; // 0-100
  consecutiveStreak: number;
  hasReached: boolean;
}

const StreakFlame: React.FC<StreakFlameProps> = ({
  flameStrength,
  consecutiveStreak,
  hasReached,
}) => {
  // Calculate flame tier
  const flameTier = useMemo(() => {
    if (hasReached) return 5; // Eternal flame
    if (flameStrength >= 80) return 4;
    if (flameStrength >= 60) return 3;
    if (flameStrength >= 40) return 2;
    if (flameStrength >= 20) return 1;
    return 0;
  }, [flameStrength, hasReached]);

  // Flame colors based on tier
  const flameColors = useMemo(() => {
    if (hasReached) {
      return {
        outer: 'from-amber-400 via-yellow-300 to-orange-500',
        inner: 'from-white via-yellow-200 to-amber-400',
        glow: 'rgba(251, 191, 36, 0.6)',
      };
    }
    switch (flameTier) {
      case 4:
        return {
          outer: 'from-orange-500 via-amber-400 to-yellow-400',
          inner: 'from-yellow-200 via-orange-400 to-red-500',
          glow: 'rgba(251, 146, 60, 0.5)',
        };
      case 3:
        return {
          outer: 'from-orange-600 via-orange-400 to-amber-400',
          inner: 'from-amber-300 via-orange-500 to-red-600',
          glow: 'rgba(234, 88, 12, 0.4)',
        };
      case 2:
        return {
          outer: 'from-red-600 via-orange-500 to-orange-400',
          inner: 'from-orange-400 via-red-500 to-red-700',
          glow: 'rgba(220, 38, 38, 0.3)',
        };
      case 1:
        return {
          outer: 'from-red-700 via-red-500 to-orange-500',
          inner: 'from-red-500 via-red-600 to-red-800',
          glow: 'rgba(185, 28, 28, 0.25)',
        };
      default:
        return {
          outer: 'from-gray-400 via-gray-500 to-gray-600',
          inner: 'from-gray-300 via-gray-400 to-gray-500',
          glow: 'rgba(107, 114, 128, 0.2)',
        };
    }
  }, [flameTier, hasReached]);

  const flameScale = 0.5 + (flameStrength / 100) * 0.5;
  const flameIntensity = hasReached ? 1 : flameStrength / 100;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Flame container */}
      <div className="relative">
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background: flameColors.glow,
            transform: `scale(${1.5 + flameIntensity * 0.5})`,
          }}
          animate={{
            scale: hasReached 
              ? [1.5, 1.8, 1.5] 
              : [1.3 + flameIntensity * 0.2, 1.5 + flameIntensity * 0.3, 1.3 + flameIntensity * 0.2],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: hasReached ? 3 : 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Main flame */}
        <motion.div
          className="relative"
          animate={{
            scale: hasReached ? [1, 1.05, 1] : [flameScale * 0.95, flameScale * 1.05, flameScale * 0.95],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="relative w-24 h-32">
            {/* Outer flame */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-t ${flameColors.outer} rounded-t-full rounded-b-[40%]`}
              style={{
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                filter: `blur(${2 - flameIntensity}px)`,
              }}
              animate={{
                scaleX: [1, 1.1, 0.9, 1],
                skewX: [-3, 3, -3],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {/* Inner flame */}
            <motion.div
              className={`absolute inset-4 bg-gradient-to-t ${flameColors.inner} rounded-t-full rounded-b-[40%]`}
              style={{
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
              }}
              animate={{
                scaleX: [1, 0.9, 1.1, 1],
                skewX: [2, -2, 2],
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.1,
              }}
            />

            {/* Core */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-12 bg-gradient-to-t from-white/90 via-yellow-100 to-transparent rounded-full blur-sm"
              animate={{
                scaleY: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
              }}
            />
          </div>
        </motion.div>

        {/* Eternal flame indicator */}
        {hasReached && (
          <motion.div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="text-xs font-medium text-amber-500 whitespace-nowrap">
              ✧ Eternal Flame ✧
            </span>
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <Flame className={`w-4 h-4 ${hasReached ? 'text-amber-500' : 'text-orange-500'}`} />
          <span className="text-sm font-medium text-foreground">
            {hasReached ? 'Eternal' : `${Math.round(flameStrength)}% Strength`}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {consecutiveStreak} day streak
        </p>
      </div>

      {/* Flame growth hint */}
      {!hasReached && flameStrength < 100 && (
        <p className="text-xs text-muted-foreground text-center max-w-[200px]">
          Complete habits daily to grow the flame. Missing days causes it to flicker.
        </p>
      )}
    </div>
  );
};

export default StreakFlame;
