import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState, TimeOfDay, Stroke, RecoveryState, RoutineType } from '@/types/habit';
import { ZoneType, WorldState, defaultWorldState, MilestoneUnlocks } from '@/types/world';
import {
  loadState,
  saveState,
  addHabit,
  deleteHabit,
  updateSettings,
  addRoutine,
  toggleHabitExpanded,
  setActiveRoutine,
  addReflection,
  markCelebrationShown,
} from '@/lib/storage';
import {
  loadWorldState,
  saveWorldState,
  updateJournalState,
  updateInsaneProgress,
  updateMilestoneUnlocks,
  addTimeCapsule,
  calculateConsistencyDays,
} from '@/lib/worldStorage';
import { getDateKey, getDatesInRange } from '@/lib/habitUtils';
import { useAuth } from '@/hooks/useAuth';
import SpatialCanvas from '@/components/world/SpatialCanvas';
import WorldNavigator from '@/components/world/WorldNavigator';
import continuumHeader from '@/assets/continuum-header.png';
import ReviewIsland from '@/components/world/ReviewIsland';
import InsaneState from '@/components/world/InsaneState';
import FocusZone from '@/components/world/FocusZone';
import JournalWorld from '@/components/world/JournalWorld';
import RecoveryZone from '@/components/world/RecoveryZone';
import MilestonesZone from '@/components/world/MilestonesZone';
import TimeCapsuleZone from '@/components/world/TimeCapsuleZone';
import FlameShrineZone from '@/components/world/FlameShrineZone';
import ZenGardenZone from '@/components/world/ZenGardenZone';
import HabitGridComponent from '@/components/HabitGrid';
import Toolbar from '@/components/Toolbar';
import AddHabitModal from '@/components/AddHabitModal';
import AddRoutineModal from '@/components/AddRoutineModal';
import ConfettiCelebration from '@/components/ConfettiCelebration';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LogOut, Loader2 } from 'lucide-react';

