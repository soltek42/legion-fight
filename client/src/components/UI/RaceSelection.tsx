import { useState, useEffect } from "react";
import { Card } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/UI/carousel";
import { Badge } from "@/components/UI/badge";
import { Shield, Swords, Zap } from "lucide-react";
import { useGameState } from "@/lib/stores/useGameState";
import { Race } from "@shared/types";
import { racesData } from "@/lib/game/racesData";
import { selectRace } from "@/lib/socket";

export default function RaceSelection() {
  const { startGame, playerName, opponentName, playerRace, enemyRace, setPlayerRace } = useGameState();
  const [isReady, setIsReady] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const races = Object.keys(racesData) as Race[];

  // Initialize carousel position and select first race when component mounts
  useEffect(() => {
    if (api) {
      // If no race is selected, select the first one
      if (!playerRace) {
        const firstRace = races[0];
        selectRace(firstRace);
        setPlayerRace(firstRace);
      } else {
        // If a race is already selected, scroll to it
        const index = races.indexOf(playerRace);
        if (index !== -1) {
          api.scrollTo(index);
        }
      }
    }
  }, [api, playerRace]);

  // Handle carousel selection
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const index = api.selectedScrollSnap();
      const newRace = races[index];
      selectRace(newRace);
      setPlayerRace(newRace);
      
      // If player was ready, they need to confirm their new race choice
      if (isReady) {
        setIsReady(false);
      }
    };

    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api, isReady]);

  const handleReadyClick = () => {
    if (playerRace) {
      setIsReady(true);
      startGame(playerRace, enemyRace || "undead");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('https://pixabay.com/get/g718605a71d3a7efcd658f0c7eb4dd045c43edbba5bc9955b8cad6936107697ef5ceac96891e7ae2c15b0811ae2d7ead89f0e78fd4a0248aea36cfd6885a43294_1280.jpg')",
        backdropFilter: "blur(4px)"
      }}>
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <div className="relative w-full h-full flex p-8 z-10">
        {/* Left Side - Player Info */}
        <div className="w-1/4 bg-gray-900/90 rounded-lg p-4 mr-4">
          <h2 className="text-2xl text-amber-400 mb-4">Your Profile</h2>
          <p className="text-white mb-2">Player: {playerName || "Player"}</p>
          <div className="mt-4">
            <h3 className="text-lg text-amber-400 mb-2">Selected Race:</h3>
            {playerRace && (
              <Badge className="bg-amber-600 text-lg">{playerRace}</Badge>
            )}
          </div>
        </div>

        {/* Center - Race Carousel */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <Carousel 
              className="w-96"
              setApi={setApi}
            >
              <CarouselContent>
                {races.map((race) => (
                  <CarouselItem key={race}>
                    <div className={`
                      p-6 rounded-lg text-center
                      ${playerRace === race ? 'bg-amber-600/20' : 'bg-gray-800/40'}
                    `}>
                      <h3 className="text-2xl font-bold text-white capitalize mb-4">{race}</h3>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex flex-col items-center">
                          <Shield className="h-8 w-8 text-blue-400 mb-2" />
                          <span className="text-white">{racesData[race].defense}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Swords className="h-8 w-8 text-red-400 mb-2" />
                          <span className="text-white">{racesData[race].offense}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Zap className="h-8 w-8 text-yellow-400 mb-2" />
                          <span className="text-white">{racesData[race].economy}</span>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          {playerRace && (
            <div className="mt-8 bg-gray-900/90 p-6 rounded-lg max-w-2xl">
              <p className="text-white text-lg mb-4">{racesData[playerRace].description}</p>
              <p className="text-amber-400"><strong>Specialty:</strong> {racesData[playerRace].specialty}</p>

              <Button
                onClick={handleReadyClick}
                disabled={isReady}
                className={`
                  mt-6 w-full font-bold 
                  ${isReady ? 'bg-gray-700' : 'bg-amber-600 hover:bg-amber-700'}
                `}
              >
                {isReady ? "Waiting for opponent..." : "Ready"}
              </Button>
            </div>
          )}
        </div>

        {/* Right Side - Opponent Info */}
        <div className="w-1/4 bg-gray-900/90 rounded-lg p-4 ml-4">
          <h2 className="text-2xl text-amber-400 mb-4">Opponent</h2>
          <p className="text-white mb-2">Player: {opponentName || "Waiting..."}</p>
          <div className="mt-4">
            <h3 className="text-lg text-amber-400 mb-2">Selected Race:</h3>
            {enemyRace ? (
              <Badge className="bg-amber-600 text-lg">{enemyRace}</Badge>
            ) : (
              <span className="text-gray-400">Not selected</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}