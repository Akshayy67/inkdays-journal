import React, { useState, useEffect, useCallback } from 'react';
import { AppState, TimeOfDay, Stroke } from '@/types/habit';
import { loadState, saveState, addHabit, deleteHabit, updateSettings } from '@/lib/storage';
import { getDateKey } from '@/lib/habitUtils';
import InfiniteCanvas from '@/components/InfiniteCanvas';
import HabitGridComponent from '@/components/HabitGrid';
import Toolbar from '@/components/Toolbar';
import AddHabitModal from '@/components/AddHabitModal';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isErasing, setIsErasing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    loadState().then(loadedState => {
      setState(loadedState);
      setIsLoading(false);
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAddModal) return;
      
      switch (e.key.toLowerCase()) {
        case 'a':
          setShowAddModal(true);
          break;
        case 'e':
          if (!state?.settings.noUndoMode) {
            setIsErasing(prev => !prev);
          }
          break;
        case 'd':
          setShowAnalytics(prev => !prev);
          break;
        case 's':
          // Settings handled in toolbar
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, state?.settings.noUndoMode]);

  const handleCellUpdate = useCallback(async (
    habitId: string,
    dateKey: string,
    strokes: Stroke[],
    density: number
  ) => {
    if (!state) return;

    const newState = { ...state };
    const grid = newState.grids[0];
    const habit = grid.habits.find(h => h.id === habitId);
    
    if (habit) {
      habit.cells[dateKey] = {
        strokes,
        completed: strokes.length > 0,
        strokeDensity: density,
        completedAt: strokes.length > 0 ? Date.now() : undefined,
        timeOfDay: habit.timeOfDay,
      };
      
      await saveState(newState);
      setState(newState);
    }
  }, [state]);

  const handleAddHabit = useCallback(async (name: string, timeOfDay: TimeOfDay) => {
    if (!state) return;
    
    const newState = await addHabit(state, state.grids[0].id, { name, timeOfDay });
    setState(newState);
    toast.success(`Added habit: ${name}`);
  }, [state]);

  const handleDeleteHabit = useCallback(async (habitId: string) => {
    if (!state) return;
    
    const habit = state.grids[0].habits.find(h => h.id === habitId);
    const newState = await deleteHabit(state, state.grids[0].id, habitId);
    setState(newState);
    toast.success(`Removed habit: ${habit?.name || 'Habit'}`);
  }, [state]);

  const handleUpdateSettings = useCallback(async (settings: Partial<typeof state.settings>) => {
    if (!state) return;
    
    const newState = await updateSettings(state, settings);
    setState(newState);
  }, [state]);

  const handleZoomIn = useCallback(() => {
    if (!state) return;
    const newZoom = Math.min(2, state.settings.zoom + 0.1);
    handleUpdateSettings({ zoom: newZoom });
  }, [state, handleUpdateSettings]);

  const handleZoomOut = useCallback(() => {
    if (!state) return;
    const newZoom = Math.max(0.25, state.settings.zoom - 0.1);
    handleUpdateSettings({ zoom: newZoom });
  }, [state, handleUpdateSettings]);

  const handlePanChange = useCallback((offset: { x: number; y: number }) => {
    if (!state) return;
    handleUpdateSettings({ panOffset: offset });
  }, [state, handleUpdateSettings]);

  const handleExport = useCallback(async () => {
    const element = document.getElementById('habit-grid-container');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#0a0a0b',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `inkdays-${getDateKey(new Date())}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('Exported as PNG');
    } catch (error) {
      toast.error('Failed to export');
    }
  }, []);

  if (isLoading || !state) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-2">InkDays</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground tracking-tight">InkDays</h1>
            <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full">
              Draw to complete
            </span>
          </div>
          
          {!state.settings.silentMode && state.grids[0].habits.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{state.grids[0].habits.length} habits</span>
            </div>
          )}
        </div>
      </header>

      {/* Infinite Canvas */}
      <InfiniteCanvas
        settings={state.settings}
        onPanChange={handlePanChange}
        onZoomChange={(zoom) => handleUpdateSettings({ zoom })}
      >
        <div id="habit-grid-container" className="p-8" style={{ minWidth: '800px' }}>
          <HabitGridComponent
            habits={state.grids[0].habits}
            startDate={state.grids[0].startDate}
            daysVisible={state.grids[0].daysVisible}
            settings={state.settings}
            isErasing={isErasing}
            onCellUpdate={handleCellUpdate}
            onDeleteHabit={handleDeleteHabit}
          />
        </div>
      </InfiniteCanvas>

      {/* Toolbar */}
      <Toolbar
        settings={state.settings}
        isErasing={isErasing}
        onToggleErase={() => setIsErasing(!isErasing)}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onAddHabit={() => setShowAddModal(true)}
        onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
        onUpdateSettings={handleUpdateSettings}
        onExport={handleExport}
      />

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddHabit}
      />

      {/* Analytics Panel */}
      <AnalyticsPanel
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        habits={state.grids[0].habits}
        settings={state.settings}
      />

      {/* Keyboard shortcuts hint */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="text-xs text-muted-foreground space-y-1 text-right opacity-50 hover:opacity-100 transition-opacity">
          <p><kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">A</kbd> Add habit</p>
          <p><kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">E</kbd> Toggle eraser</p>
          <p><kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">D</kbd> Dashboard</p>
          <p><kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">+/-</kbd> Zoom</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
