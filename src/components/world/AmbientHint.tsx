import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface AmbientHintProps {
  insaneProgress: number;
  currentZone: string;
}

const AmbientHint: React.FC<AmbientHintProps> = ({ insaneProgress, currentZone }) => {
  const evolutionTier = Math.floor(insaneProgress / 10);
  const warmth = evolutionTier / 50;
  
  // Only show hints when at center
  if (currentZone !== 'center') return null;

  // Generate floating particles that drift upward
  const particles = useMemo(() => {
    return [...Array(6)].map((_, i) => ({
      id: i,
      x: 20 + (i * 12),
      delay: i * 0.8,
      duration: 8 + i * 2,
      size: 2 + (evolutionTier > i * 8 ? 1 : 0),
    }));
  }, [evolutionTier]);

  return (
    <>
      {/* Top edge glow - intensifies with progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-32 pointer-events-none z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: `linear-gradient(to bottom, 
            hsl(${45 + (1 - warmth) * 130}, ${30 + warmth * 30}%, ${50 + warmth * 10}% / ${0.03 + warmth * 0.08}) 0%,
            transparent 100%)`,
        }}
      />

      {/* Floating particles drifting upward */}
      <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              bottom: '-10px',
              width: particle.size,
              height: particle.size,
              background: `hsl(${45 + (1 - warmth) * 130}, ${40 + warmth * 20}%, ${55 + warmth * 15}% / ${0.3 + warmth * 0.3})`,
              boxShadow: warmth > 0.2 
                ? `0 0 ${4 + warmth * 6}px hsl(${45 + (1 - warmth) * 130}, ${50}%, ${60}% / ${0.2 + warmth * 0.2})`
                : 'none',
            }}
            animate={{
              y: [0, -window.innerHeight - 50],
              opacity: [0, 0.6, 0.6, 0],
              x: [0, (particle.id % 2 === 0 ? 20 : -20)],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Subtle upward arrow hint - only first few visits */}
      {evolutionTier < 3 && (
        <motion.div
          className="fixed top-20 left-1/2 -translate-x-1/2 pointer-events-none z-30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 0.4, 0], y: [10, 0, 10] }}
          transition={{ duration: 3, repeat: Infinity, delay: 5 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-foreground/30">
            <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      )}
    </>
  );
};

export default AmbientHint;
