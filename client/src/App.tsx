import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAudio } from "./lib/stores/useAudio";
import { useGameState } from "./lib/stores/useGameState";
import { GameBoard } from "./components/Game/GameBoard";
import GameMenu from "./components/UI/GameMenu";
import RaceSelection from "./components/UI/RaceSelection";
import GameOverScreen from "./components/UI/GameOverScreen";
import WaitingScreen from "./components/UI/WaitingScreen";
import ResourceBar from "./components/Game/ResourceBar";
import BuildingMenu from "./components/Game/BuildingMenu";
import { connectSocket, disconnectSocket } from "./lib/socket";
import "@fontsource/inter";

// Define control keys for the game
const controls = [
  { name: "select", keys: ["KeyE"] },
  { name: "cancel", keys: ["Escape"] },
  { name: "build", keys: ["KeyB"] },
];

const queryClient = new QueryClient();

// Main App component
function App() {
  const { gamePhase, playerRace, enemyRace } = useGameState();
  const [showCanvas, setShowCanvas] = useState(false);
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  // Load audio assets
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const hit = new Audio("/sounds/hit.mp3");
    hit.volume = 0.5;
    setHitSound(hit);

    const success = new Audio("/sounds/success.mp3");
    success.volume = 0.5;
    setSuccessSound(success);

    // Show the canvas once everything is loaded
    setShowCanvas(true);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);
  
  // Socket connection management
  useEffect(() => {
    // Initialize socket connection
    console.log("Initializing socket connection...");
    const socket = connectSocket();
    
    // Clean up socket connection on unmount
    return () => {
      console.log("Cleaning up socket connection...");
      disconnectSocket();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {showCanvas && (
          <KeyboardControls map={controls}>
            <div className="fixed top-0 left-0 w-full h-full z-0">
              <Canvas
                shadows
                camera={{
                  position: [0, 15, 15],
                  fov: 50,
                  near: 0.1,
                  far: 100
                }}
                gl={{
                  antialias: true,
                  powerPreference: "default"
                }}
              >
                <color attach="background" args={["#87CEEB"]} />
                
                {/* Game board is only rendered when game is active */}
                {(gamePhase === 'building' || gamePhase === 'combat') && playerRace && enemyRace && (
                  <GameBoard />
                )}
              </Canvas>
            </div>

            {/* UI Layers */}
            {gamePhase === 'menu' && <GameMenu />}
            {gamePhase === 'waiting' && <WaitingScreen />}
            {gamePhase === 'race_selection' && <RaceSelection />}
            {(gamePhase === 'building' || gamePhase === 'combat') && <ResourceBar />}
            {(gamePhase === 'building') && <BuildingMenu />}
            {gamePhase === 'game_over' && <GameOverScreen />}
          </KeyboardControls>
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
