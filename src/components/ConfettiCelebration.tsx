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
  side: 'left' | 'right' | 'top';
  shape: 'rect' | 'circle' | 'star';
  wobble: number;
}

interface ConfettiCelebrationProps {
  isActive: boolean;
  onComplete: () => void;
  mini?: boolean;
}

const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  isActive,
  onComplete,
  mini = false,
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isActive) {
      // Vibrant, dopamine-inducing colors
      const colors = [
        'hsl(350, 90%, 60%)', // Hot pink
        'hsl(45, 100%, 55%)', // Gold
        'hsl(280, 85%, 60%)', // Purple
        'hsl(175, 80%, 45%)', // Teal
        'hsl(200, 95%, 55%)', // Bright blue
        'hsl(320, 85%, 55%)', // Magenta
        'hsl(60, 100%, 50%)', // Yellow
        'hsl(140, 75%, 50%)', // Green
        'hsl(25, 100%, 55%)', // Orange
        'hsl(0, 90%, 60%)', // Red
      ];

      const shapes: ('rect' | 'circle' | 'star')[] = ['rect', 'circle', 'star'];
      
      // HEAVY confetti - lots of pieces!
      const pieceCount = mini ? 80 : 250;
      const newPieces: ConfettiPiece[] = [];
      
      for (let i = 0; i < pieceCount; i++) {
        const side = mini ? (i % 2 === 0 ? 'left' : 'right') : 
          i % 3 === 0 ? 'left' : i % 3 === 1 ? 'right' : 'top';
        
        newPieces.push({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * (mini ? 0.3 : 0.8),
          duration: mini ? 1.5 + Math.random() * 1 : 3 + Math.random() * 2,
          rotation: Math.random() * 1080 - 540,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: mini ? 6 + Math.random() * 8 : 8 + Math.random() * 14,
          side,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          wobble: Math.random() * 40 - 20,
        });
      }

      setPieces(newPieces);

      const timer = setTimeout(() => {
        onComplete();
        setPieces([]);
      }, mini ? 2000 : 5000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete, mini]);

  const getInitialPosition = (piece: ConfettiPiece) => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1000;
    switch (piece.side) {
      case 'left':
        return { x: -30, y: Math.random() * 400 - 100 };
      case 'right':
        return { x: width + 30, y: Math.random() * 400 - 100 };
      case 'top':
        return { x: piece.x * width / 100, y: -30 };
    }
  };

  const getShape = (piece: ConfettiPiece) => {
    switch (piece.shape) {
      case 'circle':
        return { borderRadius: '50%', width: piece.size, height: piece.size };
      case 'star':
        return { 
          borderRadius: '2px', 
          width: piece.size, 
          height: piece.size * 0.4,
          boxShadow: `0 0 ${piece.size / 2}px ${piece.color}40`
        };
      default:
        return { borderRadius: '2px', width: piece.size, height: piece.size * 0.6 };
    }
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
        >
          {/* Flash effect for impact */}
          {!mini && (
            <motion.div
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-primary/20"
            />
          )}

          {/* Central celebration message - only for full celebration */}
          {!mini && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl font-bold text-foreground mb-3"
                >
                  🎉 Journey Complete! 🎉
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 0.6 }}
                  className="text-lg text-muted-foreground"
                >
                  You showed up, every single day.
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* HEAVY confetti flood */}
          {pieces.map((piece) => {
            const initial = getInitialPosition(piece);
            const shapeStyle = getShape(piece);
            const height = typeof window !== 'undefined' ? window.innerHeight : 800;
            
            return (
              <motion.div
                key={piece.id}
                initial={{
                  x: initial.x,
                  y: initial.y,
                  rotate: 0,
                  opacity: 1,
                  scale: 0,
                }}
                animate={{
                  x: [
                    initial.x,
                    initial.x + piece.wobble * 3,
                    initial.x - piece.wobble * 2,
                    initial.x + piece.wobble,
                    `${piece.x}vw`
                  ],
                  y: height + 100,
                  rotate: piece.rotation,
                  opacity: [1, 1, 1, 0.9, 0],
                  scale: [0, 1.2, 1, 1, 0.8],
                }}
                transition={{
                  duration: piece.duration,
                  delay: piece.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                  x: {
                    duration: piece.duration,
                    times: [0, 0.25, 0.5, 0.75, 1],
                  }
                }}
                style={{
                  position: 'absolute',
                  backgroundColor: piece.color,
                  ...shapeStyle,
                }}
              />
            );
          })}

          {/* Extra sparkle layer for mini celebrations */}
          {mini && pieces.slice(0, 10).map((piece) => (
            <motion.div
              key={`sparkle-${piece.id}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 0.6,
                delay: piece.delay,
              }}
              style={{
                position: 'absolute',
                left: `${piece.x}%`,
                top: `${20 + Math.random() * 60}%`,
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: piece.color,
                boxShadow: `0 0 10px ${piece.color}, 0 0 20px ${piece.color}`,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfettiCelebration;
