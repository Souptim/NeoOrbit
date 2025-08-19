import { Satellite, CollisionPrediction } from '@/store/satelliteStore';

// Earth radius in simulation units
export const EARTH_RADIUS = 5;

// Calculate satellite position based on orbital parameters and time
export const calculateSatellitePosition = (satellite: Satellite, time: number): [number, number, number] => {
  // Update the satellite's current orbital angle based on time and orbital speed
  const currentAngle = satellite.orbitAngle + satellite.orbitSpeed * time;
  
  // Calculate position in 3D space considering orbital inclination
  const x = satellite.orbitRadius * Math.cos(currentAngle) * Math.cos(satellite.inclination);
  const y = satellite.orbitRadius * Math.sin(currentAngle);
  const z = satellite.orbitRadius * Math.cos(currentAngle) * Math.sin(satellite.inclination);
  
  return [x, y, z];
};

// Calculate velocity vector for a satellite
export const calculateSatelliteVelocity = (satellite: Satellite, time: number): [number, number, number] => {
  const currentAngle = satellite.orbitAngle + satellite.orbitSpeed * time;
  
  // Tangential velocity components
  const vx = -satellite.orbitRadius * satellite.orbitSpeed * Math.sin(currentAngle) * Math.cos(satellite.inclination);
  const vy = satellite.orbitRadius * satellite.orbitSpeed * Math.cos(currentAngle);
  const vz = -satellite.orbitRadius * satellite.orbitSpeed * Math.sin(currentAngle) * Math.sin(satellite.inclination);
  
  return [vx, vy, vz];
};

// Calculate distance between two 3D points
export const calculateDistance = (pos1: [number, number, number], pos2: [number, number, number]): number => {
  const dx = pos1[0] - pos2[0];
  const dy = pos1[1] - pos2[1];
  const dz = pos1[2] - pos2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

// Calculate relative velocity between two satellites
export const calculateRelativeVelocity = (vel1: [number, number, number], vel2: [number, number, number]): number => {
  const dvx = vel1[0] - vel2[0];
  const dvy = vel1[1] - vel2[1];
  const dvz = vel1[2] - vel2[2];
  return Math.sqrt(dvx * dvx + dvy * dvy + dvz * dvz);
};

// Advanced collision detection with proper spatial mathematics
export const detectCollisions = (satellites: Satellite[], currentTime: number): CollisionPrediction[] => {
  const collisions: CollisionPrediction[] = [];
  const minSafeDistance = 0.5; // Minimum safe distance between satellites (collision threshold)
  const predictionTimeHorizon = 100; // Time steps to look ahead
  const timeStep = 0.2; // Smaller time step for more accurate prediction
  
  // Check all satellite pairs
  for (let i = 0; i < satellites.length; i++) {
    for (let j = i + 1; j < satellites.length; j++) {
      const sat1 = satellites[i];
      const sat2 = satellites[j];
      
      let minDistance = Infinity;
      let collisionTime = -1;
      let collisionPoint: [number, number, number] = [0, 0, 0];
      
      // Look ahead in time to predict closest approach
      for (let t = 0; t < predictionTimeHorizon; t += timeStep) {
        const futureTime = currentTime + t;
        const pos1 = calculateSatellitePosition(sat1, futureTime);
        const pos2 = calculateSatellitePosition(sat2, futureTime);
        const distance = calculateDistance(pos1, pos2);
        
        if (distance < minDistance) {
          minDistance = distance;
          collisionTime = t;
          collisionPoint = [
            (pos1[0] + pos2[0]) / 2,
            (pos1[1] + pos2[1]) / 2,
            (pos1[2] + pos2[2]) / 2
          ];
        }
        
        // Early exit if we're moving away from each other
        if (t > 10 && distance > minDistance * 1.5) {
          break;
        }
      }
      
      // If minimum distance is within collision threshold
      if (minDistance < minSafeDistance && collisionTime >= 0) {
        // Calculate collision probability based on multiple factors
        const vel1 = calculateSatelliteVelocity(sat1, currentTime + collisionTime);
        const vel2 = calculateSatelliteVelocity(sat2, currentTime + collisionTime);
        const relativeVelocity = calculateRelativeVelocity(vel1, vel2);
        
        // Higher relative velocity = higher collision risk
        const velocityFactor = Math.min(1, relativeVelocity / 0.1);
        
        // Closer distance = higher collision risk
        const distanceFactor = Math.max(0, (minSafeDistance - minDistance) / minSafeDistance);
        
        // Time factor - closer in time = higher risk
        const timeFactor = Math.max(0, 1 - (collisionTime / 100));
        
        // Combined probability calculation
        const probability = Math.min(1, (distanceFactor * 0.6 + velocityFactor * 0.3 + timeFactor * 0.1));
        
        if (probability > 0.1) { // Only report significant collision risks
          collisions.push({
            satellite1Id: sat1.id,
            satellite2Id: sat2.id,
            timeToCollision: collisionTime,
            collisionPoint,
            probability,
          });
        }
      }
    }
  }
  
  // Sort by most imminent/probable collisions first
  return collisions.sort((a, b) => {
    const scoreA = a.probability * (1 / (a.timeToCollision + 1));
    const scoreB = b.probability * (1 / (b.timeToCollision + 1));
    return scoreB - scoreA;
  });
};

// Update satellite orbital angle based on elapsed time
export const updateSatelliteOrbit = (satellite: Satellite, deltaTime: number): Satellite => {
  return {
    ...satellite,
    orbitAngle: satellite.orbitAngle + satellite.orbitSpeed * deltaTime,
  };
};

// Convert orbital elements to Cartesian coordinates (simplified Keplerian orbit)
export const orbitalElementsToCartesian = (
  semiMajorAxis: number,
  eccentricity: number,
  inclination: number,
  longitudeOfAscendingNode: number,
  argumentOfPeriapsis: number,
  trueAnomaly: number
): [number, number, number] => {
  // Simplified conversion for circular orbits (eccentricity = 0)
  const r = semiMajorAxis;
  
  // Position in orbital plane
  const x_orbital = r * Math.cos(trueAnomaly);
  const y_orbital = r * Math.sin(trueAnomaly);
  const z_orbital = 0;
  
  // Rotation matrices for inclination and longitude of ascending node
  const cosI = Math.cos(inclination);
  const sinI = Math.sin(inclination);
  const cosOmega = Math.cos(longitudeOfAscendingNode);
  const sinOmega = Math.sin(longitudeOfAscendingNode);
  const cosArgPeri = Math.cos(argumentOfPeriapsis);
  const sinArgPeri = Math.sin(argumentOfPeriapsis);
  
  // Transform to Earth-centered inertial frame
  const x = (cosOmega * cosArgPeri - sinOmega * sinArgPeri * cosI) * x_orbital +
            (-cosOmega * sinArgPeri - sinOmega * cosArgPeri * cosI) * y_orbital;
  
  const y = (sinOmega * cosArgPeri + cosOmega * sinArgPeri * cosI) * x_orbital +
            (-sinOmega * sinArgPeri + cosOmega * cosArgPeri * cosI) * y_orbital;
  
  const z = (sinArgPeri * sinI) * x_orbital + (cosArgPeri * sinI) * y_orbital;
  
  return [x, y, z];
};

// Calculate orbital period using Kepler's third law (simplified)
export const calculateOrbitalPeriod = (semiMajorAxis: number): number => {
  // Simplified formula: T = 2π * sqrt(a³ / GM)
  // For our simulation, we use normalized units
  const GM = 1; // Normalized gravitational parameter
  return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / GM);
};