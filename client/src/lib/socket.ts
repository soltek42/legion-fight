import { io, Socket } from 'socket.io-client';
import { GamePhaseType, Race, BuildingType, GameStateResponse } from '@shared/types';

interface ServerToClientEvents {
  gameState: (state: GameStateResponse) => void;
  gamePhaseChange: (phase: GamePhaseType) => void;
  playerJoined: (playerId: string) => void;
  playerLeft: (playerId: string) => void;
  error: (message: string) => void;
  queueSize: (data: { count: number }) => void;
  enterQueue: (data: { queueSize: number }) => void;
}

interface ClientToServerEvents {
  joinGame: (playerName: string, callback: (success: boolean, gameId?: string) => void) => void;
  leaveGame: (gameId: string) => void;
  selectRace: (race: Race) => void;
  placeBuilding: (buildingType: string, position: [number, number, number]) => void;
  startCombatPhase: () => void;
}

// Create a singleton socket instance
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const connectSocket = () => {
  if (!socket) {
    // Connect to the server on the same host and port as the client
    socket = io({
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('Connected to server with ID:', socket?.id);
    });

    socket.on('joinRoom', (room) => {
      console.log('Joined room:', room);
    });

    socket.on('leaveRoom', (room) => {
      console.log('Left room:', room);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Game-specific socket methods
export const joinGame = (playerName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const socketInstance = connectSocket();
    socketInstance.emit('joinGame', playerName, (success, gameId) => {
      if (success && gameId) {
        resolve(gameId);
      } else {
        reject(new Error('Failed to join game'));
      }
    });
  });
};

export const leaveGame = (gameId: string) => {
  const socketInstance = connectSocket();
  socketInstance.emit('leaveGame', gameId);
};

export const declineGame = (gameId: string) => {
  const socketInstance = connectSocket();
  socketInstance.emit('declineGame', gameId);
};

export const selectRace = (race: Race) => {
  const socketInstance = connectSocket();
  socketInstance.emit('selectRace', race);
};

export const placeBuilding = (buildingType: BuildingType, position: [number, number, number]) => {
  const socketInstance = connectSocket();
  socketInstance.emit('placeBuilding', buildingType, position);
};

export const startCombatPhase = () => {
  const socketInstance = connectSocket();
  socketInstance.emit('startCombatPhase');
};

// Add socket event listeners
export const onGameState = (callback: (state: GameStateResponse) => void) => {
  const socketInstance = connectSocket();
  socketInstance.on('gameState', callback);
  return () => socketInstance.off('gameState', callback);
};

export const onGamePhaseChange = (callback: (phase: GamePhaseType) => void) => {
  const socketInstance = connectSocket();
  socketInstance.on('gamePhaseChange', callback);
  return () => socketInstance.off('gamePhaseChange', callback);
};

export const onPlayerJoined = (callback: (playerId: string) => void) => {
  const socketInstance = connectSocket();
  socketInstance.on('playerJoined', callback);
  return () => socketInstance.off('playerJoined', callback);
};

export const onPlayerLeft = (callback: (playerId: string) => void) => {
  const socketInstance = connectSocket();
  socketInstance.on('playerLeft', callback);
  return () => socketInstance.off('playerLeft', callback);
};

export const onError = (callback: (message: string) => void) => {
  const socketInstance = connectSocket();
  socketInstance.on('error', callback);
  return () => socketInstance.off('error', callback);
};