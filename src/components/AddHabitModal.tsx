import React, { useState } from 'react';
import { TimeOfDay } from '@/types/habit';
import { X, Sun, Moon, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, timeOfDay: TimeOfDay) => void;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('anytime');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), timeOfDay);
      setName('');
      setTimeOfDay('anytime');
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="floating-panel p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">New Habit</h2>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm text-muted-foreground mb-2">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Meditate, Exercise, Read..."
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    autoFocus
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-muted-foreground mb-3">
                    Time of Day
                  </label>
                  <div className="flex gap-2">
                    {timeOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTimeOfDay(option.value)}
                        className={`
                          flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all
                          ${timeOfDay === option.value
                            ? `border-primary/50 bg-primary/10 ${option.color}`
                            : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                          }
                        `}
                      >
                        {option.icon}
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-lg border border-border bg-secondary text-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
