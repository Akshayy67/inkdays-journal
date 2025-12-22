import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Trophy, Timer, Target, Zap } from 'lucide-react';

interface FocusZoneProps {
  onBack: () => void;
}

type GameType = 'memory' | 'reaction' | 'sequence' | null;

interface GameStats {
  score: number;
  level: number;
  bestScore: number;
}

const FocusZone: React.FC<FocusZoneProps> = ({ onBack }) => {
  const [selectedGame, setSelectedGame] = useState<GameType>(null);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="floating-panel p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Focus Zone</h2>
          <p className="text-muted-foreground dark:text-muted-foreground/70">
            Train your concentration with these focus-building games
          </p>
        </div>

        {selectedGame === null ? (
          <GameSelector onSelect={setSelectedGame} />
        ) : (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedGame(null)}
              className="mb-4 text-foreground"
            >
              ← Back to games
            </Button>
            
            {selectedGame === 'memory' && <MemoryGame />}
            {selectedGame === 'reaction' && <ReactionGame />}
            {selectedGame === 'sequence' && <SequenceGame />}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Game Selector Component
const GameSelector: React.FC<{ onSelect: (game: GameType) => void }> = ({ onSelect }) => {
  const games = [
    {
      id: 'memory' as GameType,
      name: 'Memory Grid',
      description: 'Remember and match patterns to sharpen your visual memory',
      icon: Target,
      color: 'hsl(175, 50%, 45%)',
    },
    {
      id: 'reaction' as GameType,
      name: 'Quick Reaction',
      description: 'Click the target as fast as you can when it appears',
      icon: Zap,
      color: 'hsl(45, 80%, 50%)',
    },
    {
      id: 'sequence' as GameType,
      name: 'Sequence Recall',
      description: 'Watch and repeat increasingly complex sequences',
      icon: Timer,
      color: 'hsl(260, 50%, 55%)',
    },
  ];

  return (
    <div className="grid gap-4">
      {games.map((game, index) => (
        <motion.button
          key={game.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSelect(game.id)}
          className="flex items-center gap-4 p-5 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border hover:border-primary/30 transition-all text-left group"
        >
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${game.color}20` }}
          >
            <game.icon className="w-6 h-6" style={{ color: game.color }} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
              {game.name}
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground/70">
              {game.description}
            </p>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

// Memory Grid Game
const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<number[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);

  const gridSize = Math.min(4 + level, 6); // 4x4 to 6x6
  const totalPairs = (gridSize * gridSize) / 2;

  const initGame = useCallback(() => {
    const pairs = Array.from({ length: totalPairs }, (_, i) => i);
    const shuffled = [...pairs, ...pairs].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameComplete(false);
  }, [totalPairs]);

  useEffect(() => {
    initGame();
  }, [initGame, level]);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (cards[first] === cards[second]) {
        setMatched(m => [...m, first, second]);
        setFlipped([]);
        
        if (matched.length + 2 === cards.length) {
          setGameComplete(true);
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const colors = [
    'hsl(175, 50%, 45%)', 'hsl(45, 80%, 50%)', 'hsl(260, 50%, 55%)',
    'hsl(340, 70%, 55%)', 'hsl(200, 70%, 50%)', 'hsl(140, 60%, 45%)',
    'hsl(20, 80%, 55%)', 'hsl(280, 60%, 55%)', 'hsl(60, 70%, 50%)',
    'hsl(320, 60%, 50%)', 'hsl(100, 50%, 45%)', 'hsl(220, 60%, 55%)',
    'hsl(0, 70%, 55%)', 'hsl(180, 60%, 45%)', 'hsl(300, 50%, 50%)',
    'hsl(40, 70%, 50%)', 'hsl(160, 55%, 45%)', 'hsl(240, 55%, 55%)',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground font-medium">Level {level}</span>
          <span className="text-sm text-muted-foreground">Moves: {moves}</span>
        </div>
        <Button variant="outline" size="sm" onClick={initGame} className="text-foreground">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div 
        className="grid gap-2 mx-auto"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          maxWidth: gridSize * 60 + (gridSize - 1) * 8,
        }}
      >
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          return (
            <motion.button
              key={index}
              onClick={() => handleCardClick(index)}
              className="aspect-square rounded-lg border border-border transition-all"
              style={{
                backgroundColor: isFlipped ? colors[card % colors.length] : 'hsl(var(--secondary))',
              }}
              whileHover={{ scale: isFlipped ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </div>

      <AnimatePresence>
        {gameComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 rounded-xl bg-primary/10 border border-primary/20"
          >
            <Trophy className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="text-lg font-medium text-foreground">Level Complete!</p>
            <p className="text-sm text-muted-foreground mb-4">Completed in {moves} moves</p>
            <Button onClick={() => setLevel(l => l + 1)} className="text-primary-foreground">
              Next Level →
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reaction Game
const ReactionGame: React.FC = () => {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'go' | 'result'>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startGame = () => {
    setGameState('ready');
    const delay = 1500 + Math.random() * 3000; // 1.5-4.5 seconds
    
    timeoutRef.current = setTimeout(() => {
      setGameState('go');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'waiting') {
      startGame();
    } else if (gameState === 'ready') {
      // Too early!
      clearTimeout(timeoutRef.current);
      setGameState('waiting');
    } else if (gameState === 'go') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setAttempts(a => [...a, time]);
      if (!bestTime || time < bestTime) {
        setBestTime(time);
      }
      setGameState('result');
    } else if (gameState === 'result') {
      startGame();
    }
  };

  const averageTime = attempts.length > 0 
    ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Attempts: {attempts.length}</span>
        <div className="flex gap-4">
          {bestTime && <span className="text-foreground font-medium">Best: {bestTime}ms</span>}
          {averageTime && <span className="text-muted-foreground">Avg: {averageTime}ms</span>}
        </div>
      </div>

      <motion.button
        onClick={handleClick}
        className="w-full h-64 rounded-xl flex items-center justify-center text-center transition-colors"
        style={{
          backgroundColor: 
            gameState === 'waiting' ? 'hsl(var(--secondary))' :
            gameState === 'ready' ? 'hsl(45, 80%, 50%)' :
            gameState === 'go' ? 'hsl(140, 60%, 45%)' :
            'hsl(var(--primary))',
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div>
          {gameState === 'waiting' && (
            <>
              <Play className="w-12 h-12 mx-auto mb-3 text-foreground/60" />
              <p className="text-lg font-medium text-foreground">Click to Start</p>
            </>
          )}
          {gameState === 'ready' && (
            <p className="text-xl font-bold text-foreground">Wait for green...</p>
          )}
          {gameState === 'go' && (
            <p className="text-2xl font-bold text-white">CLICK NOW!</p>
          )}
          {gameState === 'result' && (
            <>
              <p className="text-4xl font-bold text-primary-foreground mb-2">{reactionTime}ms</p>
              <p className="text-sm text-primary-foreground/80">Click to try again</p>
            </>
          )}
        </div>
      </motion.button>
    </div>
  );
};

// Sequence Game
const SequenceGame: React.FC = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [level, setLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bestLevel, setBestLevel] = useState(0);

  const colors = [
    'hsl(340, 70%, 55%)', // red
    'hsl(140, 60%, 45%)', // green  
    'hsl(200, 70%, 50%)', // blue
    'hsl(45, 80%, 50%)',  // yellow
  ];

  const startGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setLevel(0);
    setGameOver(false);
    setIsPlaying(true);
    nextRound([]);
  };

  const nextRound = (currentSequence: number[]) => {
    const newSequence = [...currentSequence, Math.floor(Math.random() * 4)];
    setSequence(newSequence);
    setLevel(newSequence.length);
    setPlayerSequence([]);
    
    // Show sequence
    setIsShowingSequence(true);
    newSequence.forEach((btn, index) => {
      setTimeout(() => {
        setActiveButton(btn);
        setTimeout(() => setActiveButton(null), 300);
      }, (index + 1) * 600);
    });
    
    setTimeout(() => {
      setIsShowingSequence(false);
    }, newSequence.length * 600 + 300);
  };

  const handleButtonClick = (index: number) => {
    if (!isPlaying || isShowingSequence) return;

    setActiveButton(index);
    setTimeout(() => setActiveButton(null), 150);

    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);

    // Check if correct
    const currentIndex = newPlayerSequence.length - 1;
    if (sequence[currentIndex] !== index) {
      // Wrong!
      setGameOver(true);
      setIsPlaying(false);
      if (level > bestLevel) {
        setBestLevel(level);
      }
      return;
    }

    // Check if complete
    if (newPlayerSequence.length === sequence.length) {
      setTimeout(() => nextRound(sequence), 800);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground font-medium">Level: {level}</span>
        <span className="text-muted-foreground">Best: {bestLevel}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {[0, 1, 2, 3].map((index) => (
          <motion.button
            key={index}
            onClick={() => handleButtonClick(index)}
            disabled={!isPlaying || isShowingSequence}
            className="aspect-square rounded-xl border-2 border-border transition-all"
            style={{
              backgroundColor: activeButton === index 
                ? colors[index] 
                : `${colors[index]}40`,
              opacity: isPlaying ? 1 : 0.5,
            }}
            whileHover={isPlaying && !isShowingSequence ? { scale: 1.05 } : {}}
            whileTap={isPlaying && !isShowingSequence ? { scale: 0.95 } : {}}
          />
        ))}
      </div>

      {!isPlaying && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {gameOver && (
            <p className="text-muted-foreground mb-4">
              Game Over! You reached level {level}
            </p>
          )}
          <Button onClick={startGame} className="text-primary-foreground">
            <Play className="w-4 h-4 mr-2" />
            {gameOver ? 'Try Again' : 'Start Game'}
          </Button>
        </motion.div>
      )}

      {isShowingSequence && (
        <p className="text-center text-sm text-muted-foreground animate-pulse">
          Watch the sequence...
        </p>
      )}

      {isPlaying && !isShowingSequence && (
        <p className="text-center text-sm text-muted-foreground">
          Your turn! ({playerSequence.length}/{sequence.length})
        </p>
      )}
    </div>
  );
};

export default FocusZone;
