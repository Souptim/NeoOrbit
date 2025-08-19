import { useMemo } from 'react';
import * as THREE from 'three';
import { Satellite } from '@/store/satelliteStore';

interface OrbitPathProps {
  satellite: Satellite;
  visible: boolean;
}

export const OrbitPath = ({ satellite, visible }: OrbitPathProps) => {
  const { points, geometry } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 128;
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = satellite.orbitRadius * Math.cos(angle) * Math.cos(satellite.inclination);
      const y = satellite.orbitRadius * Math.sin(angle);
      const z = satellite.orbitRadius * Math.cos(angle) * Math.sin(satellite.inclination);
      
      points.push(new THREE.Vector3(x, y, z));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    return { points, geometry };
  }, [satellite.orbitRadius, satellite.inclination]);

  if (!visible) return null;

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({
      color: satellite.color,
      transparent: true,
      opacity: 0.4,
    }))} />
  );
};