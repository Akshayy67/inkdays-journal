import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimeCapsule } from '@/types/world';
import { Mail, MailOpen, Lock, Send, Calendar, Sparkles } from 'lucide-react';

interface TimeCapsulesProp {
  capsules: TimeCapsule[];
  currentDay: number;
  hasReached: boolean;
  onAddCapsule: (message: string) => void;
}

const TimeCapsules: React.FC<TimeCapsulesProp> = ({
  capsules,
  currentDay,
  hasReached,
  onAddCapsule,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null);

  const handleSubmit = () => {
    if (newMessage.trim()) {
      onAddCapsule(newMessage.trim());
      setNewMessage('');
      setShowCompose(false);
    }
  };

  const availableMilestones = [10, 20, 30, 40].filter(
    (day) => currentDay >= day && !capsules.some((c) => c.createdAtDay === day)
  );

  const canAddCapsule = availableMilestones.length > 0 || currentDay > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Time Capsules
        </h3>
        {canAddCapsule && !hasReached && (
          <button
            onClick={() => setShowCompose(!showCompose)}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {showCompose ? 'Cancel' : '+ Write to Future Self'}
          </button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {hasReached
          ? 'Your time capsules are now unlocked. Read the messages from your past self.'
          : 'Write messages to your future self. They will unlock when you reach Day 50.'}
      </p>

      {/* Compose new capsule */}
      <AnimatePresence>
        {showCompose && !hasReached && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Writing on Day {currentDay}</span>
              </div>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Dear future me, when you read this, you will have achieved the impossible..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Seal Capsule
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capsules list */}
      <div className="space-y-3">
        {capsules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No time capsules yet.</p>
            <p className="text-xs">Write your first message to your future self.</p>
          </div>
        ) : (
          capsules.map((capsule, index) => (
            <motion.div
              key={capsule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border transition-all ${
                hasReached
                  ? 'bg-primary/5 border-primary/30 cursor-pointer hover:bg-primary/10'
                  : 'bg-muted/30 border-border'
              }`}
              onClick={() => hasReached && setSelectedCapsule(capsule)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${hasReached ? 'bg-primary/20' : 'bg-muted'}`}>
                  {hasReached ? (
                    <MailOpen className="w-5 h-5 text-primary" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      Capsule from Day {capsule.createdAtDay}
                    </span>
                  </div>
                  {hasReached ? (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {capsule.message}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Sealed until Day 50...
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Full capsule view modal */}
      <AnimatePresence>
        {selectedCapsule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedCapsule(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-2xl bg-card border border-border shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <MailOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Time Capsule Opened</h3>
                  <p className="text-sm text-muted-foreground">
                    Written on Day {selectedCapsule.createdAtDay}
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-primary animate-pulse" />
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <p className="text-foreground whitespace-pre-wrap">
                    {selectedCapsule.message}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setSelectedCapsule(null)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeCapsules;
