import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
  color: string;
  size: number;
  side: 'left' | 'right';
}

interface ConfettiCelebrationProps {
  isActive: boolean;
  onComplete: () => void;
  mini?: boolean; // For cell completions
}

const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  isActive,
  onComplete,
  mini = false,
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isActive) {
      const colors = [
        'hsl(175, 45%, 50%)',
        'hsl(175, 35%, 65%)',
        'hsl(35, 60%, 55%)',
        'hsl(250, 40%, 60%)',
        'hsl(220, 15%, 75%)',
      ];

      const pieceCount = mini ? 20 : 60;
      const newPieces: ConfettiPiece[] = [];
      
      for (let i = 0; i < pieceCount; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 40,
          delay: Math.random() * (mini ? 0.2 : 0.5),
          duration: mini ? 1.2 + Math.random() * 0.8 : 2.5 + Math.random() * 1.5,
          rotation: Math.random() * 720 - 360,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: mini ? 4 + Math.random() * 4 : 6 + Math.random() * 8,
          side: i % 2 === 0 ? 'left' : 'right',
        });
      }

      setPieces(newPieces);

      const timer = setTimeout(() => {
        onComplete();
        setPieces([]);
      }, mini ? 1500 : 4000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete, mini]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
        >
          {/* Central celebration message - only for full celebration */}
          {!mini && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl font-semibold text-foreground mb-2"
                >
                  Journey Complete
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm text-muted-foreground"
                >
                  You showed up, every single day.
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* Confetti pieces */}
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: piece.side === 'left' ? -20 : typeof window !== 'undefined' ? window.innerWidth + 20 : 1000,
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                x: piece.side === 'left' 
                  ? `${piece.x}vw` 
                  : `${100 - piece.x}vw`,
                y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800,
                rotate: piece.rotation,
                opacity: [1, 1, 0.8, 0],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                position: 'absolute',
                width: piece.size,
                height: piece.size * 0.6,
                backgroundColor: piece.color,
                borderRadius: '2px',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfettiCelebration;
