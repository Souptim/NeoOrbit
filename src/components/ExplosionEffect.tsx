import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ExplosionEffectProps {
  position: [number, number, number];
  color: string;
  onComplete: () => void;
}

export const ExplosionEffect = ({ position, color, onComplete }: ExplosionEffectProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 160;
  const particles = useRef<Float32Array>();
  const velocities = useRef<Float32Array>();
  const startTime = useRef<number>(Date.now());
  const duration = 1800; // 1.8 seconds
  const baseSize = 0.12;

  useEffect(() => {
    // Initialize particle positions and velocities
    particles.current = new Float32Array(particleCount * 3);
    velocities.current = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Start all particles at the explosion center
      particles.current[i3] = position[0];
      particles.current[i3 + 1] = position[1];
      particles.current[i3 + 2] = position[2];

      // Random velocities in all directions
      const speed = 0.5 + Math.random() * 1.5;
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;

      velocities.current[i3] = speed * Math.sin(theta) * Math.cos(phi);
      velocities.current[i3 + 1] = speed * Math.sin(theta) * Math.sin(phi);
      velocities.current[i3 + 2] = speed * Math.cos(theta);
    }
  }, [position]);

  useFrame(() => {
    if (!particles.current || !velocities.current || !pointsRef.current) return;

    const elapsed = Date.now() - startTime.current;
    const progress = elapsed / duration;

    if (progress >= 1) {
      onComplete();
      return;
    }

    // Update particle positions
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const deltaTime = 0.016; // ~60fps

      particles.current[i3] += velocities.current[i3] * deltaTime;
      particles.current[i3 + 1] += velocities.current[i3 + 1] * deltaTime;
      particles.current[i3 + 2] += velocities.current[i3 + 2] * deltaTime;

      // Apply gravity and damping
      velocities.current[i3 + 1] -= 0.002; // Gravity
      velocities.current[i3] *= 0.99; // Damping
      velocities.current[i3 + 1] *= 0.99;
      velocities.current[i3 + 2] *= 0.99;
    }

    // Update geometry
    if (pointsRef.current.geometry.attributes.position) {
      const positionAttribute = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particles.current.length; i++) {
        positionAttribute.array[i] = particles.current[i];
      }
      positionAttribute.needsUpdate = true;
    }

    // Fade and expand over time
    const material = pointsRef.current.material as THREE.PointsMaterial;
    if (material) {
      material.opacity = Math.max(0, 1 - progress);
      material.size = baseSize * (1.2 - 0.7 * progress);
    }
  });

  // Create geometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(particles.current || new Float32Array(particleCount * 3), 3));

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={baseSize}
        color={color}
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};