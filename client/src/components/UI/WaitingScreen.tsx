
import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { connectSocket, declineGame } from '../../lib/socket';

interface WaitingScreenProps {
  onCancel: () => void;
}

export default function WaitingScreen({ onCancel }: WaitingScreenProps) {
  const [queueSize, setQueueSize] = useState(1);
  const [invitationGameId, setInvitationGameId] = useState<string | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  const handleAccept = () => {
    const socket = connectSocket();
    socket.emit("acceptGame");
    setInvitationGameId(null);
  };
  
  const handleDecline = () => {
    if (invitationGameId) {
      declineGame(invitationGameId);
      setInvitationGameId(null);
      setShowCountdown(false);
      onCancel();
      
      // Clean up socket state
      const socket = connectSocket();
      socket.off('gameState');
      socket.off('gamePhaseChange');
      socket.off('playerJoined');
      socket.off('playerLeft');
    }
  };
  
  useEffect(() => {
    const socket = connectSocket();
    
    const handleWaitingRoomSize = (data: { count: number }) => {
      setQueueSize(data.count);
    };

    const resetState = () => {
      setInvitationGameId(null);
      setShowCountdown(false);
      onCancel();
    };
    
    socket.on('waitingRoomSize', handleWaitingRoomSize);
    socket.on('gameInvitation', ({ gameId }) => {
      console.log('Game invitation received:', gameId);
      setInvitationGameId(gameId);
    });

    socket.on('gameDeclined', () => {
      resetState();
      const socket = connectSocket();
      socket.emit("leaveWaitingRoom");
    });
    socket.on('opponentDeclined', () => {
      setInvitationGameId(null);
      setShowCountdown(false);
      // Return to waiting state
      socket.emit("joinWaitingRoom");
    });

    socket.on('opponentDisconnected', resetState);

    socket.on('gameAccepted', () => {
      console.log('Game accepted by both players');
    });

    socket.on('startCountdown', () => {
      console.log('Starting countdown');
      setShowCountdown(true);
      let count = 3;
      setCountdown(count);
      
      const timer = setInterval(() => {
        count--;
        setCountdown(count);
        if (count === 0) {
          clearInterval(timer);
          onCancel(); // Clear waiting screen after countdown
        }
      }, 1000);
      
      return () => clearInterval(timer);
    });
    
    return () => {
      socket.off('waitingRoomSize', handleWaitingRoomSize);
      socket.off('matchFound');
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white p-4">
      {showCountdown ? (
        <div className="text-6xl font-bold animate-pulse">
          {countdown}
        </div>
      ) : invitationGameId ? (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Opponent Found!</h2>
          <p className="mb-4">Game Room: {invitationGameId}</p>
          <div className="flex gap-4">
            <Button 
              onClick={handleAccept}
              variant="default" 
              className="bg-green-600 hover:bg-green-700"
            >
              Accept
            </Button>
            <Button 
              onClick={handleDecline}
              variant="outline" 
              className="border-red-600 text-red-400 hover:bg-red-900/50"
            >
              Decline
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-bold mb-4">Waiting for an opponent...</h2>
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
          <p className="text-lg max-w-md text-center mb-2">
            Looking for an opponent to join your game. This may take a moment.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Players in queue: {queueSize}
          </p>
          <Button 
            onClick={onCancel}
            variant="outline" 
            className="border-red-600 text-red-400 hover:bg-red-900/50"
          >
            Cancel
          </Button>
        </>
      )}
    </div>
  );
}
