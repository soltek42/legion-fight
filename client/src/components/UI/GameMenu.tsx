import { useState, useEffect } from "react";
import { Button } from "@/components/UI/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/UI/card";
import { useGameState } from "@/lib/stores/useGameState";
import { useAudio } from "@/lib/stores/useAudio";
import { useGame } from "@/lib/stores/useGame";
import { connectSocket } from "../../lib/socket";

interface GameMenuProps {
  setIsWaiting: (waiting: boolean) => void;
}

export default function GameMenu({ setIsWaiting }: GameMenuProps) {
  const { startRaceSelection } = useGameState();
  const { backgroundMusic, toggleMute, isMuted } = useAudio();
  const { startGame } = useGame();
  const [showCredits, setShowCredits] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Start background music when component mounts
  useEffect(() => {
    if (backgroundMusic) {
      backgroundMusic.loop = true;
      backgroundMusic.play().catch(err => console.log("Audio playback prevented:", err));
    }
  }, [backgroundMusic]);

  const handlePlayClick = () => {
    // If muted, unmute when player starts game
    if (isMuted) {
      toggleMute();
    }
    startRaceSelection();
  };

  const handlePlayVsAI = () => {
    // If muted, unmute when player starts game
    if (isMuted) {
      toggleMute();
    }
    setIsWaiting(true); // Show waiting screen
    startRaceSelection(); // Start race selection phase
  };

  const handlePlayOnline = () => {
    setIsSearching(true);
    setIsWaiting(true);
    const socket = connectSocket();
    socket.emit("joinWaitingRoom");

    // Listen for return to queue event
    socket.on("returnToQueue", () => {
      setIsSearching(false);
      setIsWaiting(false);
    });

    socket.on("gameDeclined", () => {
      setIsSearching(false);
      setIsWaiting(false);
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-cover bg-center" 
      style={{ 
        backgroundImage: "url('https://pixabay.com/get/g22cce595e401c40adb86e191f682264ecd1a5a36ffa4fd15f7e4fc1a66d729c7e8edc2de35e19c51b08bf13583233b19965baac5518dc54efff6984c0ad54621_1280.jpg')",
        backdropFilter: "blur(4px)"
      }}>
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <Card className="relative w-full max-w-lg mx-4 border-2 border-amber-600 bg-gray-900/90 text-white z-10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-4xl font-bold text-amber-400">Castle Fight</CardTitle>
          <CardDescription className="text-gray-300">
            A passive-strategy PvP game of building and combat
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-800/80 rounded-lg text-sm text-gray-200">
            <p>Build structures that spawn units to attack your enemy's castle. Position your buildings strategically, choose the right units, and destroy the enemy castle to win!</p>
          </div>

          {showCredits ? (
            <div className="p-4 bg-gray-800/80 rounded-lg text-sm space-y-2">
              <h3 className="text-amber-400 font-bold">Game Credits</h3>
              <p>A browser-based adaptation of the classic Castle Fight game</p>
              <p>Background images sourced from Pixabay</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCredits(false)}
                className="mt-2 border-amber-600 text-amber-400 hover:bg-amber-900/50"
              >
                Back to Menu
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="flex gap-3">
                <Button 
                  onClick={handlePlayVsAI} 
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-4"
                >
                  P vs AI
                </Button>
                <Button 
                  onClick={handlePlayOnline} 
                  disabled={isSearching} 
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-4"
                >
                  {isSearching ? "Finding..." : "P vs P"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCredits(true)}
                  className="border-amber-600 text-amber-400 hover:bg-amber-900/50"
                >
                  Credits
                </Button>
                <Button 
                  variant="outline" 
                  onClick={toggleMute}
                  className="border-amber-600 text-amber-400 hover:bg-amber-900/50"
                >
                  {isMuted ? "Sound: Off" : "Sound: On"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="text-center text-gray-400 text-xs">
          <p className="w-full">Use your strategy and resource management skills to defeat your opponent!</p>
        </CardFooter>
      </Card>
    </div>
  );
}