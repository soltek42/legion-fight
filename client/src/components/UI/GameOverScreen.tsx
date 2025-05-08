import { useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/lib/stores/useGameState";
import { useAudio } from "@/lib/stores/useAudio";

export default function GameOverScreen() {
  const { playerWon, resetGame, playerRace, enemyRace } = useGameState();
  const { playSuccess } = useAudio();
  
  // Play success sound when player wins
  useEffect(() => {
    if (playerWon) {
      playSuccess();
    }
  }, [playerWon, playSuccess]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <Card className="w-full max-w-md mx-4 border-2 border-amber-600 bg-gray-900/90 text-white">
        <CardHeader className="text-center pb-2">
          <CardTitle className={`text-4xl font-bold ${playerWon ? 'text-amber-400' : 'text-red-500'}`}>
            {playerWon ? 'Victory!' : 'Defeat!'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div 
            className="w-full h-48 bg-cover bg-center rounded-lg border-2 border-gray-700" 
            style={{ 
              backgroundImage: playerWon 
                ? "url('https://pixabay.com/get/g6bd150fcad2261b5948f9dd279e1db1c91fa04e43b84092812215dd1b310d8271ffdf2566378c2367509409aaf86b104dacd605826163aa337606280a2c7774b_1280.jpg')" 
                : "url('https://pixabay.com/get/g02d87c044bf64c7a5b3d5214c20336286fe3fdc33520d49182d079ec91b299ac3ab69d9cff31def2e8f1faf24ed226954abaf7cbd93ee7889909306b42154adb_1280.jpg')"
            }}
          ></div>
          
          <p className="text-center text-lg">
            {playerWon 
              ? `Your ${playerRace} forces have destroyed the enemy ${enemyRace} castle!` 
              : `The enemy ${enemyRace} forces have destroyed your ${playerRace} castle!`}
          </p>
          
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="font-bold text-amber-400 mb-2">Battle Summary</h3>
            <ul className="space-y-1 text-sm">
              <li>• {playerWon ? 'You successfully defended your castle' : 'Your castle was destroyed'}</li>
              <li>• {playerWon ? 'Your strategic building placement paid off' : 'The enemy had better strategic building placement'}</li>
              <li>• {playerWon ? 'Your units proved stronger in combat' : 'Enemy units overpowered yours in combat'}</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center gap-4">
          <Button 
            onClick={resetGame} 
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Play Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Main Menu
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
