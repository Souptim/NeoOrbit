import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Earth3D } from './Earth3D';
import { Satellite3D } from './Satellite3D';
import { OrbitPath } from './OrbitPath';
import { CollisionIndicator } from './CollisionIndicator';
import { ExplosionEffect } from './ExplosionEffect';
import { useSatelliteStore } from '@/store/satelliteStore';
import { calculateSatellitePosition, detectCollisions, updateSatelliteOrbit } from '@/utils/orbitalMechanics';

// Animation component to handle the orbital mechanics
const SatelliteAnimator = () => {
  const {
    satellites,
    isSimulationRunning,
    simulationSpeed,
    time,
    updateTime,
    updateSatellitePosition,
    updateSatelliteOrbit,
    updateCollisions,
    processCollisions,
  } = useSatelliteStore();
  
  const lastTimeRef = useRef<number>(Date.now());
  
  useFrame(() => {
    if (!isSimulationRunning) return;
    
    const now = Date.now();
    const deltaTime = (now - lastTimeRef.current) * 0.001 * simulationSpeed; // Convert to seconds
    lastTimeRef.current = now;
    
    // Update simulation time
    updateTime(deltaTime);
    
    // Update all satellites' orbital positions
    satellites.forEach((satellite) => {
      // Update orbital angle
      const newOrbitAngle = satellite.orbitAngle + satellite.orbitSpeed * deltaTime;
      updateSatelliteOrbit(satellite.id, newOrbitAngle);
      
      // Calculate and update position based on current orbital parameters
      const newPosition = calculateSatellitePosition(satellite, time + deltaTime);
      updateSatellitePosition(satellite.id, newPosition);
    });
    
    // Check for collisions with updated positions
    if (satellites.length > 1) {
      const collisions = detectCollisions(satellites, time);
      updateCollisions(collisions);
      
      // Process actual collisions (explosions and removal)
      processCollisions();
    }
  });
  
  return null; // This component only handles logic, no rendering
};

export const Scene3D = () => {
  const {
    satellites,
    collisions,
    explosions,
    selectedSatelliteIds,
    removeExplosion,
  } = useSatelliteStore();

  return (
    <div className="w-full h-screen bg-gradient-to-b from-background via-background to-muted">
      <Canvas
        camera={{ position: [15, 10, 15], fov: 60 }}
        gl={{ antialias: true }}
      >
        {/* Animation Controller */}
        <SatelliteAnimator />
        
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={1024}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#60A5FA" />
        
        {/* Background */}
        <Stars
          radius={300}
          depth={60}
          count={5000}
          factor={7}
          saturation={0.5}
          fade
        />
        
        {/* Earth */}
        <Earth3D />
        
        {/* Satellites */}
        {satellites.map((satellite) => (
          <group key={satellite.id}>
            <Satellite3D
              satellite={satellite}
              isSelected={selectedSatelliteIds.includes(satellite.id)}
              onSelect={() => {}} // Selection handled by SimulationControls
            />
            <OrbitPath
              satellite={satellite}
              visible={selectedSatelliteIds.includes(satellite.id) || selectedSatelliteIds.length === 0}
            />
          </group>
        ))}
        
        {/* Collision Indicators */}
        {collisions.map((collision, index) => (
          <CollisionIndicator
            key={`${collision.satellite1Id}-${collision.satellite2Id}-${index}`}
            collision={collision}
          />
        ))}
        
        {/* Explosion Effects */}
        {explosions.map((explosion) => (
          <ExplosionEffect
            key={explosion.id}
            position={explosion.position}
            color={explosion.color}
            onComplete={() => removeExplosion(explosion.id)}
          />
        ))}
        
        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={50}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};