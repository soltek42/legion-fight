import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";

interface CastleProps {
  position: [number, number, number];
  race: string;
  isPlayer: boolean;
  health: number;
}

export default function Castle({
  position,
  race,
  isPlayer,
  health
}: CastleProps) {
  const castleRef = useRef<THREE.Group>(null);
  const healthBarRef = useRef<THREE.Mesh>(null);
  const [castleColor, setCastleColor] = useState<string>("#ffffff");
  
  // Set castle color based on race and owner
  useEffect(() => {
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
    
    setCastleColor(color);
  }, [race, isPlayer]);
  
  // Update health bar
  useFrame(() => {
    if (!healthBarRef.current) return;
    
    // Calculate health percentage
    const healthPercent = health / 1000;
    
    // Update health bar scale
    healthBarRef.current.scale.x = healthPercent;
    
    // Change color based on health percentage
    const material = healthBarRef.current.material as THREE.MeshBasicMaterial;
    if (healthPercent < 0.3) {
      material.color.set("#cc2222");
    } else if (healthPercent < 0.7) {
      material.color.set("#cccc22");
    } else {
      material.color.set("#22cc22");
    }
    
    // Add slight wobble when health is low
    if (castleRef.current && health < 300) {
      castleRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.05;
    }
  });
  
  return (
    <group ref={castleRef}>
      {/* Main castle body */}
      <mesh 
        position={position}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[3, 4, 3]} />
        <meshStandardMaterial color={castleColor} />
      </mesh>
      
      {/* Castle towers (4 corners) */}
      {[
        [1.5, 0, 1.5],
        [1.5, 0, -1.5],
        [-1.5, 0, 1.5],
        [-1.5, 0, -1.5]
      ].map((offset, index) => (
        <mesh 
          key={index}
          position={[
            position[0] + offset[0], 
            position[1] + 2.5, 
            position[2] + offset[2]
          ]}
          castShadow
        >
          <cylinderGeometry args={[0.5, 0.7, 5, 8]} />
          <meshStandardMaterial color={castleColor} />
          <mesh position={[0, 3, 0]}>
            <coneGeometry args={[0.7, 1, 8]} />
            <meshStandardMaterial color={castleColor === "#ffffff" ? "#aa3333" : castleColor} />
          </mesh>
        </mesh>
      ))}
      
      {/* Castle entrance */}
      <mesh 
        position={[
          position[0] + (isPlayer ? 1.51 : -1.51),
          position[1] - 0.5,
          position[2]
        ]}
        rotation={[0, isPlayer ? Math.PI/2 : -Math.PI/2, 0]}
      >
        <boxGeometry args={[1.5, 3, 1]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Health bar */}
      <mesh
        ref={healthBarRef}
        position={[position[0], position[1] + 3, position[2]]}
        rotation={[0, 0, 0]}
      >
        <planeGeometry args={[3, 0.3]} />
        <meshBasicMaterial color="#22cc22" />
      </mesh>
      
      {/* Castle label */}
      <Text
        position={[position[0], position[1] + 4, position[2]]}
        rotation={[0, 0, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        backgroundColor="transparent"
      >
        {isPlayer ? "Player Castle" : "Enemy Castle"}
      </Text>
    </group>
  );
}
