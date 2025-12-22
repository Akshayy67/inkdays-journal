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

  useEffect(() => {
    setLocalOffset(settings.panOffset);
  }, [settings.panOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking on the canvas background (not on children)
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
      className="canvas-container w-full h-screen cursor-grab"
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
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
