import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppSettings } from '@/types/habit';
import { ZoneType, ZONE_POSITIONS, WorldState } from '@/types/world';
import { motion, AnimatePresence } from 'framer-motion';

interface SpatialCanvasProps {
  children: React.ReactNode;
  settings: AppSettings;
  worldState: WorldState;
  onZoneChange: (zone: ZoneType) => void;
  renderZone: (zone: ZoneType) => React.ReactNode;
}

const SpatialCanvas: React.FC<SpatialCanvasProps> = ({
  children,
  settings,
  worldState,
  onZoneChange,
  renderZone,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [targetOffset, setTargetOffset] = useState({ x: 0, y: 0 });

  // Navigate to a specific zone
  const navigateToZone = useCallback((zone: ZoneType) => {
    const position = ZONE_POSITIONS[zone];
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    const containerHeight = containerRef.current?.clientHeight || window.innerHeight;
    
    // Center the zone in the viewport
    const newOffset = {
      x: -position.x + containerWidth / 2 - 400, // 400 = half of typical content width
      y: -position.y + containerHeight / 2 - 300,
    };
    
    setTargetOffset(newOffset);
    onZoneChange(zone);
  }, [onZoneChange]);

  // Smooth animation to target
  useEffect(() => {
    const animate = () => {
      setOffset(prev => ({
        x: prev.x + (targetOffset.x - prev.x) * 0.08,
        y: prev.y + (targetOffset.y - prev.y) * 0.08,
      }));
    };
    
    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [targetOffset]);

  // Initial navigation to center
  useEffect(() => {
    navigateToZone('center');
  }, []);

  // Manual panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('spatial-bg')) {
      setIsPanning(true);
      setStartPan({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return;
    
    const newOffset = {
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    };
    setOffset(newOffset);
    setTargetOffset(newOffset);
  }, [isPanning, startPan]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    
    // Determine which zone is closest to center of viewport
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    const containerHeight = containerRef.current?.clientHeight || window.innerHeight;
    const viewportCenter = {
      x: containerWidth / 2 - offset.x,
      y: containerHeight / 2 - offset.y,
    };
    
    let closestZone: ZoneType = 'center';
    let closestDistance = Infinity;
    
    (Object.entries(ZONE_POSITIONS) as [ZoneType, { x: number; y: number }][]).forEach(([zone, pos]) => {
      const distance = Math.sqrt(
        Math.pow(pos.x - viewportCenter.x, 2) + 
        Math.pow(pos.y - viewportCenter.y, 2)
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestZone = zone;
      }
    });
    
    if (closestZone !== worldState.currentZone) {
      onZoneChange(closestZone);
    }
  }, [offset, worldState.currentZone, onZoneChange]);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, handleMouseMove, handleMouseUp]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (worldState.currentZone === 'center') navigateToZone('review');
          else if (worldState.currentZone === 'review') navigateToZone('insane');
          else if (worldState.currentZone === 'insane') navigateToZone('focus');
          else if (worldState.currentZone === 'recovery') navigateToZone('center');
          break;
        case 'ArrowDown':
          if (worldState.currentZone === 'focus') navigateToZone('insane');
          else if (worldState.currentZone === 'insane') navigateToZone('review');
          else if (worldState.currentZone === 'review') navigateToZone('center');
          else if (worldState.currentZone === 'center') navigateToZone('recovery');
          break;
        case 'ArrowLeft':
          if (worldState.currentZone === 'center') navigateToZone('journal');
          break;
        case 'ArrowRight':
          if (worldState.currentZone === 'journal') navigateToZone('center');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [worldState.currentZone, navigateToZone]);

  // Expose navigation function
  useEffect(() => {
    (window as any).__navigateToZone = navigateToZone;
    return () => {
      delete (window as any).__navigateToZone;
    };
  }, [navigateToZone]);

  return (
    <div
      ref={containerRef}
      className="spatial-bg w-full h-screen overflow-hidden cursor-grab"
      style={{ 
        cursor: isPanning ? 'grabbing' : 'grab',
        background: 'hsl(var(--canvas-bg))',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Background grid pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--canvas-grid)) 1px, transparent 0)',
          backgroundSize: '48px 48px',
          transform: `translate(${offset.x % 48}px, ${offset.y % 48}px)`,
        }}
      />

      {/* World content */}
      <div
        className="relative"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${settings.zoom})`,
          transformOrigin: 'top left',
          transition: isPanning ? 'none' : 'transform 0.05s ease-out',
        }}
      >
        {/* Zone: Center (Main Grid) */}
        <div 
          className="absolute"
          style={{ 
            left: ZONE_POSITIONS.center.x, 
            top: ZONE_POSITIONS.center.y 
          }}
        >
          {children}
        </div>

        {/* Zone: Review Island (Above) */}
        <div 
          className="absolute"
          style={{ 
            left: ZONE_POSITIONS.review.x, 
            top: ZONE_POSITIONS.review.y 
          }}
        >
          <div className="w-[800px]">
            {renderZone('review')}
          </div>
        </div>

        {/* Zone: The Insane State (Far Above) */}
        <div 
          className="absolute"
          style={{ 
            left: ZONE_POSITIONS.insane.x, 
            top: ZONE_POSITIONS.insane.y 
          }}
        >
          <div className="w-[800px]">
            {renderZone('insane')}
          </div>
        </div>

        {/* Zone: Focus Zone (Above Insane) */}
        <div 
          className="absolute"
          style={{ 
            left: ZONE_POSITIONS.focus.x, 
            top: ZONE_POSITIONS.focus.y 
          }}
        >
          <div className="w-[800px]">
            {renderZone('focus')}
          </div>
        </div>

        {/* Zone: Journal World (Left) */}
        <div 
          className="absolute"
          style={{ 
            left: ZONE_POSITIONS.journal.x, 
            top: ZONE_POSITIONS.journal.y 
          }}
        >
          <div className="w-[600px]">
            {renderZone('journal')}
          </div>
        </div>

        {/* Zone: Recovery (Below) */}
        <div 
          className="absolute"
          style={{ 
            left: ZONE_POSITIONS.recovery.x, 
            top: ZONE_POSITIONS.recovery.y 
          }}
        >
          <div className="w-[800px]">
            {renderZone('recovery')}
          </div>
        </div>

        {/* Visual connectors between zones */}
        <svg 
          className="absolute pointer-events-none"
          style={{ 
            left: 0, 
            top: -5000, 
            width: 2000, 
            height: 8000,
          }}
        >
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Center to Review */}
          <path
            d={`M ${ZONE_POSITIONS.center.x + 400} ${ZONE_POSITIONS.center.y + 5000} 
                Q ${ZONE_POSITIONS.center.x + 400} ${ZONE_POSITIONS.review.y + 5300} 
                ${ZONE_POSITIONS.review.x + 400} ${ZONE_POSITIONS.review.y + 5600}`}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="2"
            strokeDasharray="8 8"
          />
          
          {/* Review to Insane */}
          <path
            d={`M ${ZONE_POSITIONS.review.x + 400} ${ZONE_POSITIONS.review.y + 5000}
                L ${ZONE_POSITIONS.insane.x + 400} ${ZONE_POSITIONS.insane.y + 5600}`}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="2"
            strokeDasharray="8 8"
          />
          
          {/* Insane to Focus */}
          <path
            d={`M ${ZONE_POSITIONS.insane.x + 400} ${ZONE_POSITIONS.insane.y + 5000}
                L ${ZONE_POSITIONS.focus.x + 400} ${ZONE_POSITIONS.focus.y + 5600}`}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="2"
            strokeDasharray="8 8"
          />
          
          {/* Center to Journal */}
          <path
            d={`M ${ZONE_POSITIONS.center.x + 5000} ${ZONE_POSITIONS.center.y + 5300}
                Q ${ZONE_POSITIONS.journal.x + 5600} ${ZONE_POSITIONS.center.y + 5300}
                ${ZONE_POSITIONS.journal.x + 5600} ${ZONE_POSITIONS.journal.y + 5300}`}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="2"
            strokeDasharray="8 8"
          />
          
          {/* Center to Recovery */}
          <path
            d={`M ${ZONE_POSITIONS.center.x + 400} ${ZONE_POSITIONS.center.y + 5600}
                L ${ZONE_POSITIONS.recovery.x + 400} ${ZONE_POSITIONS.recovery.y + 5000}`}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="2"
            strokeDasharray="8 8"
          />
        </svg>
      </div>
    </div>
  );
};

export default SpatialCanvas;
