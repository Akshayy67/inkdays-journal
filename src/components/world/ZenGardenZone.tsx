import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Text, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Flower2, Wind, Droplets, ArrowLeft } from 'lucide-react';

interface ZenGardenZoneProps {
  onBack: () => void;
}

// Zen stone
const ZenStone: React.FC<{ position: [number, number, number]; scale?: number }> = ({ position, scale = 1 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#4a4a4a" roughness={0.9} metalness={0.1} />
    </mesh>
  );
};

// Sand ripple pattern
const SandRipples: React.FC = () => {
  const ripples = useMemo(() => {
    const rings: JSX.Element[] = [];
    for (let i = 1; i <= 8; i++) {
      rings.push(
        <mesh key={i} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[i * 0.4, i * 0.4 + 0.05, 64]} />
          <meshStandardMaterial color="#d4c4a8" roughness={1} transparent opacity={0.3} />
        </mesh>
      );
    }
    return rings;
  }, []);

  return <group>{ripples}</group>;
};

// Cherry blossom tree
const CherryBlossomTree: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const petalsRef = useRef<THREE.Points>(null);
  
  const petals = useMemo(() => {
    const count = 100;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = Math.random() * 2 + 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (petalsRef.current) {
      const positions = petalsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.002;
        positions[i * 3 + 1] -= 0.003;
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 3;
        }
      }
      petalsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1, 8]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>
      
      {/* Branches */}
      <mesh position={[0.3, 1.2, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.02, 0.04, 0.6, 6]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
      <mesh position={[-0.2, 1.3, 0.1]} rotation={[0.2, 0, -0.4]}>
        <cylinderGeometry args={[0.02, 0.04, 0.5, 6]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
      
      {/* Blossoms */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#ffb7c5" transparent opacity={0.7} roughness={0.8} />
      </mesh>
      
      {/* Falling petals */}
      <points ref={petalsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={100} array={petals} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#ffb7c5" transparent opacity={0.8} />
      </points>
    </group>
  );
};

// Koi pond
const KoiPond: React.FC = () => {
  const koiRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (koiRef.current) {
      const t = state.clock.elapsedTime * 0.5;
      koiRef.current.position.x = Math.sin(t) * 0.8;
      koiRef.current.position.z = Math.cos(t) * 0.4;
      koiRef.current.rotation.y = -t + Math.PI / 2;
    }
  });

  return (
    <group position={[2, 0, 1]}>
      {/* Pond base */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#1a4a5e" roughness={0.3} metalness={0.1} />
      </mesh>
      
      {/* Water surface */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#4a8fa8" transparent opacity={0.6} roughness={0.1} />
      </mesh>
      
      {/* Koi fish */}
      <mesh ref={koiRef} position={[0, 0.02, 0]}>
        <capsuleGeometry args={[0.05, 0.15, 4, 8]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff4500" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Lily pads */}
      {[[0.5, 0.01, 0.3], [-0.3, 0.01, 0.6], [0.2, 0.01, -0.5]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[-Math.PI / 2, 0, i * 0.5]}>
          <circleGeometry args={[0.15, 16]} />
          <meshStandardMaterial color="#2d5a27" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// Bamboo
const Bamboo: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const swayRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (swayRef.current) {
      swayRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      swayRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  return (
    <group ref={swayRef} position={position}>
      {[0, 0.15, -0.1].map((offset, i) => (
        <group key={i} position={[offset, 0, offset * 0.5]}>
          {/* Bamboo segments */}
          {[0, 0.8, 1.6, 2.4].map((y, j) => (
            <mesh key={j} position={[0, y + 0.4, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.75, 8]} />
              <meshStandardMaterial color="#5a8c5a" roughness={0.6} />
            </mesh>
          ))}
          {/* Joints */}
          {[0.8, 1.6, 2.4].map((y, j) => (
            <mesh key={`joint-${j}`} position={[0, y, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.05, 8]} />
              <meshStandardMaterial color="#4a7c4a" roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

// Zen Garden 3D Scene
const ZenGarden3D: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [4, 3, 4], fov: 45 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#1a1a2e']} />
      <fog attach="fog" args={['#1a1a2e', 8, 20]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#ffeedd" />
      <pointLight position={[-3, 2, -3]} intensity={0.3} color="#b4a0ff" />
      
      {/* Stars */}
      <Stars radius={50} depth={30} count={1000} factor={2} saturation={0.5} fade speed={0.3} />
      
      {/* Sand base */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#c9b896" roughness={1} />
      </mesh>
      
      {/* Sand ripples */}
      <SandRipples />
      
      {/* Zen stones arrangement */}
      <ZenStone position={[0, 0.2, 0]} scale={0.8} />
      <ZenStone position={[-0.8, 0.15, 0.3]} scale={0.5} />
      <ZenStone position={[0.5, 0.1, -0.4]} scale={0.4} />
      
      {/* Cherry blossom trees */}
      <CherryBlossomTree position={[-2.5, 0, -2]} />
      <CherryBlossomTree position={[3, 0, -1.5]} />
      
      {/* Koi pond */}
      <KoiPond />
      
      {/* Bamboo grove */}
      <Bamboo position={[-3, 0, 1]} />
      <Bamboo position={[-3.5, 0, 1.5]} />
      <Bamboo position={[-2.8, 0, 2]} />
    </Canvas>
  );
};

const ZenGardenZone: React.FC<ZenGardenZoneProps> = ({ onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-6"
    >
      {/* Header */}
      <div className="floating-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-400/20 border border-green-500/30">
              <Flower2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Zen Garden</h2>
              <p className="text-sm text-muted-foreground">Your sanctuary of peace</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-muted-foreground text-sm leading-relaxed">
          You have earned this tranquil space through 50 days of unwavering dedication. 
          Here, time moves slowly. Breathe. Reflect. Be at peace.
        </p>
      </div>

      {/* 3D Zen Garden */}
      <div className="floating-panel p-2 h-[400px] overflow-hidden rounded-xl">
        <ZenGarden3D />
      </div>

      {/* Meditation tools */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="floating-panel p-4 text-center cursor-pointer hover:border-primary/30 transition-all"
        >
          <Wind className="w-8 h-8 mx-auto mb-2 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Breathe</h3>
          <p className="text-xs text-muted-foreground">4-7-8 technique</p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="floating-panel p-4 text-center cursor-pointer hover:border-primary/30 transition-all"
        >
          <Droplets className="w-8 h-8 mx-auto mb-2 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Listen</h3>
          <p className="text-xs text-muted-foreground">Water sounds</p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="floating-panel p-4 text-center cursor-pointer hover:border-primary/30 transition-all"
        >
          <Flower2 className="w-8 h-8 mx-auto mb-2 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Reflect</h3>
          <p className="text-xs text-muted-foreground">Daily wisdom</p>
        </motion.div>
      </div>

      {/* Wisdom quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="floating-panel p-6 text-center bg-gradient-to-br from-primary/5 to-accent/5"
      >
        <blockquote className="text-foreground italic text-lg">
          "The mind is everything. What you think, you become."
        </blockquote>
        <p className="text-muted-foreground text-sm mt-2">— Buddha</p>
      </motion.div>
    </motion.div>
  );
};

export default ZenGardenZone;
