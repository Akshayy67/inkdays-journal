import React, { useState } from 'react';
import { X, Calendar, Leaf, Snowflake, Infinity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoutineType } from '@/types/habit';

interface AddRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, duration: number, startDate: string, routineType: RoutineType) => void;
}

const AddRoutineModal: React.FC<AddRoutineModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [routineType, setRoutineType] = useState<RoutineType>('permanent');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const finalDuration = duration === -1 ? parseInt(customDuration) || 30 : duration;
      onAdd(name.trim(), finalDuration, startDate, routineType);
      setName('');
      setDuration(30);
      setCustomDuration('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setRoutineType('permanent');
      onClose();
    }
  };

  const durationOptions = [
    { value: 30, label: '30' },
    { value: 60, label: '60' },
    { value: 90, label: '90' },
    { value: -1, label: 'Custom' },
  ];

  const routineTypeOptions: { value: RoutineType; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      value: 'permanent', 
      label: 'Permanent', 
      icon: <Infinity className="w-4 h-4" />,
      description: 'An ongoing practice'
    },
    { 
      value: 'seasonal', 
      label: 'Seasonal', 
      icon: <Leaf className="w-4 h-4" />,
      description: 'For a specific season'
    },
    { 
      value: 'temporary', 
      label: 'Temporary', 
      icon: <Snowflake className="w-4 h-4" />,
      description: 'A time-bound challenge'
    },
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
                <h2 className="text-lg font-semibold text-foreground">New Routine</h2>
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
                    Routine Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Morning Routine..."
                    className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                    autoFocus
                  />
                </div>

                {/* Routine Type */}
                <div className="mb-4">
                  <label className="block text-sm text-muted-foreground mb-2">
                    Routine Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {routineTypeOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRoutineType(option.value)}
                        className={`
                          flex flex-col items-center gap-1 py-3 px-2 rounded-lg border transition-all text-center
                          ${routineType === option.value
                            ? 'border-primary/50 bg-primary/10 text-primary'
                            : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                          }
                        `}
                      >
                        {option.icon}
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-2 text-center">
                    {routineTypeOptions.find(o => o.value === routineType)?.description}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-muted-foreground mb-2">
                    Duration (days)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {durationOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDuration(option.value)}
                        className={`
                          py-2 rounded-lg border transition-all text-xs font-medium
                          ${duration === option.value
                            ? 'border-primary/50 bg-primary/10 text-primary'
                            : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                          }
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {duration === -1 && (
                    <input
                      type="number"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      placeholder="Enter number of days"
                      min="1"
                      max="365"
                      className="w-full mt-2 bg-input border border-border rounded-lg px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                    />
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Start Date
                    </span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  />
                </div>

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
                    disabled={!name.trim() || (duration === -1 && !customDuration)}
                    className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Create
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

export default AddRoutineModal;
