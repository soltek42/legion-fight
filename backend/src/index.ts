import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameState } from './models/GameState';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Game state management
const gameStates = new Map<string, GameState>();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Create new game state for the player
  const gameState = new GameState();
  gameStates.set(socket.id, gameState);

  // Send initial game state
  socket.emit('gameState', gameState.getState());

  // Handle player actions
  socket.on('placeUnit', (data) => {
    const state = gameStates.get(socket.id);
    if (state) {
      state.placeUnit(data.lane, data.unitType);
      socket.emit('gameState', state.getState());
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    gameStates.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 