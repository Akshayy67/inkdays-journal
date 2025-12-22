import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Trail, Line } from '@react-three/drei';
import * as THREE from 'three';

interface InsaneState3DProps {
  evolutionTier: number; // 0-50
  visualProgress: number; // 0-1
  hasReached: boolean;
}

// Floating particle system
const FloatingParticles: React.FC<{ count: number; evolutionTier: number }> = ({ count, evolutionTier }) => {
  const mesh = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Spiral distribution
      const angle = (i / count) * Math.PI * 8;
      const radius = 2 + (i / count) * 4;
      const height = (i / count) * 6 - 3;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      // Color evolves with tier
      const warmth = evolutionTier / 50;
      colors[i * 3] = 0.3 + warmth * 0.5; // R
      colors[i * 3 + 1] = 0.5 + warmth * 0.3; // G
      colors[i * 3 + 2] = 0.6 - warmth * 0.3; // B
    }
    
    return { positions, colors };
  }, [count, evolutionTier]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// The main floating island/orb
const InsaneOrb: React.FC<{ evolutionTier: number; hasReached: boolean }> = ({ evolutionTier, hasReached }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  
  // Color evolution
  const color = useMemo(() => {
    const warmth = evolutionTier / 50;
    return new THREE.Color().setHSL(
      0.48 - warmth * 0.35, // Hue: teal to gold
      0.4 + warmth * 0.3,   // Saturation
      0.3 + warmth * 0.2    // Lightness
    );
  }, [evolutionTier]);

  const glowColor = useMemo(() => {
    const warmth = evolutionTier / 50;
    return new THREE.Color().setHSL(
      0.48 - warmth * 0.35,
      0.5 + warmth * 0.2,
      0.5 + warmth * 0.2
    );
  }, [evolutionTier]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1);
    }
    if (haloRef.current && hasReached) {
      haloRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group>
      {/* Outer glow */}
      <mesh ref={glowRef} scale={1.8}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.1 + evolutionTier * 0.006}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Main orb */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1, hasReached ? 3 : 1]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.2 + evolutionTier * 0.01}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      </Float>
      
      {/* Crown/Halo - only visible when reached */}
      {hasReached && (
        <mesh ref={haloRef} position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.05, 16, 100]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      )}
    </group>
  );
};

// Journey path visualization
const JourneyPath: React.FC<{ progress: number }> = ({ progress }) => {
  const pathPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 100;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Spiral path going upward
      const angle = t * Math.PI * 4;
      const radius = 3 - t * 2;
      const y = t * 8 - 6;
      
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      ));
    }
    
    return points;
  }, []);

  // Progress indicator position
  const progressPosition = useMemo(() => {
    const index = Math.floor(progress * (pathPoints.length - 1));
    return pathPoints[Math.min(index, pathPoints.length - 1)];
  }, [progress, pathPoints]);

  // Traveled path points
  const traveledPoints = useMemo(() => {
    const index = Math.floor(progress * (pathPoints.length - 1));
    return pathPoints.slice(0, index + 1);
  }, [progress, pathPoints]);

  return (
    <group>
      {/* Full path - faded */}
      <Line
        points={pathPoints}
        color="#4a5568"
        lineWidth={1}
        transparent
        opacity={0.2}
      />
      
      {/* Traveled path - visible */}
      {traveledPoints.length > 1 && (
        <Line
          points={traveledPoints}
          color="#48bb78"
          lineWidth={2}
          transparent
          opacity={0.6}
        />
      )}
      
      {/* Current position marker */}
      <Trail
        width={0.3}
        length={5}
        color={new THREE.Color().setHSL(0.48, 0.5, 0.5)}
        attenuation={(t) => t * t}
      >
        <mesh position={progressPosition}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#48bb78" />
        </mesh>
      </Trail>
    </group>
  );
};

// Milestone markers along the journey
const Milestones: React.FC<{ currentDay: number }> = ({ currentDay }) => {
  const milestones = [10, 20, 30, 40, 50];
  
  return (
    <group>
      {milestones.map((day) => {
        const t = day / 50;
        const angle = t * Math.PI * 4;
        const radius = 3 - t * 2;
        const y = t * 8 - 6;
        const reached = currentDay >= day;
        
        return (
          <group key={day} position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}>
            <mesh>
              <octahedronGeometry args={[0.15, 0]} />
              <meshStandardMaterial
                color={reached ? '#48bb78' : '#4a5568'}
                emissive={reached ? '#48bb78' : '#000000'}
                emissiveIntensity={reached ? 0.3 : 0}
                transparent
                opacity={reached ? 1 : 0.3}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const InsaneState3D: React.FC<InsaneState3DProps> = ({ evolutionTier, visualProgress, hasReached }) => {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Ambient lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.2} color="#4a9eff" />
        
        {/* Stars background */}
        <Stars
          radius={100}
          depth={50}
          count={1000}
          factor={2}
          saturation={0}
          fade
          speed={0.5}
        />
        
        {/* Floating particles */}
        <FloatingParticles count={200} evolutionTier={evolutionTier} />
        
        {/* Journey path */}
        <JourneyPath progress={visualProgress} />
        
        {/* Milestones */}
        <Milestones currentDay={evolutionTier * 10} />
        
        {/* The Insane State orb */}
        <group position={[0, 2, 0]}>
          <InsaneOrb evolutionTier={evolutionTier} hasReached={hasReached} />
        </group>
      </Canvas>
    </div>
  );
};

export default InsaneState3D;
