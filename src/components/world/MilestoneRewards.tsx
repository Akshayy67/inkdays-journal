import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MilestoneUnlocks } from '@/types/world';
import { Palette, Sparkles, Music, Crown, Award, Lock, Check, Volume2 } from 'lucide-react';

interface MilestoneRewardsProps {
  currentDay: number;
  unlocks: MilestoneUnlocks;
  onUpdateUnlocks: (updates: Partial<MilestoneUnlocks>) => void;
}

const THEME_COLORS = [
  { name: 'Teal', value: 'teal', hsl: '175 50% 35%' },
  { name: 'Purple', value: 'purple', hsl: '270 60% 50%' },
  { name: 'Gold', value: 'gold', hsl: '45 80% 45%' },
  { name: 'Rose', value: 'rose', hsl: '340 70% 50%' },
  { name: 'Ocean', value: 'ocean', hsl: '200 70% 45%' },
  { name: 'Forest', value: 'forest', hsl: '140 50% 35%' },
];

const AMBIENT_SOUNDS = [
  { name: 'Lo-Fi Beats', value: 'lofi' as const, icon: '🎵' },
  { name: 'Nature', value: 'nature' as const, icon: '🌿' },
  { name: 'Cosmic', value: 'cosmic' as const, icon: '🌌' },
];

