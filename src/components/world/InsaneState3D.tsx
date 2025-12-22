import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Trail, Line, Cloud } from '@react-three/drei';
import * as THREE from 'three';

interface InsaneState3DProps {
  evolutionTier: number; // 0-5
  visualProgress: number; // 0-1
  hasReached: boolean;
}

// Dynamic atmosphere based on tier
const DynamicAtmosphere: React.FC<{ tier: number }> = ({ tier }) => {
  const fogRef = useRef<THREE.Fog>(null);
  
  // Atmosphere colors based on tier
  const atmosphereColor = useMemo(() => {
    if (tier === 0) return new THREE.Color('#1a1a2e'); // Fog, mystery
    if (tier === 1) return new THREE.Color('#2d2d44'); // Early dawn
    if (tier === 2) return new THREE.Color('#4a3f55'); // Dawn breaking
    if (tier === 3) return new THREE.Color('#5c4d6b'); // Sunny warm
    if (tier === 4) return new THREE.Color('#8b6914'); // Golden hour
    return new THREE.Color('#1a0a2e'); // Northern lights / cosmic
  }, [tier]);

  const fogDensity = tier < 2 ? 0.08 : tier < 4 ? 0.04 : 0.02;

  return (
    <>
      <fog attach="fog" args={[atmosphereColor, 5, 30]} ref={fogRef} />
      <color attach="background" args={[atmosphereColor]} />
    </>
  );
};

