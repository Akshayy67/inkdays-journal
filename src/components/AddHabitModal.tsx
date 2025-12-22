import React, { useState } from 'react';
import { TimeOfDay } from '@/types/habit';
import { X, Sun, Moon, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, timeOfDay: TimeOfDay, parentHabitId?: string, intent?: string) => void;
  parentHabits?: { id: string; name: string }[];
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, onAdd, parentHabits = [] }) => {
  const [name, setName] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('anytime');
  const [isSubHabit, setIsSubHabit] = useState(false);
  const [parentHabitId, setParentHabitId] = useState<string>('');
  const [intent, setIntent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(
        name.trim(), 
        timeOfDay, 
        isSubHabit && parentHabitId ? parentHabitId : undefined,
        intent.trim() || undefined
      );
      setName('');
      setTimeOfDay('anytime');
      setIsSubHabit(false);
      setParentHabitId('');
      setIntent('');
      onClose();
    }
  };

  const timeOptions: { value: TimeOfDay; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'morning', label: 'Morning', icon: <Sun className="w-4 h-4" />, color: 'text-morning' },
    { value: 'evening', label: 'Evening', icon: <Moon className="w-4 h-4" />, color: 'text-evening' },
    { value: 'anytime', label: 'Anytime', icon: <Clock className="w-4 h-4" />, color: 'text-anytime' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="floating-panel p-5 w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">New Habit</h2>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm text-muted-foreground mb-2">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Meditate, Exercise, Read..."
                    className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                    autoFocus
                  />
                </div>

                {/* Intent question - calm and optional */}
                <div className="mb-4">
                  <label className="block text-sm text-muted-foreground mb-2">
                    Why does this matter to you?
                    <span className="text-muted-foreground/60 ml-1">(optional)</span>
                  </label>
                  <textarea
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                    placeholder="A quiet reminder for yourself..."
                    rows={2}
                    maxLength={200}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm resize-none"
                  />
                  <p className="text-[10px] text-muted-foreground/50 mt-1">
                    This stays private and appears only when you need a gentle reminder.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-muted-foreground mb-2">
                    Time of Day
                  </label>
                  <div className="flex gap-2">
                    {timeOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTimeOfDay(option.value)}
                        className={`
                          flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border transition-all text-sm
                          ${timeOfDay === option.value
                            ? `border-primary/50 bg-primary/10 ${option.color}`
                            : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                          }
                        `}
                      >
                        {option.icon}
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-habit option */}
                {parentHabits.length > 0 && (
                  <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSubHabit}
                        onChange={(e) => {
                          setIsSubHabit(e.target.checked);
                          if (!e.target.checked) setParentHabitId('');
                        }}
                        className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-primary/50"
                      />
                      <span className="text-sm text-muted-foreground">Add as sub-habit</span>
                    </label>
                    
                    {isSubHabit && (
                      <div className="mt-2 pl-7">
                        <select
                          value={parentHabitId}
                          onChange={(e) => setParentHabitId(e.target.value)}
                          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        >
                          <option value="">Select parent habit...</option>
                          {parentHabits.map(habit => (
                            <option key={habit.id} value={habit.id}>
                              {habit.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-lg border border-border bg-secondary text-foreground hover:bg-muted transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim() || (isSubHabit && !parentHabitId)}
                    className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Add Habit
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddHabitModal;
