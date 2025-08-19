import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Satellite } from '@/store/satelliteStore';

interface Satellite3DProps {
  satellite: Satellite;
  isSelected: boolean;
  onSelect: () => void;
}

export const Satellite3D = ({ satellite, isSelected, onSelect }: Satellite3DProps) => {
  const satelliteRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (satelliteRef.current) {
      // Position satellite at calculated coordinates
      satelliteRef.current.position.set(...satellite.position);
      
      // Add selection glow animation
      if (isSelected && glowRef.current) {
        glowRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.2);
      }
    }
  });

  return (
    <group>
      {/* Selection glow */}
      {isSelected && (
        <Sphere
          ref={glowRef}
          args={[satellite.size * 3, 16, 16]}
          position={satellite.position}
        >
          <meshBasicMaterial
            color={satellite.color}
            transparent
            opacity={0.2}
          />
        </Sphere>
      )}
      
      {/* Satellite body */}
      <Sphere
        ref={satelliteRef}
        args={[satellite.size, 16, 16]}
        onClick={onSelect}
      >
        <meshStandardMaterial
          color={satellite.color}
          emissive={satellite.color}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      
      {/* Satellite solar panels */}
      <group position={satellite.position}>
        <mesh position={[satellite.size * 1.5, 0, 0]}>
          <boxGeometry args={[satellite.size * 0.1, satellite.size * 2, satellite.size * 0.8]} />
          <meshStandardMaterial color="#1F2937" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-satellite.size * 1.5, 0, 0]}>
          <boxGeometry args={[satellite.size * 0.1, satellite.size * 2, satellite.size * 0.8]} />
          <meshStandardMaterial color="#1F2937" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
};