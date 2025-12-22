import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stroke } from '@/types/habit';
import { calculateStrokeDensity } from '@/lib/habitUtils';

interface DrawingCellProps {
  strokes: Stroke[];
  onStrokesChange: (strokes: Stroke[], density: number) => void;
  completed: boolean;
  isErasing: boolean;
  noUndoMode: boolean;
  isPressured: boolean;
  timeColor: string;
  disabled?: boolean;
}

const DrawingCell: React.FC<DrawingCellProps> = ({
  strokes,
  onStrokesChange,
  completed,
  isErasing,
  noUndoMode,
  isPressured,
  timeColor,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const drawStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background based on state
    if (isPressured && !completed) {
      ctx.fillStyle = 'hsla(0, 40%, 15%, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw all strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      ctx.beginPath();
      ctx.strokeStyle = completed ? timeColor : 'hsl(175, 35%, 55%)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });

    // Draw current stroke
    if (currentStroke.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'hsl(175, 35%, 55%)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      currentStroke.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
  }, [strokes, currentStroke, completed, isPressured, timeColor, getCanvasContext]);

  useEffect(() => {
    drawStrokes();
  }, [drawStrokes]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    if (noUndoMode && completed) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const coords = getCoordinates(e);
    if (!coords) return;

    if (isErasing && !noUndoMode) {
      // Erase mode - remove strokes near the click point
      const newStrokes = strokes.filter(stroke => {
        return !stroke.points.some(point => {
          const distance = Math.sqrt(
            Math.pow(point.x - coords.x, 2) + Math.pow(point.y - coords.y, 2)
          );
          return distance < 10;
        });
      });
      
      const density = calculateStrokeDensity(newStrokes);
      onStrokesChange(newStrokes, density);
    } else {
      setIsDrawing(true);
      setCurrentStroke([coords]);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const coords = getCoordinates(e);
    if (!coords) return;

    setCurrentStroke(prev => [...prev, coords]);
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (currentStroke.length > 1) {
      const newStrokes = [
        ...strokes,
        { points: currentStroke, timestamp: Date.now() },
      ];
      const density = calculateStrokeDensity(newStrokes);
      onStrokesChange(newStrokes, density);
    }
    
    setIsDrawing(false);
    setCurrentStroke([]);
  };

  const handleLeave = () => {
    if (isDrawing && currentStroke.length > 1) {
      const newStrokes = [
        ...strokes,
        { points: currentStroke, timestamp: Date.now() },
      ];
      const density = calculateStrokeDensity(newStrokes);
      onStrokesChange(newStrokes, density);
    }
    setIsDrawing(false);
    setCurrentStroke([]);
  };

  return (
    <canvas
      ref={canvasRef}
      width={48}
      height={48}
      className={`
        drawing-canvas w-full h-full rounded-sm touch-none
        ${isErasing && !noUndoMode ? 'erasing' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isPressured && !completed ? 'shadow-inner' : ''}
      `}
      style={{ touchAction: 'none' }}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleLeave}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleLeave}
    />
  );
};

export default DrawingCell;
