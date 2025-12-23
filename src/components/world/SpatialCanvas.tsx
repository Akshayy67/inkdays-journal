import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppSettings } from '@/types/habit';
import { ZoneType, ZONE_POSITIONS, WorldState } from '@/types/world';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Zap, Focus, ChevronUp } from 'lucide-react';

interface SpatialCanvasProps {
  children: React.ReactNode;
  settings: AppSettings;
  worldState: WorldState;
  onZoneChange: (zone: ZoneType) => void;
  renderZone: (zone: ZoneType) => React.ReactNode;
  /** Commit zoom changes (e.g. persist to storage). */
  onZoomCommit?: (zoom: number) => void;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const getTouchDistance = (touches: TouchList) => {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

const getTouchMidpoint = (touches: TouchList) => {
  if (touches.length < 2) return { x: 0, y: 0 };
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  };
};

const SpatialCanvas: React.FC<SpatialCanvasProps> = ({
  children,
  settings,
  worldState,
  onZoneChange,
  renderZone,
  onZoomCommit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isGesturing, setIsGesturing] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [targetOffset, setTargetOffset] = useState({ x: 0, y: 0 });

  // Local zoom for smooth pinch updates; commit when gesture ends.
  const [localZoom, setLocalZoom] = useState(settings.zoom);

  const offsetRef = useRef(offset);
  const zoomRef = useRef(localZoom);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    zoomRef.current = localZoom;
  }, [localZoom]);

  useEffect(() => {
    setLocalZoom(settings.zoom);
  }, [settings.zoom]);

  const pinchRef = useRef<
    | null
    | {
        startDistance: number;
        startMid: { x: number; y: number };
        startOffset: { x: number; y: number };
        startZoom: number;
        lastZoom: number;
      }
  >(null);

  // Navigate to a specific zone
  const navigateToZone = useCallback(
    (zone: ZoneType) => {
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
    },
    [onZoneChange]
  );

  // Smooth animation to target
  useEffect(() => {
    const animate = () => {
      setOffset((prev) => ({
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

  // Manual panning (mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('spatial-bg')) {
      setIsPanning(true);
      setStartPan({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y,
      });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isPanning) return;

      const newOffset = {
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      };
      setOffset(newOffset);
      setTargetOffset(newOffset);
    },
    [isPanning, startPan]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);

    // Determine which zone is closest to center of viewport
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    const containerHeight = containerRef.current?.clientHeight || window.innerHeight;
    const viewportCenter = {
      x: containerWidth / 2 - offsetRef.current.x,
      y: containerHeight / 2 - offsetRef.current.y,
    };

    let closestZone: ZoneType = 'center';
    let closestDistance = Infinity;

    (Object.entries(ZONE_POSITIONS) as [ZoneType, { x: number; y: number }][]).forEach(([zone, pos]) => {
      const distance = Math.sqrt(Math.pow(pos.x - viewportCenter.x, 2) + Math.pow(pos.y - viewportCenter.y, 2));
      if (distance < closestDistance) {
        closestDistance = distance;
        closestZone = zone;
      }
    });

    if (closestZone !== worldState.currentZone) {
      onZoneChange(closestZone);
    }
  }, [worldState.currentZone, onZoneChange]);

  // Touch panning (one finger) - only when starting on background.
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;

    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('spatial-bg')) {
      const touch = e.touches[0];
      setIsPanning(true);
      setStartPan({
        x: touch.clientX - offsetRef.current.x,
        y: touch.clientY - offsetRef.current.y,
      });
    }
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPanning) return;
      e.preventDefault();

      const touch = e.touches[0];
      const newOffset = {
        x: touch.clientX - startPan.x,
        y: touch.clientY - startPan.y,
      };
      setOffset(newOffset);
      setTargetOffset(newOffset);
    },
    [isPanning, startPan]
  );

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  // Two-finger gesture (pinch-zoom + two-finger drag) in CAPTURE phase so it works
  // even when touches start on DrawingCell (which stops propagation).
  const handleGlobalTouchStartCapture = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 2) return;

    e.preventDefault();
    const startDistance = getTouchDistance(e.touches);
    const startMid = getTouchMidpoint(e.touches);
    pinchRef.current = {
      startDistance: startDistance || 1,
      startMid,
      startOffset: offsetRef.current,
      startZoom: zoomRef.current,
      lastZoom: zoomRef.current,
    };
    setIsGesturing(true);
  }, []);

  const handleGlobalTouchMoveCapture = useCallback((e: TouchEvent) => {
    if (!pinchRef.current) return;
    if (e.touches.length !== 2) return;

    e.preventDefault();

    const dist = getTouchDistance(e.touches);
    const mid = getTouchMidpoint(e.touches);

    const scale = dist / pinchRef.current.startDistance;
    const nextZoom = clamp(pinchRef.current.startZoom * scale, 0.25, 2);
    pinchRef.current.lastZoom = nextZoom;
    setLocalZoom(nextZoom);

    const dx = mid.x - pinchRef.current.startMid.x;
    const dy = mid.y - pinchRef.current.startMid.y;
    const nextOffset = {
      x: pinchRef.current.startOffset.x + dx,
      y: pinchRef.current.startOffset.y + dy,
    };

    setOffset(nextOffset);
    setTargetOffset(nextOffset);
  }, []);

  const handleGlobalTouchEndCapture = useCallback((e: TouchEvent) => {
    if (!pinchRef.current) return;

    // Gesture ends once fewer than 2 touches remain.
    if (e.touches.length < 2) {
      const committed = pinchRef.current.lastZoom;
      pinchRef.current = null;
      setIsGesturing(false);
      onZoomCommit?.(committed);
    }
  }, [onZoomCommit]);

  useEffect(() => {
    window.addEventListener('touchstart', handleGlobalTouchStartCapture, { passive: false, capture: true });
    window.addEventListener('touchmove', handleGlobalTouchMoveCapture, { passive: false, capture: true });
    window.addEventListener('touchend', handleGlobalTouchEndCapture, { passive: false, capture: true });
    window.addEventListener('touchcancel', handleGlobalTouchEndCapture, { passive: false, capture: true });

    return () => {
      window.removeEventListener('touchstart', handleGlobalTouchStartCapture, true);
      window.removeEventListener('touchmove', handleGlobalTouchMoveCapture, true);
      window.removeEventListener('touchend', handleGlobalTouchEndCapture, true);
      window.removeEventListener('touchcancel', handleGlobalTouchEndCapture, true);
    };
  }, [handleGlobalTouchStartCapture, handleGlobalTouchMoveCapture, handleGlobalTouchEndCapture]);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPanning, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

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
      className="spatial-bg w-full h-screen overflow-hidden cursor-grab touch-none"
      style={{
        cursor: isPanning || isGesturing ? 'grabbing' : 'grab',
        background: 'hsl(var(--canvas-bg))',
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
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
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${localZoom})`,
          transformOrigin: 'top left',
          transition: isPanning || isGesturing ? 'none' : 'transform 0.05s ease-out',
        }}
      >
        {/* Zone: Center (Main Grid) */}
        <div
          className="absolute"
          style={{
            left: ZONE_POSITIONS.center.x,
            top: ZONE_POSITIONS.center.y,
          }}
        >
          {children}
        </div>

        {/* Zone: Review Island (Above) */}
        <div
          className="absolute"
          style={{
            left: ZONE_POSITIONS.review.x,
            top: ZONE_POSITIONS.review.y,
          }}
        >
          <div className="w-[800px]">{renderZone('review')}</div>
        </div>

        {/* Zone: The Insane State (Far Above) */}
        <div
          className="absolute"
          style={{
            left: ZONE_POSITIONS.insane.x,
            top: ZONE_POSITIONS.insane.y,
          }}
        >
          <div className="w-[800px]">{renderZone('insane')}</div>
        </div>

        {/* Zone: Focus Zone (Above Insane) */}
        <div
          className="absolute"
          style={{
            left: ZONE_POSITIONS.focus.x,
            top: ZONE_POSITIONS.focus.y,
          }}
        >
          <div className="w-[800px]">{renderZone('focus')}</div>
        </div>

        {/* Zone: Journal World (Left) */}
        <div
          className="absolute"
          style={{
            left: ZONE_POSITIONS.journal.x,
            top: ZONE_POSITIONS.journal.y,
          }}
        >
          <div className="w-[600px]">{renderZone('journal')}</div>
        </div>

        {/* Zone: Recovery (Below) */}
        <div
          className="absolute"
          style={{
            left: ZONE_POSITIONS.recovery.x,
            top: ZONE_POSITIONS.recovery.y,
          }}
        >
          <div className="w-[800px]">{renderZone('recovery')}</div>
        </div>

        {/* Zone: Milestones (Right of Review) */}
        <div
          className="absolute"
          style={{
            left: ZONE_POSITIONS.milestones.x,
            top: ZONE_POSITIONS.milestones.y,
          }}
        >
          <div className="w-[600px]">{renderZone('milestones')}</div>
        </div>

        {/* Zone: Time Capsules (Right of Center) */}
        <div
          className="absolute"
          style={{
            left: ZONE_POSITIONS['time-capsules'].x,
            top: ZONE_POSITIONS['time-capsules'].y,
          }}
        >
          <div className="w-[600px]">{renderZone('time-capsules')}</div>
        </div>

        {/* Zone: Flame Shrine (Right of Recovery) */}
        <div
          className="absolute"
          style={{
            left: ZONE_POSITIONS['flame-shrine'].x,
            top: ZONE_POSITIONS['flame-shrine'].y,
          }}
        >
          <div className="w-[600px]">{renderZone('flame-shrine')}</div>
        </div>

        {/* Zone: Zen Garden (Above Focus, only when reached) */}
        <div
          className="absolute"
          style={{
            left: ZONE_POSITIONS['zen-garden'].x,
            top: ZONE_POSITIONS['zen-garden'].y,
          }}
        >
          <div className="w-[800px]">{renderZone('zen-garden')}</div>
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

