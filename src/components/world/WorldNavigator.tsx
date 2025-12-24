import React from 'react';
import { ZoneType, ZONE_POSITIONS } from '@/types/world';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, BookOpen, Mountain, Compass, Heart, Sparkles, Flower2, Crown, Mail, Flame, Navigation } from 'lucide-react';

interface WorldNavigatorProps {
  currentZone: ZoneType;
  onNavigate: (zone: ZoneType) => void;
  canAccessFocus: boolean;
  insaneReached: boolean;
}

const zoneInfo: Record<ZoneType, { icon: React.ComponentType<any>; label: string; shortLabel: string }> = {
  center: { icon: Compass, label: 'Present', shortLabel: 'Present' },
  review: { icon: Mountain, label: 'Review Island', shortLabel: 'Review' },
  insane: { icon: Sparkles, label: 'The Insane State', shortLabel: 'Insane' },
  focus: { icon: Sparkles, label: 'Focus Zone', shortLabel: 'Focus' },
  journal: { icon: BookOpen, label: 'Journal World', shortLabel: 'Journal' },
  recovery: { icon: Heart, label: 'Recovery', shortLabel: 'Recovery' },
  'zen-garden': { icon: Flower2, label: 'Zen Garden', shortLabel: 'Zen' },
  'milestones': { icon: Crown, label: 'Milestone Rewards', shortLabel: 'Milestones' },
  'time-capsules': { icon: Mail, label: 'Time Capsules', shortLabel: 'Capsules' },
  'flame-shrine': { icon: Flame, label: 'Flame Shrine', shortLabel: 'Shrine' },
};

