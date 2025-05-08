import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { UnitType } from "@shared/types";
import { unitsData } from "@/lib/game/unitsData";
import { useAudio } from "@/lib/stores/useAudio";

interface UnitProps {
  position: [number, number, number];
  rotation: [number, number, number];
  type: UnitType;
  race: string;
  isPlayer: boolean;
  health: number;
  maxHealth: number;
  attacking: boolean;
}

export default function Unit({ 
  position, 
  rotation, 
  type, 
  race, 
  isPlayer,
  health,
  maxHealth,
  attacking
}: UnitProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const healthBarRef = useRef<THREE.Mesh>(null);
  const [unitColor, setUnitColor] = useState<string>("#ffffff");
  const [unitSize, setUnitSize] = useState<[number, number, number]>([0.5, 0.7, 0.3]);
  const { playHit } = useAudio();
  
  // Set up unit appearance based on type and race
  useEffect(() => {
    const unitData = unitsData[type];
    if (!unitData) return;
    
    // Determine color based on race and player/enemy
    let color = "#ff0000";
    if (race === "nature") {
      color = isPlayer ? "#33cc33" : "#009900";
    } else if (race === "undead") {
      color = isPlayer ? "#cc33cc" : "#990099";
    } else if (race === "human") {
      color = isPlayer ? "#3366ff" : "#0033cc";
    } else if (race === "fire") {
      color = isPlayer ? "#ff6600" : "#cc3300";
    }
    
    setUnitColor(color);
    
    // Set size based on unit type
    if (unitData.category === "melee") {
      setUnitSize([0.5, 0.7, 0.3]);
    } else if (unitData.category === "ranged") {
      setUnitSize([0.4, 0.6, 0.3]);
    } else if (unitData.category === "flying") {
      setUnitSize([0.6, 0.3, 0.6]);
    } else if (unitData.category === "siege") {
      setUnitSize([0.7, 0.5, 0.5]);
    }
  }, [type, race, isPlayer]);
  
  // Animate unit (bobbing, attacking)
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    // Slight bobbing animation
    meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.005) * 0.05;
    
    // Attack animation
    if (attacking) {
      // Forward lunge when attacking
      meshRef.current.position.x = position[0] + (isPlayer ? 0.1 : -0.1) * Math.sin(Date.now() * 0.01);
      
      // Play hit sound occasionally during attack
      if (Math.random() < 0.01) {
        playHit();
      }
    }
    
    // Update health bar position and scale
    if (healthBarRef.current) {
      healthBarRef.current.position.set(
        meshRef.current.position.x,
        meshRef.current.position.y + unitSize[1] + 0.2,
        meshRef.current.position.z
      );
      
      // Scale health bar based on current health
      const healthPercent = health / maxHealth;
      healthBarRef.current.scale.x = 0.5 * healthPercent;
    }
  });
  
  // Get unit data
  const unitData = unitsData[type];
  if (!unitData) return null;
  
  const healthPercent = health / maxHealth;
  const healthBarColor = healthPercent > 0.6 ? "#22cc22" : healthPercent > 0.3 ? "#cccc22" : "#cc2222";
  
  return (
    <group>
      {/* Unit body */}
      <mesh 
        ref={meshRef}
        position={position}
        rotation={rotation}
        castShadow
      >
        <boxGeometry args={unitSize} />
        <meshStandardMaterial color={unitColor} />
      </mesh>
      
      {/* Health bar */}
      <mesh
        ref={healthBarRef}
        position={[position[0], position[1] + unitSize[1] + 0.2, position[2]]}
        rotation={[0, 0, 0]}
      >
        <planeGeometry args={[0.5, 0.05]} />
        <meshBasicMaterial color={healthBarColor} />
      </mesh>
      
      {/* Unit type label */}
      <Text
        position={[position[0], position[1] + unitSize[1] + 0.3, position[2]]}
        rotation={[0, isPlayer ? 0 : Math.PI, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        backgroundColor="transparent"
      >
        {unitData.name}
      </Text>
    </group>
  );
}
