import React, { useState } from 'react';
import { WeeklyReflection as WeeklyReflectionType } from '@/types/habit';
import { X, Feather } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeeklyReflectionProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  existingReflection?: WeeklyReflectionType;
  onSave: (content: string) => void;
}

const WeeklyReflection: React.FC<WeeklyReflectionProps> = ({
  isOpen,
  onClose,
  weekNumber,
  existingReflection,
  onSave,
}) => {
  const [content, setContent] = useState(existingReflection?.content || '');

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim());
    }
    onClose();
  };

  const prompts = [
    "What felt different this week?",
    "What small win are you grateful for?",
    "What would you like to carry forward?",
    "How did showing up feel?",
    "What did you notice about yourself?",
  ];

  const randomPrompt = prompts[weekNumber % prompts.length];

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-4 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="floating-panel p-6 w-full max-w-lg pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Feather className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Week {weekNumber}</h2>
                    <p className="text-xs text-muted-foreground">A moment to reflect</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Prompt */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground italic">
                  {randomPrompt}
                </p>
              </div>

              {/* Textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a few words, or skip entirely..."
                rows={4}
                maxLength={300}
                className="w-full bg-input/50 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all text-sm resize-none leading-relaxed"
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground/40 mt-2 text-right">
                {content.length}/300
              </p>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                  Save reflection
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WeeklyReflection;