// Floating rocks that appear at tier 2+
const FloatingRocks: React.FC<{ tier: number }> = ({ tier }) => {
  const rocksRef = useRef<THREE.Group>(null);
  
  const rocks = useMemo(() => {
    if (tier < 2) return [];
    const count = Math.min((tier - 1) * 4, 12);
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6 - 2,
        (Math.random() - 0.5) * 10 - 3,
      ] as [number, number, number],
      scale: 0.2 + Math.random() * 0.4,
      rotation: Math.random() * Math.PI * 2,
    }));
  }, [tier]);

  useFrame((state) => {
    if (rocksRef.current) {
      rocksRef.current.children.forEach((rock, i) => {
        rock.position.y += Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.002;
        rock.rotation.y = state.clock.elapsedTime * 0.1 + i;
      });
    }
  });

  if (tier < 2) return null;

  return (
    <group ref={rocksRef}>
      {rocks.map((rock, i) => (
        <mesh key={i} position={rock.position} scale={rock.scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={tier >= 3 ? '#6b5b7a' : '#4a4a5a'}
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};

// Crystals that grow on rocks at tier 3+
const GrowingCrystals: React.FC<{ tier: number }> = ({ tier }) => {
  const crystalsRef = useRef<THREE.Group>(null);
  
  const crystals = useMemo(() => {
    if (tier < 3) return [];
    const count = Math.min((tier - 2) * 6, 18);
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4 - 1,
        (Math.random() - 0.5) * 8 - 2,
      ] as [number, number, number],
      scale: 0.1 + Math.random() * 0.2,
      color: ['#7b68ee', '#9370db', '#da70d6', '#ba55d3'][Math.floor(Math.random() * 4)],
    }));
  }, [tier]);

  useFrame((state) => {
    if (crystalsRef.current) {
      crystalsRef.current.children.forEach((crystal, i) => {
        const mesh = crystal as THREE.Mesh;
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.2;
        }
      });
    }
  });

  if (tier < 3) return null;

  return (
    <group ref={crystalsRef}>
      {crystals.map((crystal, i) => (
        <mesh key={i} position={crystal.position} scale={crystal.scale} rotation={[0, i * 0.5, Math.PI * 0.1]}>
          <coneGeometry args={[0.3, 1.5, 6]} />
          <meshStandardMaterial
            color={crystal.color}
            emissive={crystal.color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

// Aurora/nebula effect at tier 4+
const AuroraEffect: React.FC<{ tier: number; hasReached: boolean }> = ({ tier, hasReached }) => {
  const auroraRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (auroraRef.current) {
      auroraRef.current.rotation.z = state.clock.elapsedTime * 0.05;
      auroraRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  if (tier < 4) return null;

  const auroraColor = hasReached ? '#00ff88' : '#7b68ee';
  const intensity = hasReached ? 0.4 : 0.2;

  return (
    <group>
      {/* Aurora ribbons */}
      {[...Array(3)].map((_, i) => (
        <mesh
          key={i}
          ref={i === 0 ? auroraRef : undefined}
          position={[0, 4 + i * 0.5, -5]}
          rotation={[0.3, 0, i * 0.3]}
        >
          <planeGeometry args={[15, 2, 20, 5]} />
          <meshBasicMaterial
            color={i === 0 ? auroraColor : i === 1 ? '#ff69b4' : '#00bfff'}
            transparent
            opacity={intensity - i * 0.05}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
};

// Paradise island at tier 5 (hasReached)
const ParadiseIsland: React.FC<{ hasReached: boolean }> = ({ hasReached }) => {
  const islandRef = useRef<THREE.Group>(null);
  const waterfallRef = useRef<THREE.Points>(null);
  
  const waterfallParticles = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = Math.random() * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (islandRef.current) {
      islandRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
    if (waterfallRef.current) {
      const positions = waterfallRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] -= 0.05;
        if (positions[i * 3 + 1] < -1) {
          positions[i * 3 + 1] = 2;
        }
      }
      waterfallRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!hasReached) return null;

  return (
    <group ref={islandRef} position={[0, 1, 0]}>
      {/* Main island base */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[2, 2.5, 1, 8]} />
        <meshStandardMaterial color="#3d5c3d" roughness={0.9} />
      </mesh>
      
      {/* Grass top */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[2, 2, 0.2, 8]} />
        <meshStandardMaterial color="#4a7c4a" roughness={0.8} />
      </mesh>
      
      {/* Trees */}
      {[[-0.8, 0.5, -0.5], [0.7, 0.5, 0.6], [-0.3, 0.5, 0.8]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          {/* Trunk */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 0.6, 6]} />
            <meshStandardMaterial color="#5d4037" />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, 0.8, 0]}>
            <coneGeometry args={[0.3, 0.6, 6]} />
            <meshStandardMaterial color="#2e7d32" emissive="#1b5e20" emissiveIntensity={0.1} />
          </mesh>
        </group>
      ))}
      
      {/* Waterfall */}
      <group position={[1.5, 0.5, 0]}>
        <points ref={waterfallRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={200}
              array={waterfallParticles}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.05} color="#87ceeb" transparent opacity={0.7} />
        </points>
      </group>
      
      {/* Glowing flowers */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 1.2 + Math.random() * 0.5;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, 0.15, Math.sin(angle) * radius]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color={['#ff69b4', '#ffeb3b', '#00bcd4', '#e91e63'][i % 4]}
              emissive={['#ff69b4', '#ffeb3b', '#00bcd4', '#e91e63'][i % 4]}
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// Floating particle system
const FloatingParticles: React.FC<{ count: number; evolutionTier: number }> = ({ count, evolutionTier }) => {
  const mesh = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 8;
      const radius = 2 + (i / count) * 4;
      const height = (i / count) * 6 - 3;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      const warmth = evolutionTier / 5;
      colors[i * 3] = 0.3 + warmth * 0.5;
      colors[i * 3 + 1] = 0.5 + warmth * 0.3;
      colors[i * 3 + 2] = 0.6 - warmth * 0.3;
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
        <bufferAttribute attach="attributes-position" count={count} array={particles.positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={particles.colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

// The main floating island/orb
const InsaneOrb: React.FC<{ evolutionTier: number; hasReached: boolean }> = ({ evolutionTier, hasReached }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  
  const color = useMemo(() => {
    const warmth = evolutionTier / 5;
    return new THREE.Color().setHSL(0.48 - warmth * 0.35, 0.4 + warmth * 0.3, 0.3 + warmth * 0.2);
  }, [evolutionTier]);

  const glowColor = useMemo(() => {
    const warmth = evolutionTier / 5;
    return new THREE.Color().setHSL(0.48 - warmth * 0.35, 0.5 + warmth * 0.2, 0.5 + warmth * 0.2);
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

  // Hide orb when showing paradise island
  if (hasReached) return null;

  return (
    <group>
      <mesh ref={glowRef} scale={1.8}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.1 + evolutionTier * 0.03} side={THREE.BackSide} />
      </mesh>
      
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.2 + evolutionTier * 0.05}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      </Float>
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
      const angle = t * Math.PI * 4;
      const radius = 3 - t * 2;
      const y = t * 8 - 6;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
    }
    return points;
  }, []);

  const progressPosition = useMemo(() => {
    const index = Math.floor(progress * (pathPoints.length - 1));
    return pathPoints[Math.min(index, pathPoints.length - 1)];
  }, [progress, pathPoints]);

  const traveledPoints = useMemo(() => {
    const index = Math.floor(progress * (pathPoints.length - 1));
    return pathPoints.slice(0, index + 1);
  }, [progress, pathPoints]);

  return (
    <group>
      <Line points={pathPoints} color="#4a5568" lineWidth={1} transparent opacity={0.2} />
      {traveledPoints.length > 1 && (
        <Line points={traveledPoints} color="#48bb78" lineWidth={2} transparent opacity={0.6} />
      )}
      <Trail width={0.3} length={5} color={new THREE.Color().setHSL(0.48, 0.5, 0.5)} attenuation={(t) => t * t}>
        <mesh position={progressPosition}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#48bb78" />
        </mesh>
      </Trail>
    </group>
  );
};

// Milestone markers
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
        {/* Dynamic atmosphere */}
        <DynamicAtmosphere tier={evolutionTier} />
        
        {/* Lighting that evolves with tier */}
        <ambientLight intensity={0.2 + evolutionTier * 0.05} />
        <pointLight 
          position={[10, 10, 10]} 
          intensity={0.5 + evolutionTier * 0.1} 
          color={evolutionTier >= 4 ? '#ffd700' : '#ffffff'}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.2} color="#4a9eff" />
        
        {/* Stars - fade as tier increases */}
        <Stars
          radius={100}
          depth={50}
          count={hasReached ? 2000 : 1000}
          factor={2}
          saturation={evolutionTier >= 4 ? 1 : 0}
          fade
          speed={0.5}
        />
        
        {/* Evolving environment elements */}
        <FloatingRocks tier={evolutionTier} />
        <GrowingCrystals tier={evolutionTier} />
        <AuroraEffect tier={evolutionTier} hasReached={hasReached} />
        <ParadiseIsland hasReached={hasReached} />
        
        {/* Floating particles */}
        <FloatingParticles count={200 + evolutionTier * 50} evolutionTier={evolutionTier} />
        
        {/* Journey path */}
        <JourneyPath progress={visualProgress} />
        
        {/* Milestones */}
        <Milestones currentDay={evolutionTier * 10} />
        
        {/* The Insane State orb (hidden when paradise shown) */}
        <group position={[0, 2, 0]}>
          <InsaneOrb evolutionTier={evolutionTier} hasReached={hasReached} />
        </group>
      </Canvas>
    </div>
  );
};

export default InsaneState3D;
