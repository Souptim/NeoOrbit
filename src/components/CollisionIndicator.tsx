import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { CollisionPrediction } from '@/store/satelliteStore';

interface CollisionIndicatorProps {
  collision: CollisionPrediction;
}

export const CollisionIndicator = ({ collision }: CollisionIndicatorProps) => {
  const indicatorRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (indicatorRef.current) {
      // Pulsing animation based on collision probability
      const scale = 1 + Math.sin(time * 5) * 0.3 * collision.probability;
      indicatorRef.current.scale.setScalar(scale);
      
      // Rotation animation
      indicatorRef.current.rotation.y = time * 2;
      indicatorRef.current.rotation.x = time * 1.5;
    }
    
    if (glowRef.current) {
      // Outer glow pulsing
      const glowScale = 1.5 + Math.sin(time * 3) * 0.5 * collision.probability;
      glowRef.current.scale.setScalar(glowScale);
    }
  });
  
  // Color intensity based on collision probability
  const intensity = Math.max(0.3, collision.probability);
  const warningColor = new THREE.Color().setHSL(0, 1, 0.5 + intensity * 0.3);
  
  return (
    <group position={collision.collisionPoint}>
      {/* Outer warning glow */}
      <Sphere
        ref={glowRef}
        args={[0.3, 16, 16]}
      >
        <meshBasicMaterial
          color={warningColor}
          transparent
          opacity={0.2 * collision.probability}
        />
      </Sphere>
      
      {/* Main collision indicator */}
      <Sphere
        ref={indicatorRef}
        args={[0.15, 16, 16]}
      >
        <meshStandardMaterial
          color={warningColor}
          emissive={warningColor}
          emissiveIntensity={intensity}
          transparent
          opacity={0.8}
        />
      </Sphere>
      
      {/* Warning rings */}
      {[1, 1.5, 2].map((radius, index) => (
        <mesh key={index} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 0.2, radius * 0.25, 32]} />
          <meshBasicMaterial
            color={warningColor}
            transparent
            opacity={0.3 * collision.probability * (1 - index * 0.2)}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};