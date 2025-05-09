import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Swords, Zap } from "lucide-react";
import { useGameState } from "@/lib/stores/useGameState";
import { Race } from "@shared/types";
import { racesData } from "@/lib/game/racesData";

export default function RaceSelection() {
  const { startGame } = useGameState();
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [enemyRace, setEnemyRace] = useState<Race>("undead");

  const handleRaceSelect = (race: Race) => {
    setSelectedRace(race);
  };

  const handleEnemyRaceSelect = (race: Race) => {
    setEnemyRace(race);
  };

  const handleStartGame = () => {
    if (selectedRace) {
      startGame(selectedRace, enemyRace);
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
            <Tabs defaultValue="player" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4 bg-gray-800">
                <TabsTrigger value="player" className="text-white data-[state=active]:bg-amber-700">
                  Your Race
                </TabsTrigger>
                <TabsTrigger value="enemy" className="text-white data-[state=active]:bg-amber-700">
                  Enemy Race
                </TabsTrigger>
              </TabsList>

              {/* Player Race Selection */}
              <TabsContent value="player" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(racesData).map(([raceKey, raceData]) => {
                    const race = raceKey as Race;
                    return (
                        <div
                            key={race}
                            className={`
                        border-2 rounded-lg p-4 cursor-pointer transition-all
                        ${selectedRace === race ? 'border-amber-500 bg-gray-800/80' : 'border-gray-700 bg-gray-800/40 hover:border-gray-500'}
                      `}
                            onClick={() => handleRaceSelect(race)}
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
              </TabsContent>

              {/* Enemy Race Selection */}
              <TabsContent value="enemy" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(racesData).map(([raceKey, raceData]) => {
                    const race = raceKey as Race;
                    return (
                        <div
                            key={race}
                            className={`
                        border-2 rounded-lg p-4 cursor-pointer transition-all
                        ${enemyRace === race ? 'border-amber-500 bg-gray-800/80' : 'border-gray-700 bg-gray-800/40 hover:border-gray-500'}
                      `}
                            onClick={() => handleEnemyRaceSelect(race)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold capitalize">{race}</h3>
                            {enemyRace === race && (
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
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Back
            </Button>
            <Button
                onClick={handleStartGame}
                disabled={!selectedRace}
                className={`
              font-bold 
              ${selectedRace ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-700 cursor-not-allowed'}
            `}
            >
              Start Game
            </Button>
          </CardFooter>
        </Card>
      </div>
  );
}