const MilestoneRewards: React.FC<MilestoneRewardsProps> = ({
  currentDay,
  unlocks,
  onUpdateUnlocks,
}) => {
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);
  const [titleInput, setTitleInput] = useState(unlocks.personalTitle || '');

  const milestones = [
    {
      day: 10,
      icon: Palette,
      title: 'Custom Theme',
      description: 'Unlock custom color themes',
      unlocked: currentDay >= 10 || unlocks.day10Theme,
      claimed: unlocks.day10Theme,
    },
    {
      day: 20,
      icon: Sparkles,
      title: 'Particle Effects',
      description: 'Special completion animations',
      unlocked: currentDay >= 20 || unlocks.day20Particles,
      claimed: unlocks.day20Particles,
    },
    {
      day: 30,
      icon: Music,
      title: 'Ambient Sounds',
      description: 'Lo-fi, nature, or cosmic vibes',
      unlocked: currentDay >= 30 || unlocks.day30Sounds,
      claimed: unlocks.day30Sounds,
    },
    {
      day: 40,
      icon: Award,
      title: 'Personal Title',
      description: 'Create your title of mastery',
      unlocked: currentDay >= 40 || unlocks.day40Title,
      claimed: unlocks.day40Title,
    },
    {
      day: 50,
      icon: Crown,
      title: 'The Insane Crown',
      description: 'Access to the Zen Garden',
      unlocked: currentDay >= 50 || unlocks.day50Crown,
      claimed: unlocks.day50Crown,
    },
  ];

  const handleClaimTheme = (theme: string) => {
    onUpdateUnlocks({
      day10Theme: true,
      customTheme: theme,
    });
    setExpandedMilestone(null);
  };

  const handleClaimParticles = () => {
    onUpdateUnlocks({
      day20Particles: true,
    });
    setExpandedMilestone(null);
  };

  const handleClaimSound = (sound: 'lofi' | 'nature' | 'cosmic') => {
    onUpdateUnlocks({
      day30Sounds: true,
      selectedSound: sound,
    });
    setExpandedMilestone(null);
  };

  const handleClaimTitle = () => {
    if (titleInput.trim()) {
      onUpdateUnlocks({
        day40Title: true,
        personalTitle: titleInput.trim(),
      });
      setExpandedMilestone(null);
    }
  };

  const handleClaimCrown = () => {
    onUpdateUnlocks({
      day50Crown: true,
    });
    setExpandedMilestone(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Crown className="w-5 h-5 text-primary" />
        Milestone Rewards
      </h3>
      
      <div className="space-y-3">
        {milestones.map((milestone, index) => {
          const Icon = milestone.icon;
          const isExpanded = expandedMilestone === milestone.day;
          
          return (
            <motion.div
              key={milestone.day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border overflow-hidden transition-all ${
                milestone.claimed
                  ? 'bg-primary/10 border-primary/30'
                  : milestone.unlocked
                    ? 'bg-accent/20 border-accent/40 cursor-pointer hover:bg-accent/30'
                    : 'bg-muted/30 border-border opacity-60'
              }`}
            >
              <button
                onClick={() => {
                  if (milestone.unlocked && !milestone.claimed) {
                    setExpandedMilestone(isExpanded ? null : milestone.day);
                  }
                }}
                className="w-full p-4 flex items-center gap-4 text-left"
                disabled={!milestone.unlocked || milestone.claimed}
              >
                <div className={`p-2 rounded-lg ${
                  milestone.claimed
                    ? 'bg-primary/20 text-primary'
                    : milestone.unlocked
                      ? 'bg-accent/30 text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {milestone.claimed ? (
                    <Check className="w-5 h-5" />
                  ) : milestone.unlocked ? (
                    <Icon className="w-5 h-5" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{milestone.title}</span>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-secondary rounded-full">
                      Day {milestone.day}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                </div>

                {milestone.unlocked && !milestone.claimed && (
                  <span className="text-xs text-primary font-medium">Claim!</span>
                )}
              </button>

              {/* Expanded claim UI */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border/50"
                  >
                    <div className="p-4 space-y-3">
                      {milestone.day === 10 && (
                        <div className="grid grid-cols-3 gap-2">
                          {THEME_COLORS.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => handleClaimTheme(color.value)}
                              className="p-3 rounded-lg border border-border hover:border-primary transition-all flex flex-col items-center gap-1"
                            >
                              <div
                                className="w-8 h-8 rounded-full"
                                style={{ background: `hsl(${color.hsl})` }}
                              />
                              <span className="text-xs text-muted-foreground">{color.name}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {milestone.day === 20 && (
                        <button
                          onClick={handleClaimParticles}
                          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Activate Particle Effects
                        </button>
                      )}

                      {milestone.day === 30 && (
                        <div className="grid grid-cols-3 gap-2">
                          {AMBIENT_SOUNDS.map((sound) => (
                            <button
                              key={sound.value}
                              onClick={() => handleClaimSound(sound.value)}
                              className="p-3 rounded-lg border border-border hover:border-primary transition-all flex flex-col items-center gap-1"
                            >
                              <span className="text-2xl">{sound.icon}</span>
                              <span className="text-xs text-muted-foreground">{sound.name}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {milestone.day === 40 && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                            placeholder="Enter your title..."
                            maxLength={30}
                            className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button
                            onClick={handleClaimTitle}
                            disabled={!titleInput.trim()}
                            className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Claim Title
                          </button>
                        </div>
                      )}

                      {milestone.day === 50 && (
                        <button
                          onClick={handleClaimCrown}
                          className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-white font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                          <Crown className="w-4 h-4" />
                          Accept The Insane Crown
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Display claimed rewards */}
      {(unlocks.customTheme || unlocks.personalTitle || unlocks.selectedSound) && (
        <div className="mt-6 p-4 rounded-xl bg-secondary/30 border border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Your Rewards</h4>
          <div className="flex flex-wrap gap-2">
            {unlocks.customTheme && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border">
                <Palette className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-foreground capitalize">{unlocks.customTheme} Theme</span>
              </div>
            )}
            {unlocks.day20Particles && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-foreground">Particles Active</span>
              </div>
            )}
            {unlocks.selectedSound && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border">
                <Volume2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-foreground capitalize">{unlocks.selectedSound}</span>
              </div>
            )}
            {unlocks.personalTitle && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
                <Award className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-primary font-medium">{unlocks.personalTitle}</span>
              </div>
            )}
            {unlocks.day50Crown && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-400/20 border border-amber-500/30">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Insane Crown</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneRewards;
