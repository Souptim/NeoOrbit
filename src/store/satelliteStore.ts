import { create } from 'zustand';

export interface Satellite {
  id: string;
  name: string;
  position: [number, number, number];
  velocity: [number, number, number];
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  orbitAngle: number;
  inclination: number;
  mass: number;
  size: number;
}

export interface CollisionPrediction {
  satellite1Id: string;
  satellite2Id: string;
  timeToCollision: number;
  collisionPoint: [number, number, number];
  probability: number;
}

export interface Explosion {
  id: string;
  position: [number, number, number];
  color: string;
  timestamp: number;
}

interface SatelliteStore {
  satellites: Satellite[];
  collisions: CollisionPrediction[];
  explosions: Explosion[];
  isSimulationRunning: boolean;
  simulationSpeed: number;
  time: number;
  selectedSatelliteIds: string[];
  satelliteCounter: number;
  
  // Actions
  addSatellite: (satellite: Omit<Satellite, 'id'>) => void;
  removeSatellite: (id: string) => void;
  updateSatellitePosition: (id: string, position: [number, number, number]) => void;
  updateSatelliteOrbit: (id: string, orbitAngle: number) => void;
  setSelectedSatellites: (ids: string[]) => void;
  toggleSatelliteSelection: (id: string) => void;
  clearSelection: () => void;
  toggleSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  resetSimulation: () => void;
  updateCollisions: (collisions: CollisionPrediction[]) => void;
  updateTime: (deltaTime: number) => void;
  addExplosion: (position: [number, number, number], color: string) => void;
  removeExplosion: (id: string) => void;
  processCollisions: () => void;
}

const generateRandomSatellite = (counter: number): Omit<Satellite, 'id'> => {
  const colors = ['#60A5FA', '#A78BFA', '#34D399', '#FBBF24', '#F87171'];
  const orbitRadius = 7 + Math.random() * 5; // 7-12 units from Earth center
  const orbitSpeed = (2 * Math.PI) / (50 + Math.random() * 100); // Random orbit period
  const inclination = (Math.random() - 0.5) * Math.PI * 0.5; // -45° to 45°
  const orbitAngle = Math.random() * 2 * Math.PI;
  
  // Generate name using a,b,c,d pattern
  const letter = String.fromCharCode(97 + (counter % 26)); // a,b,c,d...z,a,b...
  
  return {
    name: `Satellite ${letter.toUpperCase()}`,
    position: [0, 0, 0], // Will be calculated based on orbit
    velocity: [0, 0, 0], // Will be calculated based on orbit
    color: colors[Math.floor(Math.random() * colors.length)],
    orbitRadius,
    orbitSpeed,
    orbitAngle,
    inclination,
    mass: 500 + Math.random() * 2000, // 500-2500 kg
    size: 0.1 + Math.random() * 0.2, // 0.1-0.3 units
  };
};

export const useSatelliteStore = create<SatelliteStore>((set, get) => ({
  satellites: [],
  collisions: [],
  explosions: [],
  isSimulationRunning: true,
  simulationSpeed: 1,
  time: 0,
  selectedSatelliteIds: [],
  satelliteCounter: 0,
  
  addSatellite: (satelliteData) => {
    const state = get();
    const satellite: Satellite = {
      ...satelliteData,
      id: `sat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    // Calculate initial position based on orbit parameters
    const x = satellite.orbitRadius * Math.cos(satellite.orbitAngle) * Math.cos(satellite.inclination);
    const y = satellite.orbitRadius * Math.sin(satellite.orbitAngle);
    const z = satellite.orbitRadius * Math.cos(satellite.orbitAngle) * Math.sin(satellite.inclination);
    
    satellite.position = [x, y, z];
    
    set({
      satellites: [...state.satellites, satellite],
      satelliteCounter: state.satelliteCounter + 1,
    });
  },
  
  removeSatellite: (id) => {
    set((state) => ({
      satellites: state.satellites.filter((sat) => sat.id !== id),
      selectedSatelliteIds: state.selectedSatelliteIds.filter((selectedId) => selectedId !== id),
    }));
  },
  
  updateSatellitePosition: (id, position) => {
    set((state) => ({
      satellites: state.satellites.map((sat) =>
        sat.id === id ? { ...sat, position } : sat
      ),
    }));
  },
  
  updateSatelliteOrbit: (id, orbitAngle) => {
    set((state) => ({
      satellites: state.satellites.map((sat) =>
        sat.id === id ? { ...sat, orbitAngle } : sat
      ),
    }));
  },
  
  setSelectedSatellites: (ids) => {
    set({ selectedSatelliteIds: ids });
  },

  toggleSatelliteSelection: (id) => {
    set((state) => {
      const isSelected = state.selectedSatelliteIds.includes(id);
      return {
        selectedSatelliteIds: isSelected
          ? state.selectedSatelliteIds.filter((selectedId) => selectedId !== id)
          : [...state.selectedSatelliteIds, id]
      };
    });
  },

  clearSelection: () => {
    set({ selectedSatelliteIds: [] });
  },
  
  toggleSimulation: () => {
    set((state) => ({ isSimulationRunning: !state.isSimulationRunning }));
  },
  
  setSimulationSpeed: (speed) => {
    set({ simulationSpeed: speed });
  },
  
  resetSimulation: () => {
    set({
      satellites: [],
      collisions: [],
      explosions: [],
      time: 0,
      selectedSatelliteIds: [],
      satelliteCounter: 0,
    });
  },
  
  updateCollisions: (collisions) => {
    set({ collisions });
  },
  
  updateTime: (deltaTime) => {
    set((state) => ({ time: state.time + deltaTime }));
  },

  addExplosion: (position, color) => {
    const explosion: Explosion = {
      id: `explosion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position,
      color,
      timestamp: Date.now(),
    };
    
    set((state) => ({
      explosions: [...state.explosions, explosion],
    }));
  },

  removeExplosion: (id) => {
    set((state) => ({
      explosions: state.explosions.filter((exp) => exp.id !== id),
    }));
  },

  processCollisions: () => {
    const state = get();
    const { satellites, collisions } = state;
    
    // Process imminent collisions (within ~1.5s and moderate probability)
    const imminentCollisions = collisions.filter(
      (collision) => collision.timeToCollision <= 1.5 && collision.probability >= 0.5
    );
    
    if (imminentCollisions.length > 0) {
      const satellitesToRemove = new Set<string>();
      const explosionsToAdd: Explosion[] = [];
      
      imminentCollisions.forEach((collision) => {
        const sat1 = satellites.find(s => s.id === collision.satellite1Id);
        const sat2 = satellites.find(s => s.id === collision.satellite2Id);
        
        if (sat1 && sat2) {
          // Create explosion at collision point
          explosionsToAdd.push({
            id: `explosion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            position: collision.collisionPoint,
            color: sat1.color, // Use first satellite's color
            timestamp: Date.now(),
          });
          
          // Mark satellites for removal
          satellitesToRemove.add(sat1.id);
          satellitesToRemove.add(sat2.id);
        }
      });
      
      // Update state
      set((state) => ({
        satellites: state.satellites.filter(sat => !satellitesToRemove.has(sat.id)),
        selectedSatelliteIds: state.selectedSatelliteIds.filter(id => !satellitesToRemove.has(id)),
        explosions: [...state.explosions, ...explosionsToAdd],
        collisions: [], // Clear collisions after processing
      }));
    }
  },
}));

// Helper function to generate random satellite
export const createRandomSatellite = () => {
  const state = useSatelliteStore.getState();
  return generateRandomSatellite(state.satelliteCounter);
};