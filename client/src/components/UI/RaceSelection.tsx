import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/UI/tabs";
import { Badge } from "@/components/UI/badge";
import { Shield, Swords, Zap, Check } from "lucide-react";
import { useGameState } from "@/lib/stores/useGameState";
import { Race } from "@shared/types";
import { racesData } from "@/lib/game/racesData";
import { connectSocket } from "@/lib/socket";

export default function RaceSelection() {
  const { startGame, gameMode } = useGameState();
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [enemyRace, setEnemyRace] = useState<Race | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isEnemyReady, setIsEnemyReady] = useState(false);

  useEffect(() => {
    const socket = connectSocket();

    // Listen for opponent's race selection
    socket.on("opponentRaceSelected", (race: Race) => {
      setEnemyRace(race);
    });

    // Listen for opponent's ready state
    socket.on("opponentReady", (ready: boolean) => {
      setIsEnemyReady(ready);
    });

    return () => {
      socket.off("opponentRaceSelected");
      socket.off("opponentReady");
    };
  }, []);

  const handleRaceSelect = (race: Race) => {
    if (!isReady) { // Only allow selection if not ready
      setSelectedRace(race);
      // Emit race selection to opponent
      const socket = connectSocket();
      socket.emit("selectRace", race);
    }
  };

  const handleReady = () => {
    if (selectedRace) {
      setIsReady(true);
      // Emit ready state to opponent
      const socket = connectSocket();
      socket.emit("playerReady", true);
    }
  };

  const handleStartGame = () => {
    if (selectedRace && (gameMode === "ai" || (isReady && isEnemyReady))) {
      startGame(selectedRace, enemyRace || "undead");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('https://pixabay.com/get/g718605a71d3a7efcd658f0c7eb4dd045c43edbba5bc9955b8cad6936107697ef5ceac96891e7ae2c15b0811ae2d7ead89f0e78fd4a0248aea36cfd6885a43294_1280.jpg')",
        backdropFilter: "blur(4px)"
      }}>
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <Card className="relative w-full max-w-4xl mx-4 border-2 border-amber-600 bg-gray-900/90 text-white z-10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold text-amber-400">Choose Your Race</CardTitle>
          <CardDescription className="text-gray-300">
            Each race has unique buildings and units with different strengths
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Player Race Selection */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-amber-400 mb-4">Your Race {isReady && <Check className="inline text-green-500 ml-2" />}</h3>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(racesData).map(([raceKey, raceData]) => {
                  const race = raceKey as Race;
                  return (
                    <div
                      key={race}
                      className={`
                        border-2 rounded-lg p-4 cursor-pointer transition-all
                        ${!isReady ? 'hover:border-gray-500' : ''}
                        ${selectedRace === race ? 'border-amber-500 bg-gray-800/80' : 'border-gray-700 bg-gray-800/40'}
                        ${isReady ? 'cursor-not-allowed' : ''}
                      `}
                      onClick={() => !isReady && handleRaceSelect(race)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold capitalize">{race}</h3>
                        {selectedRace === race && (
                          <Badge className="bg-amber-600">Selected</Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-300 mb-4">{raceData.description}</p>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="flex flex-col items-center">
                          <Shield className="h-5 w-5 text-blue-400 mb-1" />
                          <span className="text-xs text-center">{raceData.defense}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Swords className="h-5 w-5 text-red-400 mb-1" />
                          <span className="text-xs text-center">{raceData.offense}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Zap className="h-5 w-5 text-yellow-400 mb-1" />
                          <span className="text-xs text-center">{raceData.economy}</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-400">
                        <p><strong>Specialty:</strong> {raceData.specialty}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enemy Race Display */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-red-400 mb-4">
                Opponent's Race {isEnemyReady && <Check className="inline text-green-500 ml-2" />}
              </h3>
              {enemyRace ? (
                <div className="border-2 border-red-500 rounded-lg p-4 bg-gray-800/80">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold capitalize">{enemyRace}</h3>
                    <Badge className="bg-red-600">Selected</Badge>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">{racesData[enemyRace].description}</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="flex flex-col items-center">
                      <Shield className="h-5 w-5 text-blue-400 mb-1" />
                      <span className="text-xs text-center">{racesData[enemyRace].defense}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Swords className="h-5 w-5 text-red-400 mb-1" />
                      <span className="text-xs text-center">{racesData[enemyRace].offense}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Zap className="h-5 w-5 text-yellow-400 mb-1" />
                      <span className="text-xs text-center">{racesData[enemyRace].economy}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-gray-700 rounded-lg p-4 bg-gray-800/40">
                  <p className="text-gray-400 text-center">Waiting for opponent to select a race...</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Back
          </Button>
          <div className="space-x-4">
            <Button
              onClick={handleReady}
              disabled={!selectedRace || isReady}
              className={`
                font-bold 
                ${!isReady ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700'}
                ${!selectedRace && 'cursor-not-allowed'}
              `}
            >
              {isReady ? 'Ready!' : 'Ready'}
            </Button>
            <Button
              onClick={handleStartGame}
              disabled={!isReady || (gameMode === "pvp" && !isEnemyReady)}
              className={`
                font-bold 
                ${(isReady && (gameMode === "ai" || isEnemyReady)) ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-700 cursor-not-allowed'}
              `}
            >
              Start Game
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
