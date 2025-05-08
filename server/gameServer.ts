import { Server } from "socket.io";
import * as http from "http";
import { GameState } from "./game/GameState";
import { Player } from "./game/Player";
import { Race, GamePhaseType } from "@shared/types";

interface ServerToClientEvents {
  gameState: (state: GameState) => void;
  gamePhaseChange: (phase: GamePhaseType) => void;
  playerJoined: (playerId: string) => void;
  playerLeft: (playerId: string) => void;
  error: (message: string) => void;
}

interface ClientToServerEvents {
  joinGame: (playerName: string, callback: (success: boolean, gameId?: string) => void) => void;
  leaveGame: (gameId: string) => void;
  selectRace: (race: Race) => void;
  placeBuilding: (buildingType: string, position: [number, number, number]) => void;
  startCombatPhase: () => void;
}

export class GameServer {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;
  private games: Map<string, GameState> = new Map();
  private playerGameMap: Map<string, string> = new Map();
  
  constructor(httpServer: http.Server) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.setupSocketHandlers();
    this.startGameLoop();
  }
  
  private setupSocketHandlers(): void {
    this.io.on("connection", (socket) => {
      console.log(`Player connected: ${socket.id}`);
      
      socket.on("joinGame", (playerName, callback) => {
        try {
          // For now, we'll just create a new game for each player (1v1 vs AI)
          const gameId = this.createNewGame(socket.id, playerName);
          this.playerGameMap.set(socket.id, gameId);
          
          // Join the socket room for this game
          socket.join(gameId);
          
          // Notify the player
          callback(true, gameId);
          
          console.log(`Player ${playerName} (${socket.id}) joined game ${gameId}`);
        } catch (error) {
          console.error("Error joining game:", error);
          callback(false);
        }
      });
      
      socket.on("leaveGame", (gameId) => {
        this.handlePlayerLeave(socket.id, gameId);
      });
      
      socket.on("selectRace", (race) => {
        const gameId = this.playerGameMap.get(socket.id);
        if (!gameId) return;
        
        const game = this.games.get(gameId);
        if (!game) return;
        
        // Update player race
        game.setPlayerRace(socket.id, race);
        
        // Broadcast updated game state
        this.broadcastGameState(gameId);
      });
      
      socket.on("placeBuilding", (buildingType, position) => {
        const gameId = this.playerGameMap.get(socket.id);
        if (!gameId) return;
        
        const game = this.games.get(gameId);
        if (!game) return;
        
        // Place building
        game.placeBuilding(socket.id, buildingType, position);
        
        // Broadcast updated game state
        this.broadcastGameState(gameId);
      });
      
      socket.on("startCombatPhase", () => {
        const gameId = this.playerGameMap.get(socket.id);
        if (!gameId) return;
        
        const game = this.games.get(gameId);
        if (!game) return;
        
        // Transition to combat phase
        game.startCombatPhase();
        
        // Broadcast game phase change and updated state
        this.io.to(gameId).emit("gamePhaseChange", "combat");
        this.broadcastGameState(gameId);
      });
      
      socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
        const gameId = this.playerGameMap.get(socket.id);
        if (gameId) {
          this.handlePlayerLeave(socket.id, gameId);
        }
      });
    });
  }
  
  private createNewGame(playerId: string, playerName: string): string {
    const gameId = `game_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const player = new Player(playerId, playerName);
    
    // Create a new game state
    const game = new GameState(gameId);
    game.addPlayer(player);
    
    // Add AI opponent (simplified for now)
    game.addAIPlayer();
    
    // Store the game
    this.games.set(gameId, game);
    
    return gameId;
  }
  
  private handlePlayerLeave(playerId: string, gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;
    
    // Remove player from game
    game.removePlayer(playerId);
    
    // Clean up player map
    this.playerGameMap.delete(playerId);
    
    // If game is empty, remove it
    if (game.getPlayerCount() === 0) {
      this.games.delete(gameId);
    } else {
      // Otherwise notify remaining players
      this.io.to(gameId).emit("playerLeft", playerId);
    }
  }
  
  private broadcastGameState(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;
    
    this.io.to(gameId).emit("gameState", game);
  }
  
  private startGameLoop(): void {
    // Update games at a fixed interval (e.g., 30 times per second)
    const UPDATE_INTERVAL = 1000 / 30; // ~33ms
    
    setInterval(() => {
      const now = Date.now();
      
      // Update each active game
      for (const [gameId, game] of this.games.entries()) {
        if (game.getPhase() === "combat") {
          // Only update during combat phase
          game.update(UPDATE_INTERVAL / 1000); // Convert to seconds
          
          // Broadcast updated state
          this.broadcastGameState(gameId);
          
          // Check if game is over
          if (game.isGameOver()) {
            this.io.to(gameId).emit("gamePhaseChange", "game_over");
          }
        }
      }
    }, UPDATE_INTERVAL);
  }
}
