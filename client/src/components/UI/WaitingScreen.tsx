
import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { connectSocket } from '../../lib/socket';

interface WaitingScreenProps {
  onCancel: () => void;
}

export default function WaitingScreen({ onCancel }: WaitingScreenProps) {
  const [queueSize, setQueueSize] = useState(1);
  
  useEffect(() => {
    const socket = connectSocket();
    
    const handleWaitingRoomSize = (data: { count: number }) => {
      setQueueSize(data.count);
    };
    
    socket.on('waitingRoomSize', handleWaitingRoomSize);
    
    return () => {
      socket.off('queueSize', handleQueueSize);
      socket.off('enterQueue', handleEnterQueue);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white p-4">
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
    </div>
  );
}
