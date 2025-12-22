import React from 'react';
import { ZoneType, ZONE_POSITIONS } from '@/types/world';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, BookOpen, Mountain, Compass, Heart, Sparkles, Flower2, Crown, Mail, Flame } from 'lucide-react';

interface WorldNavigatorProps {
  currentZone: ZoneType;
  onNavigate: (zone: ZoneType) => void;
  canAccessFocus: boolean;
  insaneReached: boolean;
}

const zoneInfo: Record<ZoneType, { icon: React.ComponentType<any>; label: string }> = {
  center: { icon: Compass, label: 'Present' },
  review: { icon: Mountain, label: 'Review Island' },
  insane: { icon: Sparkles, label: 'The Insane State' },
  focus: { icon: Sparkles, label: 'Focus Zone' },
  journal: { icon: BookOpen, label: 'Journal World' },
  recovery: { icon: Heart, label: 'Recovery' },
  'zen-garden': { icon: Flower2, label: 'Zen Garden' },
  'milestones': { icon: Crown, label: 'Milestone Rewards' },
  'time-capsules': { icon: Mail, label: 'Time Capsules' },
  'flame-shrine': { icon: Flame, label: 'Flame Shrine' },
};

const WorldNavigator: React.FC<WorldNavigatorProps> = ({
  currentZone,
  onNavigate,
  canAccessFocus,
  insaneReached,
}) => {
  const [showOthers, setShowOthers] = React.useState(false);
  
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
        directions.push({ zone: 'insane', direction: 'up' });
        directions.push({ zone: 'milestones', direction: 'right' });
        break;
      case 'insane':
        directions.push({ zone: 'review', direction: 'down' });
        if (canAccessFocus || insaneReached) {
          directions.push({ zone: 'focus', direction: 'up' });
        }
        break;
      case 'focus':
        directions.push({ zone: 'insane', direction: 'down' });
        break;
      case 'journal':
        directions.push({ zone: 'center', direction: 'right' });
        break;
      case 'recovery':
        directions.push({ zone: 'center', direction: 'up' });
        directions.push({ zone: 'flame-shrine', direction: 'right' });
        break;
      case 'milestones':
        directions.push({ zone: 'review', direction: 'left' });
        directions.push({ zone: 'time-capsules', direction: 'down' });
        break;
      case 'time-capsules':
        directions.push({ zone: 'center', direction: 'left' });
        directions.push({ zone: 'milestones', direction: 'up' });
        directions.push({ zone: 'flame-shrine', direction: 'down' });
        break;
      case 'flame-shrine':
        directions.push({ zone: 'time-capsules', direction: 'up' });
        directions.push({ zone: 'recovery', direction: 'left' });
        break;
    }
    
    return directions;
  };

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

  const otherZones: ZoneType[] = ['milestones', 'time-capsules', 'flame-shrine'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-6 z-50"
    >
      {/* Current zone indicator */}
      <div className="floating-panel p-3 mb-3">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <CurrentIcon className="w-4 h-4 text-primary" />
          <span className="font-medium">{zoneInfo[currentZone].label}</span>
        </div>
      </div>

      {/* Navigation hints */}
      <div className="space-y-2">
        {directions.map(({ zone, direction }) => {
          const ZoneIcon = zoneInfo[zone].icon;
          return (
            <motion.button
              key={zone}
              onClick={() => onNavigate(zone)}
              whileHover={{ scale: 1.02, x: direction === 'left' ? -4 : direction === 'right' ? 4 : 0, y: direction === 'up' ? -4 : direction === 'down' ? 4 : 0 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all text-sm group w-full"
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
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm w-full ${
            showOthers 
              ? 'bg-primary/20 text-primary border border-primary/30' 
              : 'bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Others</span>
        </motion.button>

        {/* Others dropdown */}
        {showOthers && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-4 space-y-1 border-l-2 border-primary/30 ml-2"
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm w-full ${
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
      </div>
    </motion.div>
  );
};

export default WorldNavigator;