const WorldNavigator: React.FC<WorldNavigatorProps> = ({
  currentZone,
  onNavigate,
  canAccessFocus,
  insaneReached,
}) => {
  const [showOthers, setShowOthers] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const getAvailableDirections = () => {
    const directions: { zone: ZoneType; direction: 'up' | 'down' | 'left' | 'right' }[] = [];
    
    switch (currentZone) {
      case 'center':
        directions.push({ zone: 'review', direction: 'up' });
        directions.push({ zone: 'journal', direction: 'left' });
        directions.push({ zone: 'recovery', direction: 'down' });
        directions.push({ zone: 'time-capsules', direction: 'right' });
        break;
      case 'review':
        directions.push({ zone: 'center', direction: 'down' });
        break;
      case 'insane':
        directions.push({ zone: 'center', direction: 'down' });
        break;
      case 'focus':
        directions.push({ zone: 'center', direction: 'down' });
        break;
      case 'zen-garden':
        directions.push({ zone: 'center', direction: 'down' });
        break;
      case 'journal':
        directions.push({ zone: 'center', direction: 'right' });
        break;
      case 'recovery':
        directions.push({ zone: 'center', direction: 'up' });
        break;
      case 'milestones':
        directions.push({ zone: 'center', direction: 'down' });
        break;
      case 'time-capsules':
        directions.push({ zone: 'center', direction: 'left' });
        break;
      case 'flame-shrine':
        directions.push({ zone: 'center', direction: 'up' });
        break;
    }
    
    return directions;
  };

  // All zones that should appear in "Others" menu
  const otherZones: ZoneType[] = [
    'insane',
    'focus', 
    'zen-garden',
    'milestones', 
    'time-capsules', 
    'flame-shrine'
  ].filter(zone => {
    // Filter based on access
    if (zone === 'zen-garden' && !insaneReached) return false;
    return true;
  }) as ZoneType[];

  const DirectionIcon = ({ direction }: { direction: 'up' | 'down' | 'left' | 'right' }) => {
    switch (direction) {
      case 'up': return <ChevronUp className="w-4 h-4" />;
      case 'down': return <ChevronDown className="w-4 h-4" />;
      case 'left': return <ChevronLeft className="w-4 h-4" />;
      case 'right': return <ChevronRight className="w-4 h-4" />;
    }
  };

  const directions = getAvailableDirections();
  const CurrentIcon = zoneInfo[currentZone].icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-16 xs:bottom-20 sm:bottom-6 left-2 xs:left-4 sm:left-6 z-50 safe-left safe-bottom"
    >
      {/* Mobile: Compact floating button that expands */}
      <div className="sm:hidden">
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="floating-panel p-2.5 xs:p-3 flex items-center gap-2"
          whileTap={{ scale: 0.95 }}
        >
          <CurrentIcon className="w-4 h-4 xs:w-5 xs:h-5 text-primary" />
          <span className="text-xs xs:text-sm font-medium text-foreground">
            {zoneInfo[currentZone].shortLabel}
          </span>
          <Navigation className={`w-3 h-3 xs:w-4 xs:h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
        </motion.button>

        {/* Mobile expanded navigation */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-12 xs:bottom-14 left-0 floating-panel p-2 min-w-[160px] xs:min-w-[180px]"
            >
              <div className="space-y-1">
                {directions.map(({ zone, direction }) => {
                  const ZoneIcon = zoneInfo[zone].icon;
                  return (
                    <button
                      key={zone}
                      onClick={() => {
                        onNavigate(zone);
                        setIsExpanded(false);
                      }}
                      className="nav-button w-full bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground text-xs xs:text-sm"
                    >
                      <DirectionIcon direction={direction} />
                      <ZoneIcon className="w-3.5 h-3.5" />
                      <span>{zoneInfo[zone].shortLabel}</span>
                    </button>
                  );
                })}

                <div className="border-t border-border my-1" />

                <button
                  onClick={() => setShowOthers(!showOthers)}
                  className={`nav-button w-full text-xs xs:text-sm ${
                    showOthers 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>More zones</span>
                </button>

                {showOthers && (
                  <div className="pl-2 space-y-1 border-l-2 border-primary/30 ml-2">
                    {otherZones.map((zone) => {
                      const ZoneIcon = zoneInfo[zone].icon;
                      const isActive = currentZone === zone;
                      return (
                        <button
                          key={zone}
                          onClick={() => {
                            onNavigate(zone);
                            setShowOthers(false);
                            setIsExpanded(false);
                          }}
                          className={`nav-button w-full text-xs ${
                            isActive
                              ? 'bg-primary/20 text-primary'
                              : 'bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <ZoneIcon className="w-3 h-3" />
                          <span>{zoneInfo[zone].shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: Full navigation panel */}
      <div className="hidden sm:block">
        {/* Current zone indicator */}
        <div className="floating-panel p-2.5 sm:p-3 mb-2 sm:mb-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground">
            <CurrentIcon className="w-4 h-4 text-primary" />
            <span className="font-medium">{zoneInfo[currentZone].label}</span>
          </div>
        </div>

        {/* Navigation hints */}
        <div className="space-y-1.5 sm:space-y-2">
          {directions.map(({ zone, direction }) => {
            const ZoneIcon = zoneInfo[zone].icon;
            return (
              <motion.button
                key={zone}
                onClick={() => onNavigate(zone)}
                whileHover={{ scale: 1.02, x: direction === 'left' ? -4 : direction === 'right' ? 4 : 0, y: direction === 'up' ? -4 : direction === 'down' ? 4 : 0 }}
                whileTap={{ scale: 0.98 }}
                className="nav-button bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground w-full text-xs sm:text-sm group"
              >
                <DirectionIcon direction={direction} />
                <ZoneIcon className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                <span className="opacity-70 group-hover:opacity-100">{zoneInfo[zone].label}</span>
              </motion.button>
            );
          })}

          {/* Others button */}
          <motion.button
            onClick={() => setShowOthers(!showOthers)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`nav-button w-full text-xs sm:text-sm ${
              showOthers 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Others</span>
          </motion.button>

          {/* Others dropdown */}
          <AnimatePresence>
            {showOthers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-3 sm:pl-4 space-y-1 border-l-2 border-primary/30 ml-2"
              >
                {otherZones.map((zone) => {
                  const ZoneIcon = zoneInfo[zone].icon;
                  const isActive = currentZone === zone;
                  return (
                    <motion.button
                      key={zone}
                      onClick={() => {
                        onNavigate(zone);
                        setShowOthers(false);
                      }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`nav-button w-full text-xs sm:text-sm ${
                        isActive
                          ? 'bg-primary/20 text-primary'
                          : 'bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <ZoneIcon className="w-3.5 h-3.5" />
                      <span>{zoneInfo[zone].label}</span>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default WorldNavigator;