import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { AppState, Routine, Habit, CellData, AppSettings, TimeOfDay, RoutineType, SubHabit, WeeklyReflection } from '@/types/habit';

const defaultSettings: AppSettings = {
  pressureMode: false,
  noUndoMode: false,
  silentMode: false,
  zoom: 1,
  panOffset: { x: 0, y: 0 },
};

interface DbRoutine {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  sort_order: number | null;
}

interface DbHabit {
  id: string;
  name: string;
  color: string | null;
  routine_id: string;
  parent_id: string | null;
  sort_order: number | null;
  is_expanded: boolean | null;
}

interface DbHabitCell {
  id: string;
  habit_id: string;
  date: string;
  value: number | null;
}

interface DbUserSettings {
  active_routine_id: string | null;
  canvas_zoom: number | null;
  canvas_offset_x: number | null;
  canvas_offset_y: number | null;
  show_weekends: boolean | null;
}

interface DbReflection {
  id: string;
  routine_id: string | null;
  week_start: string;
  went_well: string | null;
  improve: string | null;
  goals: string | null;
}

export function useSupabaseStorage() {
  const { user } = useAuth();
  const [state, setState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data from database
  const loadFromDatabase = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch all data in parallel
      const [routinesRes, habitsRes, cellsRes, settingsRes, reflectionsRes] = await Promise.all([
        supabase.from('routines').select('*').order('sort_order'),
        supabase.from('habits').select('*').order('sort_order'),
        supabase.from('habit_cells').select('*'),
        supabase.from('user_settings').select('*').maybeSingle(),
        supabase.from('reflections').select('*'),
      ]);

      const dbRoutines = (routinesRes.data || []) as DbRoutine[];
      const dbHabits = (habitsRes.data || []) as DbHabit[];
      const dbCells = (cellsRes.data || []) as DbHabitCell[];
      const dbSettings = settingsRes.data as DbUserSettings | null;
      const dbReflections = (reflectionsRes.data || []) as DbReflection[];

      // Build cells map for quick lookup
      const cellsMap = new Map<string, Record<string, CellData>>();
      for (const cell of dbCells) {
        if (!cellsMap.has(cell.habit_id)) {
          cellsMap.set(cell.habit_id, {});
        }
        cellsMap.get(cell.habit_id)![cell.date] = {
          strokes: [],
          completed: (cell.value || 0) > 0,
          strokeDensity: cell.value || 0,
        };
      }

      // Build sub-habits map
      const subHabitsMap = new Map<string, SubHabit[]>();
      for (const h of dbHabits) {
        if (h.parent_id) {
          if (!subHabitsMap.has(h.parent_id)) {
            subHabitsMap.set(h.parent_id, []);
          }
          subHabitsMap.get(h.parent_id)!.push({
            id: h.id,
            name: h.name,
            timeOfDay: 'anytime' as TimeOfDay,
            createdAt: Date.now(),
            cells: cellsMap.get(h.id) || {},
          });
        }
      }

      // Build reflections map by routine
      const reflectionsMap = new Map<string, WeeklyReflection[]>();
      for (const r of dbReflections) {
        if (r.routine_id) {
          if (!reflectionsMap.has(r.routine_id)) {
            reflectionsMap.set(r.routine_id, []);
          }
          const weekStart = new Date(r.week_start);
          const weekNumber = Math.floor((Date.now() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
          reflectionsMap.get(r.routine_id)!.push({
            weekNumber,
            content: [r.went_well, r.improve, r.goals].filter(Boolean).join('\n\n'),
            createdAt: Date.now(),
          });
        }
      }

      // Convert to app state
      const routines: Routine[] = dbRoutines.map((r) => ({
        id: r.id,
        name: r.name,
        startDate: new Date().toISOString().split('T')[0],
        duration: 30,
        habits: dbHabits
          .filter((h) => h.routine_id === r.id && !h.parent_id)
          .map((h) => ({
            id: h.id,
            name: h.name,
            timeOfDay: 'anytime' as TimeOfDay,
            createdAt: Date.now(),
            cells: cellsMap.get(h.id) || {},
            subHabits: subHabitsMap.get(h.id) || [],
            isExpanded: h.is_expanded !== false,
          })),
        position: { x: 100, y: 100 },
        createdAt: Date.now(),
        routineType: 'permanent' as RoutineType,
        reflections: reflectionsMap.get(r.id) || [],
      }));

      // Create default routine if none exist
      if (routines.length === 0) {
        const newRoutineId = crypto.randomUUID();
        const { error } = await supabase.from('routines').insert({
          id: newRoutineId,
          user_id: user.id,
          name: 'My First Routine',
          sort_order: 0,
        });
        
        if (!error) {
          routines.push({
            id: newRoutineId,
            name: 'My First Routine',
            startDate: new Date().toISOString().split('T')[0],
            duration: 30,
            habits: [],
            position: { x: 100, y: 100 },
            createdAt: Date.now(),
            routineType: 'permanent',
            reflections: [],
          });
        }
      }

      const appState: AppState = {
        grids: [],
        routines,
        settings: {
          ...defaultSettings,
          zoom: dbSettings?.canvas_zoom || 1,
          panOffset: {
            x: dbSettings?.canvas_offset_x || 0,
            y: dbSettings?.canvas_offset_y || 0,
          },
        },
        activeRoutineId: dbSettings?.active_routine_id || routines[0]?.id,
      };

      setState(appState);
    } catch (error) {
      console.error('Failed to load from database:', error);
      // Fallback to empty state
      setState({
        grids: [],
        routines: [],
        settings: defaultSettings,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFromDatabase();
  }, [loadFromDatabase]);

  // Add a routine
  const addRoutineToDb = useCallback(
    async (routine: Omit<Routine, 'id' | 'createdAt' | 'habits'>): Promise<Routine | null> => {
      if (!user) return null;

      const newId = crypto.randomUUID();
      const { error } = await supabase.from('routines').insert({
        id: newId,
        user_id: user.id,
        name: routine.name,
        sort_order: state?.routines.length || 0,
      });

      if (error) {
        console.error('Failed to add routine:', error);
        return null;
      }

      const newRoutine: Routine = {
        ...routine,
        id: newId,
        createdAt: Date.now(),
        habits: [],
      };

      setState((prev) =>
        prev
          ? {
              ...prev,
              routines: [...prev.routines, newRoutine],
              activeRoutineId: newId,
            }
          : null
      );

      // Update active routine in settings
      await supabase
        .from('user_settings')
        .update({ active_routine_id: newId })
        .eq('user_id', user.id);

      return newRoutine;
    },
    [user, state?.routines.length]
  );

  // Add a habit
  const addHabitToDb = useCallback(
    async (
      routineId: string,
      habit: Omit<Habit, 'id' | 'createdAt' | 'cells' | 'subHabits' | 'isExpanded'>,
      parentHabitId?: string
    ): Promise<Habit | null> => {
      if (!user) return null;

      const newId = crypto.randomUUID();
      const routine = state?.routines.find((r) => r.id === routineId);
      const sortOrder = parentHabitId
        ? routine?.habits.find((h) => h.id === parentHabitId)?.subHabits?.length || 0
        : routine?.habits.length || 0;

      const { error } = await supabase.from('habits').insert({
        id: newId,
        user_id: user.id,
        routine_id: routineId,
        parent_id: parentHabitId || null,
        name: habit.name,
        sort_order: sortOrder,
        is_expanded: true,
      });

      if (error) {
        console.error('Failed to add habit:', error);
        return null;
      }

      const newHabit: Habit = {
        ...habit,
        id: newId,
        createdAt: Date.now(),
        cells: {},
        subHabits: [],
        isExpanded: true,
      };

      setState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          routines: prev.routines.map((r) => {
            if (r.id !== routineId) return r;
            if (parentHabitId) {
              return {
                ...r,
                habits: r.habits.map((h) => {
                  if (h.id !== parentHabitId) return h;
                  return {
                    ...h,
                    subHabits: [
                      ...(h.subHabits || []),
                      { id: newId, name: habit.name, timeOfDay: habit.timeOfDay, createdAt: Date.now(), cells: {} },
                    ],
                  };
                }),
              };
            }
            return { ...r, habits: [...r.habits, newHabit] };
          }),
        };
      });

      return newHabit;
    },
    [user, state?.routines]
  );

  // Update habit cell
  const updateHabitCellInDb = useCallback(
    async (
      routineId: string,
      habitId: string,
      dateKey: string,
      density: number,
      subHabitId?: string
    ) => {
      if (!user) return;

      const targetHabitId = subHabitId || habitId;

      // Check if cell exists
      const { data: existing } = await supabase
        .from('habit_cells')
        .select('id')
        .eq('habit_id', targetHabitId)
        .eq('date', dateKey)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('habit_cells')
          .update({ value: density })
          .eq('id', existing.id);
      } else {
        await supabase.from('habit_cells').insert({
          user_id: user.id,
          habit_id: targetHabitId,
          date: dateKey,
          value: density,
        });
      }

      // Update local state
      setState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          routines: prev.routines.map((r) => {
            if (r.id !== routineId) return r;
            return {
              ...r,
              habits: r.habits.map((h) => {
                if (h.id !== habitId) return h;
                if (subHabitId) {
                  return {
                    ...h,
                    subHabits: h.subHabits?.map((sh) => {
                      if (sh.id !== subHabitId) return sh;
                      return {
                        ...sh,
                        cells: {
                          ...sh.cells,
                          [dateKey]: {
                            strokes: [],
                            completed: density > 0,
                            strokeDensity: density,
                          },
                        },
                      };
                    }),
                  };
                }
                return {
                  ...h,
                  cells: {
                    ...h.cells,
                    [dateKey]: {
                      strokes: [],
                      completed: density > 0,
                      strokeDensity: density,
                    },
                  },
                };
              }),
            };
          }),
        };
      });
    },
    [user]
  );

  // Delete habit
  const deleteHabitFromDb = useCallback(
    async (routineId: string, habitId: string, subHabitId?: string) => {
      if (!user) return;

      const targetId = subHabitId || habitId;

      // Delete cells first
      await supabase.from('habit_cells').delete().eq('habit_id', targetId);
      // Delete habit
      await supabase.from('habits').delete().eq('id', targetId);

      setState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          routines: prev.routines.map((r) => {
            if (r.id !== routineId) return r;
            if (subHabitId) {
              return {
                ...r,
                habits: r.habits.map((h) => {
                  if (h.id !== habitId) return h;
                  return {
                    ...h,
                    subHabits: h.subHabits?.filter((sh) => sh.id !== subHabitId),
                  };
                }),
              };
            }
            return {
              ...r,
              habits: r.habits.filter((h) => h.id !== habitId),
            };
          }),
        };
      });
    },
    [user]
  );

  // Toggle habit expanded
  const toggleHabitExpandedInDb = useCallback(
    async (routineId: string, habitId: string) => {
      if (!user) return;

      const routine = state?.routines.find((r) => r.id === routineId);
      const habit = routine?.habits.find((h) => h.id === habitId);
      const newExpanded = !habit?.isExpanded;

      await supabase
        .from('habits')
        .update({ is_expanded: newExpanded })
        .eq('id', habitId);

      setState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          routines: prev.routines.map((r) => {
            if (r.id !== routineId) return r;
            return {
              ...r,
              habits: r.habits.map((h) => {
                if (h.id !== habitId) return h;
                return { ...h, isExpanded: newExpanded };
              }),
            };
          }),
        };
      });
    },
    [user, state?.routines]
  );

  // Set active routine
  const setActiveRoutineInDb = useCallback(
    async (routineId: string) => {
      if (!user) return;

      await supabase
        .from('user_settings')
        .update({ active_routine_id: routineId })
        .eq('user_id', user.id);

      setState((prev) => (prev ? { ...prev, activeRoutineId: routineId } : null));
    },
    [user]
  );

  // Update settings
  const updateSettingsInDb = useCallback(
    async (settings: Partial<AppSettings>) => {
      if (!user) return;

      const updates: Record<string, number | null> = {};
      if (settings.zoom !== undefined) updates.canvas_zoom = settings.zoom;
      if (settings.panOffset?.x !== undefined) updates.canvas_offset_x = settings.panOffset.x;
      if (settings.panOffset?.y !== undefined) updates.canvas_offset_y = settings.panOffset.y;

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('user_settings')
          .update(updates)
          .eq('user_id', user.id);
      }

      setState((prev) =>
        prev ? { ...prev, settings: { ...prev.settings, ...settings } } : null
      );
    },
    [user]
  );

  // Delete routine
  const deleteRoutineFromDb = useCallback(
    async (routineId: string) => {
      if (!user) return;

      // Delete all habits and cells for this routine
      const { data: habits } = await supabase
        .from('habits')
        .select('id')
        .eq('routine_id', routineId);

      if (habits) {
        for (const h of habits) {
          await supabase.from('habit_cells').delete().eq('habit_id', h.id);
        }
        await supabase.from('habits').delete().eq('routine_id', routineId);
      }

      await supabase.from('routines').delete().eq('id', routineId);

      setState((prev) => {
        if (!prev) return null;
        const newRoutines = prev.routines.filter((r) => r.id !== routineId);
        return {
          ...prev,
          routines: newRoutines,
          activeRoutineId: newRoutines[0]?.id,
        };
      });
    },
    [user]
  );

  return {
    state,
    isLoading,
    addRoutine: addRoutineToDb,
    addHabit: addHabitToDb,
    updateHabitCell: updateHabitCellInDb,
    deleteHabit: deleteHabitFromDb,
    toggleHabitExpanded: toggleHabitExpandedInDb,
    setActiveRoutine: setActiveRoutineInDb,
    updateSettings: updateSettingsInDb,
    deleteRoutine: deleteRoutineFromDb,
    reload: loadFromDatabase,
  };
}
