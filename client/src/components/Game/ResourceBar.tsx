import { useState, useEffect } from 'react';
import { useGameState } from '@/lib/stores/useGameState';
import { Coins, Shield, Clock, Heart } from 'lucide-react';
import { Progress } from '@/components/UI/progress';
import { Button } from '@/components/UI/button';
import { useAudio } from '@/lib/stores/useAudio';

export default function ResourceBar() {
  const { 
    playerGold, 
    playerIncome, 
    gamePhase, 
    timeUntilCombat, 
    playerCastleHealth, 
    enemyCastleHealth,
    playerRace,
    enemyRace,
    startCombatPhase,
    playerUnits
  } = useGameState();
  
  const { toggleMute, isMuted } = useAudio();
  const [remainingTime, setRemainingTime] = useState(timeUntilCombat);
  
  // Update the timer display
  useEffect(() => {
    if (gamePhase !== 'building') return;
    
    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gamePhase]);
  
  // Reset the timer when timeUntilCombat changes
  useEffect(() => {
    setRemainingTime(timeUntilCombat);
  }, [timeUntilCombat]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playerHealthPercent = (playerCastleHealth / 1000) * 100;
  const enemyHealthPercent = (enemyCastleHealth / 1000) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-10 p-4 bg-gray-900/80 border-b-2 border-amber-600">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6 w-full md:w-auto">
          {/* Phase indicator */}
          <div className="bg-amber-700 px-3 py-1 rounded-md text-white font-bold">
            {gamePhase === 'building' ? 'Building Phase' : 'Combat Phase'}
          </div>
          
          {/* Gold display */}
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Coins className="w-5 h-5 text-yellow-400 mr-1" />
              <span className="text-white font-medium">{playerGold}</span>
              <span className="text-gray-300 text-sm ml-1">(+{playerIncome}/s)</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-blue-400 mr-1" />
              <span className="text-white font-medium">{playerUnits.length}</span>
              <span className="text-gray-300 text-sm ml-1">units</span>
            </div>
          </div>
        </div>
        
        {/* Castle health bars */}
        <div className="flex flex-col w-full md:w-1/2 gap-2">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-blue-400 text-sm font-medium capitalize">{playerRace} Castle</span>
                <span className="text-blue-400 text-sm font-medium">{playerCastleHealth}/1000</span>
              </div>
              <Progress value={playerHealthPercent} className="h-2 bg-gray-700" indicatorClassName="bg-blue-500" />
            </div>
            <Heart className="w-5 h-5 text-blue-500" />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-red-400 text-sm font-medium capitalize">{enemyRace} Castle</span>
                <span className="text-red-400 text-sm font-medium">{enemyCastleHealth}/1000</span>
              </div>
              <Progress value={enemyHealthPercent} className="h-2 bg-gray-700" indicatorClassName="bg-red-500" />
            </div>
            <Heart className="w-5 h-5 text-red-500" />
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {gamePhase === 'building' && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-300" />
              <div className="text-white font-bold">
                {formatTime(remainingTime)}
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={startCombatPhase}
                className="bg-amber-700 hover:bg-amber-800 text-white"
              >
                Start Combat
              </Button>
            </div>
          )}
          
          {/* Sound toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMute}
            className="text-gray-300 hover:text-white"
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
