import { useRef } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

export default function Lane() {
  const pathRef = useRef<THREE.Mesh>(null);
  
  // Load path texture
  const sandTexture = useTexture("/textures/sand.jpg");
  sandTexture.repeat.set(10, 1);
  sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
  
  // Create lane geometry
  const laneWidth = 4;
  const laneLength = 30;
  
  return (
    <mesh 
      ref={pathRef}
      position={[0, 0.01, 0]} 
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[laneLength, laneWidth]} />
      <meshStandardMaterial 
        map={sandTexture} 
        roughness={0.8}
      />
    </mesh>
  );
}
