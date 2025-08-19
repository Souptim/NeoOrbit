import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export const Earth3D = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (earthRef.current) {
      // Slow rotation of Earth
      earthRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      {/* Earth - completely blue ocean planet */}
      <Sphere ref={earthRef} args={[5, 64, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#1E40AF"
          roughness={0.3}
          metalness={0.1}
          emissive="#0F1629"
          emissiveIntensity={0.1}
        />
      </Sphere>
      
      {/* Earth atmosphere glow */}
      <Sphere args={[5.2, 32, 16]} position={[0, 0, 0]}>
        <meshBasicMaterial 
          color="#60A5FA"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Coordinate grid */}
      <group>
        {/* Equatorial ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[5.1, 5.12, 64]} />
          <meshBasicMaterial 
            color="#60A5FA"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Prime meridian */}
        <mesh rotation={[0, 0, 0]}>
          <ringGeometry args={[5.1, 5.12, 64, 1, 0, Math.PI]} />
          <meshBasicMaterial 
            color="#60A5FA"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
};