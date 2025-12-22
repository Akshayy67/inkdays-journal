import React, { useMemo } from 'react';
import { InsaneStateProgress } from '@/types/world';
import { motion } from 'framer-motion';

interface InsaneStateProps {
  progress: InsaneStateProgress;
  onExplore: () => void;
}

const InsaneState: React.FC<InsaneStateProps> = ({ progress, onExplore }) => {
  const hasReached = progress.currentDay >= progress.targetDays;
  
  // Calculate evolution tier (every 10 days = 1 tier, max 50 tiers)
  const evolutionTier = Math.min(Math.floor(progress.currentDay / 10), 50);
  
  // Subtle visual evolution based on tier
  const evolutionStyle = useMemo(() => {
    // Color warmth increases gradually (from cool blue-gray to warm gold)
    const hueShift = evolutionTier * 0.8; // 0 to 40 degrees toward warm
    const saturation = 30 + evolutionTier * 0.6; // 30% to 60%
    const lightness = 45 + evolutionTier * 0.3; // 45% to 60%
    
    // Glow intensity increases
    const glowOpacity = 0.1 + evolutionTier * 0.008; // 0.1 to 0.5
    const glowSize = 20 + evolutionTier * 1.5; // 20px to 95px
    
    // Border refinement
    const borderOpacity = 0.15 + evolutionTier * 0.01; // 0.15 to 0.65
    
    return {
      primaryHue: 175 + hueShift, // Shifts from teal toward gold
      saturation,
      lightness,
      glowOpacity,
      glowSize,
      borderOpacity,
    };
  }, [evolutionTier]);

  // Visual distance - closer with more days
  const visualProgress = useMemo(() => {
    const ratio = Math.min(progress.currentDay / progress.targetDays, 1);
    return 1 - Math.pow(1 - ratio, 4); // Exponential approach
  }, [progress.currentDay, progress.targetDays]);

  // Final form styling
  const finalFormStyle = useMemo(() => ({
    primaryColor: `hsl(45, 70%, 55%)`, // Warm gold
    glowColor: `hsl(45, 60%, 50%)`,
    crownGlow: `0 0 60px hsl(45, 70%, 50% / 0.4)`,
  }), []);

  // Reached and exploring - the calm space
  if (hasReached && progress.isExploring) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="w-full min-h-[800px] relative"
      >
        {/* Ethereal background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, hsl(45, 30%, 15% / 0.3) 0%, transparent 70%)`,
          }}
        />
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[700px]">
          {/* Crown/Halo element - minimal, elegant */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-8"
          >
            {/* Outer halo ring */}
            <motion.div
              className="absolute -inset-8 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, 
                  hsl(45, 50%, 50% / 0.1), 
                  hsl(45, 60%, 55% / 0.2), 
                  hsl(45, 50%, 50% / 0.1), 
                  hsl(45, 60%, 55% / 0.2),
                  hsl(45, 50%, 50% / 0.1))`,
                boxShadow: finalFormStyle.crownGlow,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner refined core */}
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, hsl(45, 40%, 20%) 0%, hsl(45, 30%, 10%) 100%)`,
                border: `1px solid hsl(45, 50%, 40% / 0.5)`,
                boxShadow: `inset 0 0 30px hsl(45, 40%, 30% / 0.3), ${finalFormStyle.crownGlow}`,
              }}
            >
              {/* Subtle inner light */}
              <div 
                className="w-4 h-4 rounded-full"
                style={{
                  background: `radial-gradient(circle, hsl(45, 60%, 60%) 0%, transparent 70%)`,
                }}
              />
            </div>
          </motion.div>

          {/* Floating particles - extremely subtle */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${15 + (i * 10)}%`,
                  top: `${25 + (i % 3) * 20}%`,
                  background: `hsl(45, 40%, 50% / ${0.2 + (i % 3) * 0.1})`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 8 + i * 2,
                  delay: i * 0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* No text. Just presence. */}
        </div>
      </motion.div>
    );
  }

  // Just reached - silent transition
  if (hasReached) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3 }}
        className="w-full min-h-[600px] flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="relative cursor-pointer"
          onClick={onExplore}
        >
          {/* Halo appears */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 3, delay: 1 }}
            className="absolute -inset-12 rounded-full"
            style={{
              background: `radial-gradient(circle, hsl(45, 50%, 50% / 0.15) 0%, transparent 70%)`,
            }}
          />
          
          {/* Core element */}
          <div 
            className="w-32 h-32 rounded-full"
            style={{
              background: `radial-gradient(circle, hsl(45, 35%, 18%) 0%, hsl(45, 25%, 8%) 100%)`,
              border: `1px solid hsl(45, 50%, 45% / 0.4)`,
              boxShadow: `0 0 80px hsl(45, 60%, 50% / 0.3)`,
            }}
          />
        </motion.div>
      </motion.div>
    );
  }

  // Unreached state - distant, locked, mysterious
  const opacity = 0.25 + visualProgress * 0.5;
  const scale = 0.5 + visualProgress * 0.4;
  const blur = 3 - visualProgress * 2.5;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-h-[600px] flex items-center justify-center relative pointer-events-none"
    >
      {/* Atmospheric distance haze */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center bottom, 
            hsl(${evolutionStyle.primaryHue}, 20%, 15% / 0.1) 0%, 
            transparent 60%)`,
        }}
      />
      
      {/* The distant island - no interaction possible */}
      <motion.div
        style={{ 
          opacity, 
          scale,
          filter: `blur(${Math.max(0, blur)}px)`,
        }}
        className="relative"
      >
        {/* Subtle evolving glow - changes every 10 days */}
        <motion.div
          className="absolute -inset-8 rounded-full -z-10"
          style={{
            background: `radial-gradient(circle, 
              hsl(${evolutionStyle.primaryHue}, ${evolutionStyle.saturation}%, ${evolutionStyle.lightness}% / ${evolutionStyle.glowOpacity}) 0%, 
              transparent 70%)`,
            boxShadow: `0 0 ${evolutionStyle.glowSize}px hsl(${evolutionStyle.primaryHue}, ${evolutionStyle.saturation}%, ${evolutionStyle.lightness}% / ${evolutionStyle.glowOpacity * 0.5})`,
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Core form - evolves subtly */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-full"
          style={{
            background: `radial-gradient(circle, 
              hsl(${evolutionStyle.primaryHue}, ${evolutionStyle.saturation * 0.5}%, 15%) 0%, 
              hsl(${evolutionStyle.primaryHue}, ${evolutionStyle.saturation * 0.3}%, 8%) 100%)`,
            border: `1px solid hsl(${evolutionStyle.primaryHue}, ${evolutionStyle.saturation}%, ${evolutionStyle.lightness}% / ${evolutionStyle.borderOpacity})`,
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default InsaneState;
