import React from 'react';
import { ZoneType, ZONE_POSITIONS } from '@/types/world';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, BookOpen, Mountain, Compass, Heart, Sparkles } from 'lucide-react';

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
};

const WorldNavigator: React.FC<WorldNavigatorProps> = ({
  currentZone,
  onNavigate,
  canAccessFocus,
  insaneReached,
}) => {
  const getAvailableDirections = () => {
    const directions: { zone: ZoneType; direction: 'up' | 'down' | 'left'; highlight?: boolean }[] = [];
    
    switch (currentZone) {
      case 'center':
        directions.push({ zone: 'review', direction: 'up' });
        directions.push({ zone: 'insane', direction: 'up', highlight: true });
        directions.push({ zone: 'focus', direction: 'up' });
        directions.push({ zone: 'journal', direction: 'left' });
        directions.push({ zone: 'recovery', direction: 'down' });
        break;
      case 'review':
        directions.push({ zone: 'center', direction: 'down' });
        directions.push({ zone: 'insane', direction: 'up', highlight: true });
        directions.push({ zone: 'focus', direction: 'up' });
        break;
      case 'insane':
        directions.push({ zone: 'review', direction: 'down' });
        directions.push({ zone: 'focus', direction: 'up' });
        directions.push({ zone: 'center', direction: 'down' });
        break;
      case 'focus':
        directions.push({ zone: 'insane', direction: 'down' });
        directions.push({ zone: 'center', direction: 'down' });
        break;
      case 'journal':
        directions.push({ zone: 'center', direction: 'down' });
        break;
      case 'recovery':
        directions.push({ zone: 'center', direction: 'up' });
        break;
    }
    
    return directions;
  };

  const DirectionIcon = ({ direction }: { direction: 'up' | 'down' | 'left' }) => {
    switch (direction) {
      case 'up': return <ChevronUp className="w-4 h-4" />;
      case 'down': return <ChevronDown className="w-4 h-4" />;
      case 'left': return <ChevronLeft className="w-4 h-4" />;
    }
  };

  const directions = getAvailableDirections();
  const CurrentIcon = zoneInfo[currentZone].icon;

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
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {directions.map(({ zone, direction, highlight }) => {
          const ZoneIcon = zoneInfo[zone].icon;
          const isSpecial = zone === 'insane' || zone === 'focus';
          return (
            <motion.button
              key={zone}
              onClick={() => onNavigate(zone)}
              whileHover={{ scale: 1.02, x: direction === 'left' ? -4 : 0, y: direction === 'up' ? -4 : direction === 'down' ? 4 : 0 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm group w-full ${
                isSpecial 
                  ? 'bg-primary/15 hover:bg-primary/25 text-primary border border-primary/20' 
                  : 'bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <DirectionIcon direction={direction} />
              <ZoneIcon className={`w-3.5 h-3.5 ${isSpecial ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
              <span className={isSpecial ? 'opacity-100 font-medium' : 'opacity-70 group-hover:opacity-100'}>
                {zoneInfo[zone].label}
              </span>
              {highlight && (
                <motion.span 
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="ml-auto text-[10px] text-primary/60"
                >
                  ✦
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default WorldNavigator;
