import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FocusZoneProps {
  onBack: () => void;
}

const FocusZone: React.FC<FocusZoneProps> = ({ onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isInside, setIsInside] = useState(true);
  const [movementIntensity, setMovementIntensity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const movementHistoryRef = useRef<number[]>([]);
  const boundaryRadius = 120;
  const centerRef = useRef({ x: 0, y: 0 });

  // Calculate center on mount and resize
  useEffect(() => {
    const updateCenter = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        centerRef.current = {
          x: rect.width / 2,
          y: rect.height / 2,
        };
      }
    };
    updateCenter();
    window.addEventListener('resize', updateCenter);
    return () => window.removeEventListener('resize', updateCenter);
  }, [isActive]);

  // Track mouse movement
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isActive || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCursorPos({ x, y });
    
    // Calculate distance from center
    const dx = x - centerRef.current.x;
    const dy = y - centerRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if inside boundary
    const inside = distance <= boundaryRadius;
    setIsInside(inside);
    
    // Calculate movement intensity (jitter detection)
    const moveDelta = Math.sqrt(
      Math.pow(x - lastPosRef.current.x, 2) + 
      Math.pow(y - lastPosRef.current.y, 2)
    );
    lastPosRef.current = { x, y };
    
    // Track movement history
    movementHistoryRef.current.push(moveDelta);
    if (movementHistoryRef.current.length > 10) {
      movementHistoryRef.current.shift();
    }
    
    // Average recent movement
    const avgMovement = movementHistoryRef.current.reduce((a, b) => a + b, 0) / 
                        movementHistoryRef.current.length;
    setMovementIntensity(Math.min(avgMovement / 5, 1));
    
    // End session naturally if outside boundary or too much jitter
    if (!inside || avgMovement > 15) {
      // Gentle fade out
      setTimeout(() => {
        setIsActive(false);
        setMovementIntensity(0);
        movementHistoryRef.current = [];
      }, 300);
    }
  }, [isActive]);

  // Start session
  const handleStart = useCallback(() => {
    setIsActive(true);
    setIsInside(true);
    setMovementIntensity(0);
    movementHistoryRef.current = [];
  }, []);

  // Boundary color based on stillness
  const getBoundaryColor = () => {
    if (!isActive) return 'hsl(var(--primary) / 0.2)';
    if (!isInside) return 'hsl(var(--muted) / 0.3)';
    
    // Green = still, shifts to muted as movement increases
    const stillness = 1 - movementIntensity;
    if (stillness > 0.7) return `hsl(150, 40%, 45% / ${0.3 + stillness * 0.2})`;
    if (stillness > 0.4) return `hsl(175, 35%, 45% / 0.35)`;
    return `hsl(var(--muted-foreground) / 0.25)`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="floating-panel p-8">
        {/* Minimal header */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-medium text-foreground/80">Stillness</h2>
        </div>

        {/* The practice space */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onClick={!isActive ? handleStart : undefined}
          className="relative h-[400px] rounded-xl bg-secondary/20 overflow-hidden cursor-none"
        >
          <AnimatePresence>
            {!isActive ? (
              <motion.div
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
              >
                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 rounded-full border border-primary/30 mx-auto mb-4"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <p className="text-sm text-muted-foreground/60">Enter to begin</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                {/* Soft circular boundary */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: boundaryRadius * 2,
                    height: boundaryRadius * 2,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: `2px solid ${getBoundaryColor()}`,
                    transition: 'border-color 0.5s ease',
                  }}
                  animate={{
                    scale: isInside ? [1, 1.01, 1] : 1,
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                
                {/* Inner stillness indicator */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 8 + (1 - movementIntensity) * 20,
                    height: 8 + (1 - movementIntensity) * 20,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(circle, 
                      hsl(150, ${30 + (1 - movementIntensity) * 30}%, 50% / ${0.2 + (1 - movementIntensity) * 0.3}) 0%, 
                      transparent 70%)`,
                    transition: 'all 0.3s ease',
                  }}
                />
                
                {/* Cursor visualization - subtle */}
                <motion.div
                  className="absolute w-3 h-3 rounded-full pointer-events-none"
                  style={{
                    left: cursorPos.x - 6,
                    top: cursorPos.y - 6,
                    background: `hsl(var(--foreground) / ${0.3 - movementIntensity * 0.2})`,
                    transition: 'background 0.2s ease',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* No instructions, no evaluation - just space */}
        <div className="h-8" />
      </div>
    </motion.div>
  );
};

export default FocusZone;
