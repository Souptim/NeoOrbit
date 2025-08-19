import { Play, Pause, RotateCcw, Plus, Trash2, Settings, AlertTriangle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSatelliteStore, createRandomSatellite } from '@/store/satelliteStore';
import { motion } from 'framer-motion';
import { useState } from 'react';

export const SimulationControls = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const {
    satellites,
    collisions,
    isSimulationRunning,
    simulationSpeed,
    selectedSatelliteIds,
    time,
    toggleSimulation,
    setSimulationSpeed,
    resetSimulation,
    addSatellite,
    removeSatellite,
    setSelectedSatellites,
    toggleSatelliteSelection,
    clearSelection,
  } = useSatelliteStore();

  const selectedSatellites = satellites.filter(sat => selectedSatelliteIds.includes(sat.id));
  const primarySelectedSatellite = selectedSatellites[0];

  const handleAddRandomSatellite = () => {
    addSatellite(createRandomSatellite());
  };

  const handleCollisionClick = (collision: typeof collisions[0]) => {
    // Select both satellites involved in the collision
    setSelectedSatellites([collision.satellite1Id, collision.satellite2Id]);
  };

  const handleDeleteSatellite = (satelliteId: string) => {
    removeSatellite(satelliteId);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        width: isCollapsed ? "3rem" : "20rem"
      }}
      className="fixed left-4 top-4 z-10 max-h-[calc(100vh-2rem)] overflow-x-hidden"
    >
      <Card className="bg-card/95 backdrop-blur-sm border-border overflow-hidden">
        {/* Collapse/Expand Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full border bg-card p-0 hover:bg-muted"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        
        {isCollapsed ? (
          // Collapsed view - just basic controls
          <div className="p-2 space-y-2">
            <Button
              variant={isSimulationRunning ? "secondary" : "default"}
              size="sm"
              onClick={toggleSimulation}
              className="w-full p-1"
            >
              {isSimulationRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetSimulation}
              className="w-full p-1"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRandomSatellite}
              className="w-full p-1"
            >
              <Plus className="h-4 w-4" />
            </Button>
            {selectedSatelliteIds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="w-full p-1"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          // Expanded view - full controls
          <>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-primary" />
                Satellite Control Center
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Time: {formatTime(time)} | Speed: {simulationSpeed.toFixed(1)}x
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {/* Simulation Controls */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    variant={isSimulationRunning ? "secondary" : "default"}
                    size="sm"
                    onClick={toggleSimulation}
                    className="flex-1"
                  >
                    {isSimulationRunning ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetSimulation}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Speed Control */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Simulation Speed</span>
                    <span>{simulationSpeed.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[simulationSpeed]}
                    onValueChange={([value]) => setSimulationSpeed(value)}
                    min={0.1}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>

              <Separator />

              {/* Satellite Management */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Satellites ({satellites.length})</span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddRandomSatellite}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                    {selectedSatelliteIds.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                        title="View all orbits"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Satellite List */}
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {satellites.map((satellite) => (
                    <div
                      key={satellite.id}
                      className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer transition-colors ${
                        selectedSatelliteIds.includes(satellite.id)
                          ? 'bg-primary/20 border border-primary/30'
                          : 'bg-secondary/30 hover:bg-secondary/50'
                      }`}
                      onClick={() => toggleSatelliteSelection(satellite.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: satellite.color }}
                        />
                        <span className="font-medium">{satellite.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSatellite(satellite.id);
                        }}
                        className="h-6 w-6 p-0 hover:bg-destructive/20"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {selectedSatellites.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedSatellites.map((satellite) => (
                      <div key={satellite.id} className="p-3 bg-primary/10 rounded-md border border-primary/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-primary">{satellite.name}</span>
                          <Badge variant="secondary" style={{ backgroundColor: satellite.color, color: 'white' }}>
                            Selected
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>Altitude: {(satellite.orbitRadius - 5).toFixed(1)}u</div>
                          <div>Speed: {satellite.orbitSpeed.toFixed(3)}</div>
                          <div>Inclination: {(satellite.inclination * 180 / Math.PI).toFixed(1)}°</div>
                          <div>Mass: {satellite.mass.toFixed(0)}kg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Collision Warnings */}
              {collisions.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Collision Warnings ({collisions.length})
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {collisions.slice(0, 5).map((collision, index) => {
                        const sat1 = satellites.find(s => s.id === collision.satellite1Id);
                        const sat2 = satellites.find(s => s.id === collision.satellite2Id);
                        const isInvolved = selectedSatelliteIds.includes(collision.satellite1Id) && selectedSatelliteIds.includes(collision.satellite2Id);
                        return (
                          <motion.div
                            key={`${collision.satellite1Id}-${collision.satellite2Id}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-2 rounded border cursor-pointer transition-all hover:scale-[1.02] ${
                              isInvolved 
                                ? 'bg-destructive/20 border-destructive/40 shadow-md'
                                : 'bg-destructive/10 border-destructive/20 hover:bg-destructive/15'
                            }`}
                            onClick={() => handleCollisionClick(collision)}
                          >
                            <div className="text-xs">
                              <div className="font-medium flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sat1?.color }} />
                                {sat1?.name} 
                                <span className="text-destructive">↔</span>
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sat2?.color }} />
                                {sat2?.name}
                              </div>
                              <div className="text-muted-foreground mt-1">
                                T-{collision.timeToCollision.toFixed(1)}s
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <Badge variant="destructive" className="text-xs">
                                  {(collision.probability * 100).toFixed(0)}% risk
                                </Badge>
                                {isInvolved && (
                                  <Badge variant="outline" className="text-xs">
                                    Viewing
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Statistics */}
              <Separator />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-primary">{satellites.length}</div>
                  <div className="text-muted-foreground">Active Satellites</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-accent">{selectedSatellites.length}</div>
                  <div className="text-muted-foreground">Selected</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-destructive">{collisions.length}</div>
                  <div className="text-muted-foreground">Collisions</div>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </motion.div>
  );
};