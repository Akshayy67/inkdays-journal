import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Sparkles } from 'lucide-react';
import { getQuoteForDay } from '@/lib/insaneQuotes';

interface DailyWisdomProps {
  currentDay: number;
}

const DailyWisdom: React.FC<DailyWisdomProps> = ({ currentDay }) => {
  const quoteData = getQuoteForDay(currentDay);

  if (!quoteData || currentDay === 0) {
    return null;
  }

  const isMilestone = currentDay % 10 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`relative p-6 rounded-2xl border ${
        isMilestone
          ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30'
          : 'bg-card/60 border-border'
      }`}
    >
      {isMilestone && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Day {currentDay} Milestone
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${isMilestone ? 'bg-primary/20' : 'bg-secondary'}`}>
          <Quote className={`w-5 h-5 ${isMilestone ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        
        <div className="flex-1">
          <blockquote className="text-foreground text-lg leading-relaxed">
            "{quoteData.quote}"
          </blockquote>
          {quoteData.author && (
            <p className="mt-2 text-sm text-muted-foreground">
              — {quoteData.author}
            </p>
          )}
        </div>
      </div>

      {/* Day indicator */}
      <div className="mt-4 flex items-center justify-center">
        <div className="flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => {
            const tier = i + 1;
            const tierDay = tier * 10;
            const isReached = currentDay >= tierDay;
            const isCurrent = currentDay >= (tier - 1) * 10 && currentDay < tierDay;
            
            return (
              <React.Fragment key={tier}>
                <div
                  className={`w-2 h-2 rounded-full transition-all ${
                    isReached
                      ? 'bg-primary'
                      : isCurrent
                        ? 'bg-primary/50 animate-pulse'
                        : 'bg-muted'
                  }`}
                />
                {tier < 5 && (
                  <div className={`w-8 h-0.5 ${isReached ? 'bg-primary/50' : 'bg-muted'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default DailyWisdom;