const Index: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [state, setState] = useState<AppState | null>(null);
  const [worldState, setWorldState] = useState<WorldState>(defaultWorldState);
  const [isLoading, setIsLoading] = useState(true);
  const [isErasing, setIsErasing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddRoutineModal, setShowAddRoutineModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMiniCelebration, setShowMiniCelebration] = useState(false);
  const [showInsaneCelebration, setShowInsaneCelebration] = useState(false);

  const activeRoutine = state?.routines.find((r) => r.id === state.activeRoutineId) || state?.routines[0];

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load states
  useEffect(() => {
    if (!user) return;
    Promise.all([loadState(), Promise.resolve(loadWorldState())]).then(([appState, world]) => {
      setState(appState);
      setWorldState(world);
      setIsLoading(false);
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  // Track progress based on actual habit completion
  useEffect(() => {
    if (state?.routines) {
      const consistentDays = calculateConsistencyDays(state.routines);
      if (consistentDays !== worldState.insaneProgress.currentDay) {
        const wasNotReached = worldState.insaneProgress.currentDay < 50;
        const nowReached = consistentDays >= 50;
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
        case 'a':
          setShowAddModal(true);
          break;
        case 'e':
          if (!state?.settings.noUndoMode) setIsErasing((prev) => !prev);
          break;
        case 'r':
          setShowAddRoutineModal(true);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, showAddRoutineModal, state?.settings.noUndoMode]);

  const handleCellUpdate = useCallback(
    async (habitId: string, dateKey: string, strokes: Stroke[], density: number, subHabitId?: string) => {
      if (!state || !activeRoutine) return;
      const newState = { ...state };
      const routine = newState.routines.find((r) => r.id === activeRoutine.id);
      if (!routine) return;
      const habit = routine.habits.find((h) => h.id === habitId);
      if (!habit) return;

      const wasCompleted = subHabitId
        ? habit.subHabits?.find((sh) => sh.id === subHabitId)?.cells[dateKey]?.completed
        : habit.cells[dateKey]?.completed;
      const isNowCompleted = strokes.length > 0;

      if (subHabitId) {
        const subHabit = habit.subHabits?.find((sh) => sh.id === subHabitId);
        if (subHabit) {
          subHabit.cells[dateKey] = {
            strokes,
            completed: isNowCompleted,
            strokeDensity: density,
            completedAt: isNowCompleted ? Date.now() : undefined,
            timeOfDay: subHabit.timeOfDay,
          };
        }
      } else {
        habit.cells[dateKey] = {
          strokes,
          completed: isNowCompleted,
          strokeDensity: density,
          completedAt: isNowCompleted ? Date.now() : undefined,
          timeOfDay: habit.timeOfDay,
        };
      }

      await saveState(newState);
      setState(newState);
      if (!wasCompleted && isNowCompleted) setShowMiniCelebration(true);
    },
    [state, activeRoutine]
  );

  const handleAddHabit = useCallback(
    async (name: string, timeOfDay: TimeOfDay, parentHabitId?: string, intent?: string) => {
      if (!state || !activeRoutine) return;
      const newState = await addHabit(state, activeRoutine.id, { name, timeOfDay, intent }, parentHabitId);
      setState(newState);
      toast.success(parentHabitId ? `Added sub-habit: ${name}` : `Added habit: ${name}`);
    },
    [state, activeRoutine]
  );

  const handleDeleteHabit = useCallback(
    async (habitId: string) => {
      if (!state || !activeRoutine) return;
      const newState = await deleteHabit(state, activeRoutine.id, habitId);
      setState(newState);
    },
    [state, activeRoutine]
  );

  const handleDeleteSubHabit = useCallback(
    async (habitId: string, subHabitId: string) => {
      if (!state || !activeRoutine) return;
      const newState = await deleteHabit(state, activeRoutine.id, habitId, subHabitId);
      setState(newState);
    },
    [state, activeRoutine]
  );

  const handleToggleExpanded = useCallback(
    async (habitId: string) => {
      if (!state || !activeRoutine) return;
      const newState = await toggleHabitExpanded(state, activeRoutine.id, habitId);
      setState(newState);
    },
    [state, activeRoutine]
  );

  const handleAddRoutine = useCallback(
    async (
      name: string,
      duration: number,
      startDate: string,
      routineType: RoutineType = 'permanent'
    ) => {
      if (!state) return;
      const newState = await addRoutine(state, {
        name,
        duration,
        startDate,
        position: { x: 100, y: 100 },
        routineType,
        reflections: [],
      });
      setState(newState);
      toast.success(`Created routine: ${name}`);
    },
    [state]
  );

  const handleSwitchRoutine = useCallback(
    async (routineId: string) => {
      if (!state) return;
      const newState = await setActiveRoutine(state, routineId);
      setState(newState);
    },
    [state]
  );

  const handleZoneChange = useCallback(
    (zone: ZoneType) => {
      const newWorld = { ...worldState, currentZone: zone };
      if (!newWorld.visitedZones.includes(zone)) {
        newWorld.visitedZones = [...newWorld.visitedZones, zone];
      }
      setWorldState(newWorld);
      saveWorldState(newWorld);
    },
    [worldState]
  );

  const handleNavigate = useCallback((zone: ZoneType) => {
    (window as any).__navigateToZone?.(zone);
  }, []);

  const handleUpdateUnlocks = useCallback(
    (updates: Partial<MilestoneUnlocks>) => {
      const newWorld = updateMilestoneUnlocks(worldState, updates);
      setWorldState(newWorld);
    },
    [worldState]
  );

  const handleAddTimeCapsule = useCallback(
    (message: string) => {
      const newWorld = addTimeCapsule(worldState, message);
      setWorldState(newWorld);
      toast.success('Time capsule sealed!');
    },
    [worldState]
  );

  const handleZoomCommit = useCallback(
    (zoom: number) => {
      if (!state) return;
      updateSettings(state, { zoom }).then(setState);
    },
    [state]
  );

  const renderZone = useCallback(
    (zone: ZoneType) => {
      const hasReached = worldState.insaneProgress.currentDay >= 50;

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
            <RecoveryZone habits={activeRoutine?.habits || []} onRestart={() => {}} onContinue={() => {}} />
          );
        case 'milestones':
          return (
            <MilestonesZone
              currentDay={worldState.insaneProgress.currentDay}
              unlocks={worldState.insaneProgress.unlocks}
              onUpdateUnlocks={handleUpdateUnlocks}
              onBack={() => handleNavigate('center')}
            />
          );
        case 'time-capsules':
          return (
            <TimeCapsuleZone
              capsules={worldState.insaneProgress.timeCapsules}
              currentDay={worldState.insaneProgress.currentDay}
              hasReached={hasReached}
              onAddCapsule={handleAddTimeCapsule}
              onBack={() => handleNavigate('center')}
            />
          );
        case 'flame-shrine':
          return (
            <FlameShrineZone
              flameStrength={worldState.insaneProgress.flameStrength}
              consecutiveStreak={worldState.insaneProgress.consecutiveStreak}
              hasReached={hasReached}
              onBack={() => handleNavigate('center')}
            />
          );
        case 'zen-garden':
          return hasReached ? <ZenGardenZone onBack={() => handleNavigate('insane')} /> : null;
        default:
          return null;
      }
    },
    [activeRoutine, state?.routines, worldState, handleNavigate, handleUpdateUnlocks, handleAddTimeCapsule]
  );

  if (authLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-canvas flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm sm:text-base text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading || !state) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-canvas flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">CONTINUUM</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Loading your world...</p>
        </div>
      </div>
    );
  }

  const isRoutineFaded =
    activeRoutine &&
    activeRoutine.routineType !== 'permanent' &&
    (() => {
      const endDate = new Date(activeRoutine.startDate);
      endDate.setDate(endDate.getDate() + activeRoutine.duration);
      return new Date() > endDate;
    })();

  const hasReachedInsane = worldState.insaneProgress.currentDay >= 50;

  return (
    <div
      className={`min-h-screen min-h-[100dvh] overflow-hidden transition-all duration-1000 ${hasReachedInsane ? 'bg-gradient-to-br from-canvas via-canvas to-primary/5' : 'bg-canvas'}`}
    >
      <h1 className="sr-only">CONTINUUM spatial habit tracker</h1>
      
      {/* Header - Mobile optimized with safe area */}
      <header className="fixed top-0 left-0 right-0 z-40 safe-top px-2 xs:px-3 sm:px-4 py-2 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto gap-2 max-w-full">
          {/* Logo - responsive sizing */}
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 flex-shrink-0">
            <img
              src={continuumHeader}
              alt="CONTINUUM - Spatial Habit Tracker"
              className={`h-5 xs:h-6 sm:h-8 md:h-10 w-auto object-contain transition-all ${hasReachedInsane ? 'drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]' : ''}`}
            />
            {hasReachedInsane && (
              <span className="hidden xs:inline-flex text-[9px] xs:text-[10px] sm:text-xs font-semibold px-1.5 xs:px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30 animate-pulse">
                ⚡ INSANE
              </span>
            )}
          </div>
          
          {/* Routine tabs - scrollable on mobile */}
          <div className="flex items-center gap-1 overflow-x-auto flex-shrink min-w-0 scrollbar-hide">
            {state.routines.map((routine) => (
              <button
                key={routine.id}
                onClick={() => handleSwitchRoutine(routine.id)}
                className={`min-h-touch px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-2 text-[10px] xs:text-xs sm:text-sm rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
                  routine.id === activeRoutine?.id
                    ? hasReachedInsane
                      ? 'bg-primary/30 text-primary border border-primary/40 shadow-lg shadow-primary/20'
                      : 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-secondary text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                {routine.name}
              </button>
            ))}
            <button
              onClick={() => setShowAddRoutineModal(true)}
              className="min-h-touch min-w-touch px-2 py-1.5 xs:py-2 text-[10px] xs:text-xs sm:text-sm rounded-lg bg-secondary text-muted-foreground hover:text-foreground flex-shrink-0 flex items-center justify-center"
              aria-label="Add routine"
            >
              +
            </button>
            
            {/* Sign out button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="min-h-touch ml-1 xs:ml-2 flex-shrink-0"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Spatial Canvas World */}
      <SpatialCanvas
        settings={state.settings}
        worldState={worldState}
        onZoneChange={handleZoneChange}
        onZoomCommit={handleZoomCommit}
        renderZone={renderZone}
      >
        <div
          id="habit-grid-container"
          className={`p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 ${isRoutineFaded ? 'opacity-60' : ''}`}
        >
          {activeRoutine && (
            <HabitGridComponent
              routine={activeRoutine}
              settings={state.settings}
              isErasing={isErasing}
              onCellUpdate={handleCellUpdate}
              onDeleteHabit={handleDeleteHabit}
              onDeleteSubHabit={handleDeleteSubHabit}
              onToggleExpanded={handleToggleExpanded}
            />
          )}
        </div>
      </SpatialCanvas>

      {/* World Navigator */}
      <WorldNavigator
        currentZone={worldState.currentZone}
        onNavigate={handleNavigate}
        canAccessFocus={worldState.visitedZones.includes('review')}
        insaneReached={worldState.insaneProgress.currentDay >= 50}
      />

      {/* Toolbar */}
      <Toolbar
        settings={state.settings}
        isErasing={isErasing}
        onToggleErase={() => setIsErasing(!isErasing)}
        onZoomIn={() => updateSettings(state, { zoom: Math.min(2, state.settings.zoom + 0.1) }).then(setState)}
        onZoomOut={() => updateSettings(state, { zoom: Math.max(0.25, state.settings.zoom - 0.1) }).then(setState)}
        onAddHabit={() => setShowAddModal(true)}
        onToggleAnalytics={() => handleNavigate('review')}
        onUpdateSettings={(s) => updateSettings(state, s).then(setState)}
        onExport={() => {}}
      />

      {/* Modals */}
      <AddHabitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddHabit}
        parentHabits={activeRoutine?.habits.map((h) => ({ id: h.id, name: h.name })) || []}
      />
      <AddRoutineModal
        isOpen={showAddRoutineModal}
        onClose={() => setShowAddRoutineModal(false)}
        onAdd={handleAddRoutine}
      />

      {/* Celebrations */}
      <ConfettiCelebration isActive={showCelebration} onComplete={() => setShowCelebration(false)} />
      <ConfettiCelebration isActive={showMiniCelebration} onComplete={() => setShowMiniCelebration(false)} mini />
      <ConfettiCelebration isActive={showInsaneCelebration} onComplete={() => setShowInsaneCelebration(false)} />

      {/* Navigation hints - hidden on mobile and tablet */}
      <div className="fixed bottom-6 right-6 z-40 text-xs text-muted-foreground/50 text-right hidden lg:block">
        <p>Arrow keys to navigate world</p>
        <p>Drag to pan freely</p>
      </div>
    </div>
  );
};

export default Index;