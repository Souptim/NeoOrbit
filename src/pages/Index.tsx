import { Suspense } from 'react';
import { Scene3D } from '@/components/Scene3D';
import { SimulationControls } from '@/components/SimulationControls';
import { motion } from 'framer-motion';
import { Satellite, AlertTriangle, Globe } from 'lucide-react';

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary animate-pulse-glow" />
              <Satellite className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Satellite Collision Predictor
              </h1>
              <p className="text-xs text-muted-foreground">
                Real-time orbital mechanics simulation
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Warning Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute top-20 right-4 z-20"
      >
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Live Collision Detection</span>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <SimulationControls />
      
      {/* 3D Scene */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Globe className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading Earth simulation...</p>
          </div>
        </div>
      }>
        <Scene3D />
      </Suspense>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-4 right-4 z-20"
      >
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 max-w-xs">
          <h3 className="text-sm font-semibold mb-2">Controls</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Click and drag to rotate view</li>
            <li>• Scroll to zoom in/out</li>
            <li>• Click satellites to select</li>
            <li>• Add random satellites to test</li>
            <li>• Watch for collision warnings</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
