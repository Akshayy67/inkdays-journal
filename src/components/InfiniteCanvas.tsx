import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AppSettings } from '@/types/habit';

interface InfiniteCanvasProps {
  children: React.ReactNode;
  settings: AppSettings;
  onPanChange: (offset: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
}

const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  children,
  settings,
  onPanChange,
  onZoomChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [localOffset, setLocalOffset] = useState(settings.panOffset);
  
  // Touch-specific state
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [initialPinchZoom, setInitialPinchZoom] = useState(settings.zoom);

  useEffect(() => {
    setLocalOffset(settings.panOffset);
  }, [settings.panOffset]);

  // Calculate distance between two touch points
  const getTouchDistance = (touches: React.TouchList | TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('canvas-container')) {
      setIsPanning(true);
      setStartPan({
        x: e.clientX - localOffset.x,
        y: e.clientY - localOffset.y,
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return;
    
    const newOffset = {
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    };
    setLocalOffset(newOffset);
  }, [isPanning, startPan]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      onPanChange(localOffset);
    }
  }, [isPanning, localOffset, onPanChange]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const isBackground = e.target === containerRef.current || target.classList.contains('canvas-container');
    
    if (e.touches.length === 2) {
      // Pinch-to-zoom start
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
      setInitialPinchZoom(settings.zoom);
    } else if (e.touches.length === 1 && isBackground) {
      // Single touch pan
      const touch = e.touches[0];
      setIsPanning(true);
      setStartPan({
        x: touch.clientX - localOffset.x,
        y: touch.clientY - localOffset.y,
      });
    }
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance !== null) {
      // Pinch-to-zoom
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / lastTouchDistance;
      const newZoom = Math.max(0.25, Math.min(2, initialPinchZoom * scale));
      onZoomChange(newZoom);
    } else if (e.touches.length === 1 && isPanning) {
      // Single touch pan
      e.preventDefault();
      const touch = e.touches[0];
      const newOffset = {
        x: touch.clientX - startPan.x,
        y: touch.clientY - startPan.y,
      };
      setLocalOffset(newOffset);
    }
  }, [isPanning, startPan, lastTouchDistance, initialPinchZoom, onZoomChange]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) {
      setLastTouchDistance(null);
    }
    if (e.touches.length === 0) {
      if (isPanning) {
        setIsPanning(false);
        onPanChange(localOffset);
      }
    }
  }, [isPanning, localOffset, onPanChange]);

  // Mouse event listeners
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

  // Touch event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const touchMoveHandler = (e: TouchEvent) => handleTouchMove(e);
    const touchEndHandler = (e: TouchEvent) => handleTouchEnd(e);

    container.addEventListener('touchmove', touchMoveHandler, { passive: false });
    container.addEventListener('touchend', touchEndHandler);
    container.addEventListener('touchcancel', touchEndHandler);

    return () => {
      container.removeEventListener('touchmove', touchMoveHandler);
      container.removeEventListener('touchend', touchEndHandler);
      container.removeEventListener('touchcancel', touchEndHandler);
    };
  }, [handleTouchMove, handleTouchEnd]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.25, Math.min(2, settings.zoom + delta));
      onZoomChange(newZoom);
    }
  };

  return (
    <div
      ref={containerRef}
      className="canvas-container w-full h-screen cursor-grab touch-none"
      style={{ 
        cursor: isPanning ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
    >
      <div
        className="relative"
        style={{
          transform: `translate(${localOffset.x}px, ${localOffset.y}px) scale(${settings.zoom})`,
          transformOrigin: 'top left',
          transition: isPanning ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default InfiniteCanvas;
