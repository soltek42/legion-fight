import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { BuildingType } from "@shared/types";
import { buildingsData } from "@/lib/game/buildingsData";

interface BuildingProps {
  position: [number, number, number];
  rotation: [number, number, number];
  type: BuildingType;
  race: string;
  isPlayer: boolean;
  cooldown: number;
  maxCooldown: number;
}

export default function Building({
  position,
  rotation,
  type,
  race,
  isPlayer,
  cooldown,
  maxCooldown
}: BuildingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cooldownBarRef = useRef<THREE.Mesh>(null);
  const [buildingColor, setBuildingColor] = useState<string>("#ffffff");
  const [buildingSize, setBuildingSize] = useState<[number, number, number]>([1, 1, 1]);
  
  // Set up building appearance based on type and race
  useEffect(() => {
    const buildingData = buildingsData[type];
    if (!buildingData) return;
    
    // Determine color based on race and player/enemy
    let color = "#dddddd";
    if (race === "nature") {
      color = isPlayer ? "#33cc33" : "#009900";
    } else if (race === "undead") {
      color = isPlayer ? "#cc33cc" : "#990099";
    } else if (race === "human") {
      color = isPlayer ? "#3366ff" : "#0033cc";
    } else if (race === "fire") {
      color = isPlayer ? "#ff6600" : "#cc3300";
    }
    
    setBuildingColor(color);
    
    // Set size based on building category
    if (buildingData.category === "combat") {
      setBuildingSize([1.2, 1.5, 1.2]);
    } else if (buildingData.category === "economy") {
      setBuildingSize([1, 1.2, 1]);
    } else if (buildingData.category === "special") {
      setBuildingSize([1.4, 1.3, 1.4]);
    }
  }, [type, race, isPlayer]);
  
  // Update cooldown bar
  useFrame(() => {
    if (!cooldownBarRef.current) return;
    
    // Calculate cooldown percentage
    const cooldownPercent = 1 - (cooldown / maxCooldown);
    
    // Update cooldown bar scale
    cooldownBarRef.current.scale.x = cooldownPercent;
    
    // Change color based on cooldown progress
    const material = cooldownBarRef.current.material as THREE.MeshBasicMaterial;
    if (cooldownPercent < 0.3) {
      material.color.set("#cc2222");
    } else if (cooldownPercent < 0.7) {
      material.color.set("#cccc22");
    } else {
      material.color.set("#22cc22");
    }
  });
  
  // Get building data
  const buildingData = buildingsData[type];
  if (!buildingData) return null;
  
  return (
    <group>
      {/* Building body */}
      <mesh 
        ref={meshRef}
        position={position}
        rotation={rotation}
        castShadow
        receiveShadow
      >
        <boxGeometry args={buildingSize} />
        <meshStandardMaterial color={buildingColor} />
      </mesh>
      
      {/* Roof (to make it look like a building) */}
      <mesh 
        position={[position[0], position[1] + buildingSize[1]/2 + 0.1, position[2]]}
        rotation={[0, rotation[1], 0]}
        castShadow
      >
        <coneGeometry args={[buildingSize[0] * 0.8, 0.6, 4]} />
        <meshStandardMaterial color={buildingColor} />
      </mesh>
      
      {/* Cooldown progress bar */}
      <mesh
        ref={cooldownBarRef}
        position={[
          position[0], 
          position[1] + buildingSize[1]/2 + 0.5, 
          position[2]
        ]}
        rotation={[0, 0, 0]}
      >
        <planeGeometry args={[1, 0.1]} />
        <meshBasicMaterial color="#22cc22" />
      </mesh>
      
      {/* Building label */}
      <Text
        position={[
          position[0], 
          position[1] + buildingSize[1]/2 + 0.7, 
          position[2]
        ]}
        rotation={[0, isPlayer ? 0 : Math.PI, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        backgroundColor="transparent"
      >
        {buildingData.name}
      </Text>
    </group>
  );
}
