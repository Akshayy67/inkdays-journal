import React from 'react';
import { ZoneType } from '@/types/world';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Heart, Mountain, Compass } from 'lucide-react';

interface WorldMapProps {
  currentZone: ZoneType;
  visitedZones: ZoneType[];
  insaneProgress: number; // 0-500 days
  onNavigate: (zone: ZoneType) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({
  currentZone,
  visitedZones,
  insaneProgress,
  onNavigate,
}) => {
  const evolutionTier = Math.floor(insaneProgress / 10);
  const hasReached = insaneProgress >= 500;
  
  // Glow intensity based on progress
  const insaneGlow = Math.min(evolutionTier * 2, 100);
  const warmth = evolutionTier / 50;

  const zones = [
    { id: 'focus' as ZoneType, label: 'Focus', icon: Sparkles, y: 0, locked: !hasReached },
    { id: 'insane' as ZoneType, label: '???', icon: Sparkles, y: 60, special: true },
    { id: 'review' as ZoneType, label: 'Review', icon: Mountain, y: 120 },
    { id: 'center' as ZoneType, label: 'Present', icon: Compass, y: 180, main: true },
    { id: 'recovery' as ZoneType, label: 'Recovery', icon: Heart, y: 240 },
  ];

  const journalZone = { id: 'journal' as ZoneType, label: 'Journal', icon: BookOpen };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-1/2 right-6 -translate-y-1/2 z-50"
    >
      <div className="floating-panel p-3 bg-card/80 backdrop-blur-md">
        {/* Title */}
        <p className="text-[10px] text-muted-foreground/60 text-center mb-3 uppercase tracking-wider">
          World
        </p>

        <div className="relative flex">
          {/* Main vertical path */}
          <div className="relative w-16">
            {/* Connection line */}
            <div className="absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-primary/20 via-border to-primary/20" />
            
            {/* Path to insane - glows with progress */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-1 rounded-full"
              style={{
                top: 60,
                height: 60,
                background: `linear-gradient(to top, 
                  hsl(var(--primary) / 0.3), 
                  hsl(${45 + (1 - warmth) * 130}, ${40 + warmth * 30}%, ${50 + warmth * 10}% / ${0.2 + warmth * 0.4}))`,
                boxShadow: warmth > 0.1 ? `0 0 ${insaneGlow / 3}px hsl(${45 + (1 - warmth) * 130}, 50%, 50% / 0.3)` : 'none',
              }}
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Zone nodes */}
            {zones.map((zone) => {
              const isActive = currentZone === zone.id;
              const isVisited = visitedZones.includes(zone.id);
              const Icon = zone.icon;

              return (
                <motion.button
                  key={zone.id}
                  onClick={() => !zone.locked && onNavigate(zone.id)}
                  disabled={zone.locked}
                  className={`
                    absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full
                    flex items-center justify-center transition-all
                    ${isActive 
                      ? 'bg-primary text-primary-foreground scale-110' 
                      : isVisited
                        ? 'bg-secondary hover:bg-secondary/80 text-foreground'
                        : zone.special
                          ? 'bg-secondary/50 text-muted-foreground'
                          : 'bg-muted/50 text-muted-foreground/50 hover:bg-muted'
                    }
                    ${zone.locked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  style={{ 
                    top: zone.y,
                    boxShadow: zone.special && warmth > 0 
                      ? `0 0 ${insaneGlow / 2}px hsl(${45 + (1 - warmth) * 130}, 50%, 50% / ${0.3 + warmth * 0.3})` 
                      : isActive 
                        ? '0 0 20px hsl(var(--primary) / 0.3)' 
                        : 'none',
                  }}
                  whileHover={!zone.locked ? { scale: 1.1 } : {}}
                  whileTap={!zone.locked ? { scale: 0.95 } : {}}
                >
                  {zone.special ? (
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Icon className="w-4 h-4" style={{
                        color: warmth > 0.3 
                          ? `hsl(${45 + (1 - warmth) * 100}, ${50 + warmth * 20}%, ${50 + warmth * 10}%)` 
                          : undefined
                      }} />
                    </motion.div>
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </motion.button>
              );
            })}

            {/* Zone labels */}
            {zones.map((zone) => (
              <div
                key={`label-${zone.id}`}
                className="absolute left-full ml-2 whitespace-nowrap"
                style={{ top: zone.y + 12 }}
              >
                <span className={`text-[10px] ${
                  currentZone === zone.id 
                    ? 'text-primary' 
                    : zone.special && !hasReached
                      ? 'text-muted-foreground/50 italic'
                      : 'text-muted-foreground/70'
                }`}>
                  {zone.special && !hasReached ? '???' : zone.label}
                </span>
              </div>
            ))}
          </div>

          {/* Journal branch (left side) */}
          <div className="absolute -left-12 top-[180px]">
            {/* Horizontal connector */}
            <div className="absolute right-0 top-1/2 w-8 h-px bg-border" />
            
            <motion.button
              onClick={() => onNavigate('journal')}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-all
                ${currentZone === 'journal'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
                }
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <journalZone.icon className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

        {/* Hint about the journey */}
        {!hasReached && evolutionTier < 5 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-[9px] text-muted-foreground/40 text-center mt-4 max-w-[80px] mx-auto"
          >
            Something waits above...
          </motion.p>
        )}

        {/* Progress hint - very subtle, no numbers */}
        {evolutionTier >= 5 && !hasReached && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex justify-center"
          >
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    background: i < Math.floor(evolutionTier / 10) + 1
                      ? `hsl(${45 + (1 - warmth) * 130}, ${40 + warmth * 30}%, ${50 + warmth * 10}%)`
                      : 'hsl(var(--muted))',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default WorldMap;
