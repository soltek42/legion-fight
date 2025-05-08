import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameState } from "@/lib/stores/useGameState";
import { useBuildingPlacement } from "@/lib/stores/useBuildingPlacement";
import Lane from "./Lane";
import Castle from "./Castle";
import Building from "./Building";
import Unit from "./Unit";
import { useTexture } from "@react-three/drei";

export function GameBoard() {
  const { 
    playerRace, 
    enemyRace, 
    playerBuildings, 
    enemyBuildings, 
    playerUnits, 
    enemyUnits,
    playerCastleHealth,
    enemyCastleHealth,
    gamePhase,
    lastGameTick,
    updateGameState
  } = useGameState();
  
  const { 
    placementMode, 
    selectedBuildingType, 
    cursorPosition, 
    placeBuildingAtCursor,
    exitPlacementMode
  } = useBuildingPlacement();
  
  const [, getKeys] = useKeyboardControls();
  
  // Load grass texture for the game board
  const grassTexture = useTexture("/textures/grass.png");
  grassTexture.repeat.set(10, 10);
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  
  // Create grid for building placement
  const grid = useMemo(() => {
    const size = 20;
    const divisions = 20;
    const gridHelper = new THREE.GridHelper(size, divisions);
    return gridHelper;
  }, []);
  
  // Handle game updates in the game loop
  useFrame((_, delta) => {
    // Only update game state when in building or combat phase
    if (gamePhase === 'building' || gamePhase === 'combat') {
      const now = Date.now();
      
      // Update game state at fixed intervals (every 100ms)
      if (now - lastGameTick > 100) {
        updateGameState(delta);
      }
      
      // Handle building placement when in placement mode
      if (placementMode && selectedBuildingType) {
        const keys = getKeys();
        if (keys.select) {
          placeBuildingAtCursor();
        }
        if (keys.cancel) {
          exitPlacementMode();
        }
      }
    }
  });
  
  // Ensure placement mode is exited when game phase changes
  useEffect(() => {
    if (gamePhase !== 'building') {
      exitPlacementMode();
    }
  }, [gamePhase, exitPlacementMode]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
      />
      
      {/* Game Board */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial map={grassTexture} />
      </mesh>
      
      {/* Lane */}
      <Lane />
      
      {/* Player Castle */}
      <Castle 
        position={[-12, 1, 0]} 
        race={playerRace || "human"} 
        isPlayer={true} 
        health={playerCastleHealth}
      />
      
      {/* Enemy Castle */}
      <Castle 
        position={[12, 1, 0]} 
        race={enemyRace || "undead"} 
        isPlayer={false} 
        health={enemyCastleHealth}
      />
      
      {/* Player Buildings */}
      {playerBuildings.map((building) => (
        <Building 
          key={building.id}
          position={building.position}
          rotation={[0, 0, 0]}
          type={building.type}
          race={playerRace || "human"}
          isPlayer={true}
          cooldown={building.cooldown}
          maxCooldown={building.maxCooldown}
        />
      ))}
      
      {/* Enemy Buildings */}
      {enemyBuildings.map((building) => (
        <Building 
          key={building.id}
          position={building.position}
          rotation={[0, Math.PI, 0]}
          type={building.type}
          race={enemyRace || "undead"}
          isPlayer={false}
          cooldown={building.cooldown}
          maxCooldown={building.maxCooldown}
        />
      ))}
      
      {/* Player Units */}
      {playerUnits.map((unit) => (
        <Unit 
          key={unit.id}
          position={unit.position}
          rotation={[0, 0, 0]}
          type={unit.type}
          race={playerRace || "human"}
          isPlayer={true}
          health={unit.health}
          maxHealth={unit.maxHealth}
          attacking={unit.attacking}
        />
      ))}
      
      {/* Enemy Units */}
      {enemyUnits.map((unit) => (
        <Unit 
          key={unit.id}
          position={unit.position}
          rotation={[0, Math.PI, 0]}
          type={unit.type}
          race={enemyRace || "undead"}
          isPlayer={false}
          health={unit.health}
          maxHealth={unit.maxHealth}
          attacking={unit.attacking}
        />
      ))}
      
      {/* Building Placement Grid - only visible in building phase and placement mode */}
      {gamePhase === 'building' && placementMode && (
        <>
          <primitive object={grid} />
          {selectedBuildingType && (
            <mesh position={[cursorPosition.x, 0.5, cursorPosition.z]} opacity={0.5}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#44ff44" transparent opacity={0.5} />
            </mesh>
          )}
        </>
      )}
    </>
  );
}

export default GameBoard;
