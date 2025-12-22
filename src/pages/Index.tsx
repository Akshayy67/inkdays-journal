import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, TimeOfDay, Stroke, RecoveryState, RoutineType } from '@/types/habit';
import { ZoneType, WorldState, defaultWorldState } from '@/types/world';
import { loadState, saveState, addHabit, deleteHabit, updateSettings, addRoutine, toggleHabitExpanded, setActiveRoutine, addReflection, markCelebrationShown } from '@/lib/storage';
import { loadWorldState, saveWorldState, updateJournalState, updateInsaneProgress, calculateConsistencyDays } from '@/lib/worldStorage';
import { getDateKey, getDatesInRange } from '@/lib/habitUtils';
import SpatialCanvas from '@/components/world/SpatialCanvas';
import WorldNavigator from '@/components/world/WorldNavigator';

import ReviewIsland from '@/components/world/ReviewIsland';
import InsaneState from '@/components/world/InsaneState';
import FocusZone from '@/components/world/FocusZone';
import JournalWorld from '@/components/world/JournalWorld';
import RecoveryZone from '@/components/world/RecoveryZone';
import HabitGridComponent from '@/components/HabitGrid';
import Toolbar from '@/components/Toolbar';
import AddHabitModal from '@/components/AddHabitModal';
import AddRoutineModal from '@/components/AddRoutineModal';
import ConfettiCelebration from '@/components/ConfettiCelebration';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [worldState, setWorldState] = useState<WorldState>(defaultWorldState);
  const [isLoading, setIsLoading] = useState(true);
  const [isErasing, setIsErasing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddRoutineModal, setShowAddRoutineModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMiniCelebration, setShowMiniCelebration] = useState(false);
  const [showInsaneCelebration, setShowInsaneCelebration] = useState(false);

  const activeRoutine = state?.routines.find(r => r.id === state.activeRoutineId) || state?.routines[0];

  // Load states
  useEffect(() => {
    Promise.all([loadState(), Promise.resolve(loadWorldState())]).then(([appState, world]) => {
      setState(appState);
      setWorldState(world);
      setIsLoading(false);
    });
  }, []);

  // Update insane progress based on consistency
  useEffect(() => {
    if (state?.routines) {
      const consistentDays = calculateConsistencyDays(state.routines);
      if (consistentDays !== worldState.insaneProgress.currentDay) {
        const wasNotReached = worldState.insaneProgress.currentDay < 500;
        const nowReached = consistentDays >= 500;
        
        const newWorld = updateInsaneProgress(worldState, { currentDay: consistentDays });
        setWorldState(newWorld);
        
        if (wasNotReached && nowReached) {
          setShowInsaneCelebration(true);
        }
      }
    }
  }, [state?.routines]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAddModal || showAddRoutineModal) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case 'a': setShowAddModal(true); break;
        case 'e': if (!state?.settings.noUndoMode) setIsErasing(prev => !prev); break;
        case 'r': setShowAddRoutineModal(true); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, showAddRoutineModal, state?.settings.noUndoMode]);

  const handleCellUpdate = useCallback(async (habitId: string, dateKey: string, strokes: Stroke[], density: number, subHabitId?: string) => {
    if (!state || !activeRoutine) return;
    const newState = { ...state };
    const routine = newState.routines.find(r => r.id === activeRoutine.id);
    if (!routine) return;
    const habit = routine.habits.find(h => h.id === habitId);
    if (!habit) return;

    const wasCompleted = subHabitId 
      ? habit.subHabits?.find(sh => sh.id === subHabitId)?.cells[dateKey]?.completed
      : habit.cells[dateKey]?.completed;
    const isNowCompleted = strokes.length > 0;

    if (subHabitId) {
      const subHabit = habit.subHabits?.find(sh => sh.id === subHabitId);
      if (subHabit) {
        subHabit.cells[dateKey] = { strokes, completed: isNowCompleted, strokeDensity: density, completedAt: isNowCompleted ? Date.now() : undefined, timeOfDay: subHabit.timeOfDay };
      }
    } else {
      habit.cells[dateKey] = { strokes, completed: isNowCompleted, strokeDensity: density, completedAt: isNowCompleted ? Date.now() : undefined, timeOfDay: habit.timeOfDay };
    }
    
    await saveState(newState);
    setState(newState);
    if (!wasCompleted && isNowCompleted) setShowMiniCelebration(true);
  }, [state, activeRoutine]);

  const handleAddHabit = useCallback(async (name: string, timeOfDay: TimeOfDay, parentHabitId?: string, intent?: string) => {
    if (!state || !activeRoutine) return;
    const newState = await addHabit(state, activeRoutine.id, { name, timeOfDay, intent }, parentHabitId);
    setState(newState);
    toast.success(parentHabitId ? `Added sub-habit: ${name}` : `Added habit: ${name}`);
  }, [state, activeRoutine]);

  const handleDeleteHabit = useCallback(async (habitId: string) => {
    if (!state || !activeRoutine) return;
    const newState = await deleteHabit(state, activeRoutine.id, habitId);
    setState(newState);
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

  const handleZoneChange = useCallback((zone: ZoneType) => {
    const newWorld = { ...worldState, currentZone: zone };
    if (!newWorld.visitedZones.includes(zone)) {
      newWorld.visitedZones = [...newWorld.visitedZones, zone];
    }
    setWorldState(newWorld);
    saveWorldState(newWorld);
  }, [worldState]);

  const handleNavigate = useCallback((zone: ZoneType) => {
    (window as any).__navigateToZone?.(zone);
  }, []);

  const renderZone = useCallback((zone: ZoneType) => {
    switch (zone) {
      case 'review':
        return <ReviewIsland routine={activeRoutine} allRoutines={state?.routines || []} />;
      case 'insane':
        return (
          <InsaneState 
            progress={worldState.insaneProgress} 
            onExplore={() => {
              const newWorld = updateInsaneProgress(worldState, { isExploring: true });
              setWorldState(newWorld);
            }}
          />
        );
      case 'focus':
        return <FocusZone onBack={() => handleNavigate('insane')} />;
      case 'journal':
        return (
          <JournalWorld 
            journalState={worldState.journalState}
            onUpdateJournal={(updates) => {
              const newWorld = updateJournalState(worldState, updates);
              setWorldState(newWorld);
            }}
          />
        );
      case 'recovery':
        return (
          <RecoveryZone 
            habits={activeRoutine?.habits || []}
            onRestart={() => {}}
            onContinue={() => {}}
          />
        );
      default:
        return null;
    }
  }, [activeRoutine, state?.routines, worldState, handleNavigate]);

  if (isLoading || !state) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-2">InkDays</h1>
          <p className="text-muted-foreground">Loading your world...</p>
        </div>
      </div>
    );
  }

  const isRoutineFaded = activeRoutine && activeRoutine.routineType !== 'permanent' && (() => {
    const endDate = new Date(activeRoutine.startDate);
    endDate.setDate(endDate.getDate() + activeRoutine.duration);
    return new Date() > endDate;
  })();

  return (
    <div className="min-h-screen bg-canvas overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 p-4 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground tracking-tight">InkDays</h1>
            <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary/80 rounded-full">Spatial World</span>
          </div>
          <div className="flex items-center gap-2">
            {state.routines.map(routine => (
              <button key={routine.id} onClick={() => handleSwitchRoutine(routine.id)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all ${routine.id === activeRoutine?.id ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground hover:text-foreground border border-transparent'}`}>
                {routine.name}
              </button>
            ))}
            <button onClick={() => setShowAddRoutineModal(true)} className="px-2 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground hover:text-foreground">+ New</button>
          </div>
        </div>
      </header>

      {/* Spatial Canvas World */}
      <SpatialCanvas settings={state.settings} worldState={worldState} onZoneChange={handleZoneChange} renderZone={renderZone}>
        <div id="habit-grid-container" className={`p-8 ${isRoutineFaded ? 'opacity-60' : ''}`} style={{ minWidth: '800px' }}>
          {activeRoutine && (
            <HabitGridComponent routine={activeRoutine} settings={state.settings} isErasing={isErasing} onCellUpdate={handleCellUpdate} onDeleteHabit={handleDeleteHabit} onDeleteSubHabit={handleDeleteSubHabit} onToggleExpanded={handleToggleExpanded} />
          )}
        </div>
      </SpatialCanvas>


      {/* World Navigator */}
      <WorldNavigator 
        currentZone={worldState.currentZone} 
        onNavigate={handleNavigate}
        canAccessFocus={worldState.visitedZones.includes('review')}
        insaneReached={worldState.insaneProgress.currentDay >= 500}
      />

      {/* Toolbar */}
      <Toolbar settings={state.settings} isErasing={isErasing} onToggleErase={() => setIsErasing(!isErasing)} 
        onZoomIn={() => updateSettings(state, { zoom: Math.min(2, state.settings.zoom + 0.1) }).then(setState)}
        onZoomOut={() => updateSettings(state, { zoom: Math.max(0.25, state.settings.zoom - 0.1) }).then(setState)}
        onAddHabit={() => setShowAddModal(true)} onToggleAnalytics={() => handleNavigate('review')}
        onUpdateSettings={(s) => updateSettings(state, s).then(setState)} onExport={() => {}} />

      {/* Modals */}
      <AddHabitModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddHabit} parentHabits={activeRoutine?.habits.map(h => ({ id: h.id, name: h.name })) || []} />
      <AddRoutineModal isOpen={showAddRoutineModal} onClose={() => setShowAddRoutineModal(false)} onAdd={handleAddRoutine} />
      
      {/* Celebrations */}
      <ConfettiCelebration isActive={showCelebration} onComplete={() => setShowCelebration(false)} />
      <ConfettiCelebration isActive={showMiniCelebration} onComplete={() => setShowMiniCelebration(false)} mini />
      <ConfettiCelebration isActive={showInsaneCelebration} onComplete={() => setShowInsaneCelebration(false)} />

      {/* Navigation hints */}
      <div className="fixed bottom-6 right-6 z-40 text-xs text-muted-foreground/50 text-right">
        <p>Arrow keys to navigate world</p>
        <p>Drag to pan freely</p>
      </div>
    </div>
  );
};

export default Index;
