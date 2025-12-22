import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Circle, Waves } from 'lucide-react';

type FocusGameType = 'breathing' | 'stillness' | 'patterns';

interface FocusZoneProps {
  onBack: () => void;
}

const BreathingGame: React.FC = () => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  
  useEffect(() => {
    const cycle = () => {
      setPhase('inhale');
      setTimeout(() => setPhase('hold'), 4000);
      setTimeout(() => setPhase('exhale'), 7000);
    };
    
    cycle();
    const interval = setInterval(cycle, 11000);
    return () => clearInterval(interval);
  }, []);

  const scale = phase === 'inhale' ? 1.4 : phase === 'hold' ? 1.4 : 0.8;
  const opacity = phase === 'hold' ? 0.8 : 1;

  return (
    <div className="flex flex-col items-center justify-center h-[400px]">
      <motion.div
        animate={{ scale, opacity }}
        transition={{ duration: phase === 'inhale' ? 4 : phase === 'hold' ? 0.2 : 4, ease: "easeInOut" }}
        className="w-32 h-32 rounded-full border-2 border-primary/40 flex items-center justify-center"
      >
        <motion.div
          animate={{ scale: scale * 0.7 }}
          transition={{ duration: phase === 'inhale' ? 4 : phase === 'hold' ? 0.2 : 4, ease: "easeInOut" }}
          className="w-16 h-16 rounded-full bg-primary/20"
        />
      </motion.div>
      
      <motion.p 
        key={phase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 text-lg text-muted-foreground capitalize"
      >
        {phase === 'hold' ? 'Hold...' : phase === 'inhale' ? 'Breathe in...' : 'Breathe out...'}
      </motion.p>
    </div>
  );
};

const StillnessGame: React.FC = () => {
  const [circles, setCircles] = useState<{ id: number; x: number; y: number }[]>([]);
  
  const addCircle = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCircles(prev => [...prev, { id: Date.now(), x, y }]);
    
    setTimeout(() => {
      setCircles(prev => prev.filter(c => c.id !== Date.now()));
    }, 4000);
  }, []);

  return (
    <div 
      onClick={addCircle}
      className="relative w-full h-[400px] rounded-xl bg-secondary/30 overflow-hidden cursor-pointer"
    >
      <AnimatePresence>
        {circles.map(circle => (
          <motion.div
            key={circle.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, ease: "easeOut" }}
            className="absolute w-8 h-8 rounded-full border border-primary/40"
            style={{ left: circle.x - 16, top: circle.y - 16 }}
          />
        ))}
      </AnimatePresence>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <p className="text-muted-foreground/60 text-sm">Click anywhere to create ripples</p>
      </div>
    </div>
  );
};

const PatternsGame: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const gridSize = 6;
  
  return (
    <div className="flex flex-col items-center justify-center h-[400px]">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
        {[...Array(gridSize * gridSize)].map((_, i) => (
          <motion.div
            key={i}
            onHoverStart={() => setHoveredIndex(i)}
            onHoverEnd={() => setHoveredIndex(null)}
            animate={{
              scale: hoveredIndex === i ? 1.2 : 1,
              backgroundColor: hoveredIndex === i 
                ? 'hsl(var(--primary) / 0.4)' 
                : 'hsl(var(--secondary))',
            }}
            transition={{ duration: 0.3 }}
            className="w-8 h-8 rounded-sm cursor-pointer"
          />
        ))}
      </div>
      <p className="mt-6 text-muted-foreground/60 text-sm">Hover to explore patterns</p>
    </div>
  );
};

const FocusZone: React.FC<FocusZoneProps> = ({ onBack }) => {
  const [activeGame, setActiveGame] = useState<FocusGameType | null>(null);

  const games: { type: FocusGameType; icon: React.ComponentType<any>; name: string; description: string }[] = [
    { type: 'breathing', icon: Wind, name: 'Breathing', description: 'Slow, guided breath cycles' },
    { type: 'stillness', icon: Waves, name: 'Stillness', description: 'Create gentle ripples' },
    { type: 'patterns', icon: Circle, name: 'Patterns', description: 'Explore subtle movements' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="floating-panel p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Focus Zone</h2>
          <p className="text-muted-foreground text-sm">Minimal exercises for calm concentration</p>
        </div>

        {/* Game selection or active game */}
        <AnimatePresence mode="wait">
          {activeGame ? (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {activeGame === 'breathing' && <BreathingGame />}
              {activeGame === 'stillness' && <StillnessGame />}
              {activeGame === 'patterns' && <PatternsGame />}
              
              <button
                onClick={() => setActiveGame(null)}
                className="w-full mt-6 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to exercises
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4"
            >
              {games.map((game, i) => (
                <motion.button
                  key={game.type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveGame(game.type)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left group"
                >
                  <game.icon className="w-6 h-6 text-primary/60 group-hover:text-primary transition-colors" />
                  <div>
                    <p className="font-medium text-foreground">{game.name}</p>
                    <p className="text-sm text-muted-foreground">{game.description}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gentle reminder */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground/60 mt-8 italic"
        >
          No scores. No timers. Just presence.
        </motion.p>
      </div>
    </motion.div>
  );
};

export default FocusZone;
