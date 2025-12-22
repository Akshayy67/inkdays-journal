import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, TimeOfDay, Stroke, RecoveryState, RoutineType } from '@/types/habit';
import { loadState, saveState, addHabit, deleteHabit, updateSettings, addRoutine, toggleHabitExpanded, setActiveRoutine, addReflection, markCelebrationShown } from '@/lib/storage';
import { getDateKey, getDatesInRange } from '@/lib/habitUtils';
import InfiniteCanvas from '@/components/InfiniteCanvas';
import HabitGridComponent from '@/components/HabitGrid';
import Toolbar from '@/components/Toolbar';
import AddHabitModal from '@/components/AddHabitModal';
import AddRoutineModal from '@/components/AddRoutineModal';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import WeeklyReflection from '@/components/WeeklyReflection';
import GentleRecovery from '@/components/GentleRecovery';
import ConfettiCelebration from '@/components/ConfettiCelebration';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isErasing, setIsErasing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddRoutineModal, setShowAddRoutineModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryState, setRecoveryState] = useState<RecoveryState | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const activeRoutine = state?.routines.find(r => r.id === state.activeRoutineId) || state?.routines[0];

  // Check for routine completion
  const routineCompletion = useMemo(() => {
    if (!activeRoutine) return 0;
    const dates = getDatesInRange(activeRoutine.startDate, activeRoutine.duration);
    const today = getDateKey(new Date());
    const pastDates = dates.filter(d => d <= today);
    
    if (pastDates.length === 0 || activeRoutine.habits.length === 0) return 0;
    
    let completed = 0;
    let total = 0;
    pastDates.forEach(date => {
      activeRoutine.habits.forEach(habit => {
        total++;
        if (habit.cells[date]?.completed) completed++;
      });
    });
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [activeRoutine]);

  // Check for celebration trigger
  useEffect(() => {
    if (activeRoutine && routineCompletion === 100 && !activeRoutine.celebrationShown) {
      const dates = getDatesInRange(activeRoutine.startDate, activeRoutine.duration);
      const today = getDateKey(new Date());
      const isComplete = dates[dates.length - 1] <= today;
      
      if (isComplete) {
        setShowCelebration(true);
      }
    }
  }, [activeRoutine, routineCompletion]);

  useEffect(() => {
    loadState().then(loadedState => {
      setState(loadedState);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAddModal || showAddRoutineModal || showReflection || showRecovery) return;
      
      switch (e.key.toLowerCase()) {
        case 'a': setShowAddModal(true); break;
        case 'e': if (!state?.settings.noUndoMode) setIsErasing(prev => !prev); break;
        case 'd': setShowAnalytics(prev => !prev); break;
        case 'r': setShowAddRoutineModal(true); break;
        case '+': case '=': handleZoomIn(); break;
        case '-': handleZoomOut(); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, showAddRoutineModal, showReflection, showRecovery, state?.settings.noUndoMode]);

  const handleCellUpdate = useCallback(async (habitId: string, dateKey: string, strokes: Stroke[], density: number, subHabitId?: string) => {
    if (!state || !activeRoutine) return;

    const newState = { ...state };
    const routine = newState.routines.find(r => r.id === activeRoutine.id);
    if (!routine) return;

    const habit = routine.habits.find(h => h.id === habitId);
    if (!habit) return;

    if (subHabitId) {
      const subHabit = habit.subHabits?.find(sh => sh.id === subHabitId);
      if (subHabit) {
        subHabit.cells[dateKey] = { strokes, completed: strokes.length > 0, strokeDensity: density, completedAt: strokes.length > 0 ? Date.now() : undefined, timeOfDay: subHabit.timeOfDay };
      }
    } else {
      habit.cells[dateKey] = { strokes, completed: strokes.length > 0, strokeDensity: density, completedAt: strokes.length > 0 ? Date.now() : undefined, timeOfDay: habit.timeOfDay };
    }
    
    await saveState(newState);
    setState(newState);
  }, [state, activeRoutine]);

  const handleAddHabit = useCallback(async (name: string, timeOfDay: TimeOfDay, parentHabitId?: string, intent?: string) => {
    if (!state || !activeRoutine) return;
    const newState = await addHabit(state, activeRoutine.id, { name, timeOfDay, intent }, parentHabitId);
    setState(newState);
    toast.success(parentHabitId ? `Added sub-habit: ${name}` : `Added habit: ${name}`);
  }, [state, activeRoutine]);

  const handleDeleteHabit = useCallback(async (habitId: string) => {
    if (!state || !activeRoutine) return;
    const habit = activeRoutine.habits.find(h => h.id === habitId);
    const newState = await deleteHabit(state, activeRoutine.id, habitId);
    setState(newState);
    toast.success(`Removed habit: ${habit?.name || 'Habit'}`);
  }, [state, activeRoutine]);

  const handleDeleteSubHabit = useCallback(async (habitId: string, subHabitId: string) => {
    if (!state || !activeRoutine) return;
    const newState = await deleteHabit(state, activeRoutine.id, habitId, subHabitId);
    setState(newState);
  }, [state, activeRoutine]);

  const handleToggleExpanded = useCallback(async (habitId: string) => {
    if (!state || !activeRoutine) return;
    const newState = await toggleHabitExpanded(state, activeRoutine.id, habitId);
    setState(newState);
  }, [state, activeRoutine]);

  const handleAddRoutine = useCallback(async (name: string, duration: number, startDate: string, routineType: RoutineType = 'permanent') => {
    if (!state) return;
    const newState = await addRoutine(state, { name, duration, startDate, position: { x: 100, y: 100 }, routineType, reflections: [] });
    setState(newState);
    toast.success(`Created routine: ${name}`);
  }, [state]);

  const handleSwitchRoutine = useCallback(async (routineId: string) => {
    if (!state) return;
    const newState = await setActiveRoutine(state, routineId);
    setState(newState);
  }, [state]);

  const handleUpdateSettings = useCallback(async (settings: Partial<typeof state.settings>) => {
    if (!state) return;
    const newState = await updateSettings(state, settings);
    setState(newState);
  }, [state]);

  const handleZoomIn = useCallback(() => { if (state) handleUpdateSettings({ zoom: Math.min(2, state.settings.zoom + 0.1) }); }, [state, handleUpdateSettings]);
  const handleZoomOut = useCallback(() => { if (state) handleUpdateSettings({ zoom: Math.max(0.25, state.settings.zoom - 0.1) }); }, [state, handleUpdateSettings]);
  const handlePanChange = useCallback((offset: { x: number; y: number }) => { if (state) handleUpdateSettings({ panOffset: offset }); }, [state, handleUpdateSettings]);

  const handleSaveReflection = useCallback(async (content: string) => {
    if (!state || !activeRoutine) return;
    const newState = await addReflection(state, activeRoutine.id, currentWeek, content);
    setState(newState);
  }, [state, activeRoutine, currentWeek]);

  const handleCelebrationComplete = useCallback(async () => {
    setShowCelebration(false);
    if (state && activeRoutine) {
      const newState = await markCelebrationShown(state, activeRoutine.id);
      setState(newState);
    }
  }, [state, activeRoutine]);

  const handleExport = useCallback(async () => {
    const element = document.getElementById('habit-grid-container');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { backgroundColor: '#0a0a0b', scale: 2 });
      const link = document.createElement('a');
      link.download = `inkdays-${getDateKey(new Date())}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success('Exported as PNG');
    } catch { toast.error('Failed to export'); }
  }, []);

  // Check if routine is faded (seasonal/temporary past end date)
  const isRoutineFaded = activeRoutine && activeRoutine.routineType !== 'permanent' && (() => {
    const endDate = new Date(activeRoutine.startDate);
    endDate.setDate(endDate.getDate() + activeRoutine.duration);
    return new Date() > endDate;
  })();

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
      <header className="fixed top-0 left-0 right-0 z-40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground tracking-tight">InkDays</h1>
            <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-full">Draw to complete</span>
          </div>
          
          <div className="flex items-center gap-2">
            {state.routines.map(routine => (
              <button
                key={routine.id}
                onClick={() => handleSwitchRoutine(routine.id)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all ${routine.id === activeRoutine?.id ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground hover:text-foreground border border-transparent'}`}
              >
                {routine.name}
              </button>
            ))}
            <button onClick={() => setShowAddRoutineModal(true)} className="px-2 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors">+ New</button>
          </div>
        </div>
      </header>

      <InfiniteCanvas settings={state.settings} onPanChange={handlePanChange} onZoomChange={(zoom) => handleUpdateSettings({ zoom })}>
        <div id="habit-grid-container" className={`p-8 ${isRoutineFaded ? 'opacity-60' : ''}`} style={{ minWidth: '800px' }}>
          {activeRoutine && (
            <HabitGridComponent routine={activeRoutine} settings={state.settings} isErasing={isErasing} onCellUpdate={handleCellUpdate} onDeleteHabit={handleDeleteHabit} onDeleteSubHabit={handleDeleteSubHabit} onToggleExpanded={handleToggleExpanded} />
          )}
        </div>
      </InfiniteCanvas>

      <Toolbar settings={state.settings} isErasing={isErasing} onToggleErase={() => setIsErasing(!isErasing)} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onAddHabit={() => setShowAddModal(true)} onToggleAnalytics={() => setShowAnalytics(!showAnalytics)} onUpdateSettings={handleUpdateSettings} onExport={handleExport} />

      <AddHabitModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddHabit} parentHabits={activeRoutine?.habits.map(h => ({ id: h.id, name: h.name })) || []} />
      <AddRoutineModal isOpen={showAddRoutineModal} onClose={() => setShowAddRoutineModal(false)} onAdd={handleAddRoutine} />
      <AnalyticsPanel isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} routine={activeRoutine} settings={state.settings} />
      <WeeklyReflection isOpen={showReflection} onClose={() => setShowReflection(false)} weekNumber={currentWeek} existingReflection={activeRoutine?.reflections?.find(r => r.weekNumber === currentWeek)} onSave={handleSaveReflection} />
      {recoveryState && <GentleRecovery isOpen={showRecovery} onClose={() => setShowRecovery(false)} recoveryState={recoveryState} onRestart={() => { setShowRecovery(false); }} onContinue={() => setShowRecovery(false)} />}
      <ConfettiCelebration isActive={showCelebration} onComplete={handleCelebrationComplete} />

      <div className="fixed bottom-6 right-6 z-40">
        <div className="text-xs text-muted-foreground space-y-1 text-right opacity-50 hover:opacity-100 transition-opacity">
          <p><kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">A</kbd> Add habit</p>
          <p><kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">R</kbd> New routine</p>
          <p><kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">E</kbd> Toggle eraser</p>
          <p><kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">D</kbd> Dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
