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
  private matchmakingQueue: { id: string; timestamp: number }[] = [];

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

  private static WAITING_ROOM = 'global_waiting_room';
private waitingPlayers: string[] = [];

private setupSocketHandlers(): void {
    this.io.on("connection", (socket) => {
      console.log(`Player connected: ${socket.id}`);
      
      // Handle joining waiting room
      socket.on("joinWaitingRoom", () => {
        socket.join(GameServer.WAITING_ROOM);
        
        // Only add if not already in waiting players
        if (!this.waitingPlayers.includes(socket.id)) {
          this.waitingPlayers.push(socket.id);
          console.log(`Player ${socket.id} joined waiting room: ${GameServer.WAITING_ROOM}`);
        }
        
        // Broadcast updated queue size
        this.io.to(GameServer.WAITING_ROOM).emit("waitingRoomSize", { count: this.waitingPlayers.length });
        
        // If we have 2 or more players, create a game with the first two
        if (this.waitingPlayers.length >= 2) {
          const player1 = this.waitingPlayers.shift()!;
          const player2 = this.waitingPlayers.shift()!;
          
          console.log(`Creating game for players ${player1} and ${player2}`);
          
          // Create new game
          const gameId = `game_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          const game = new GameState(gameId);
          
          // Add players
          game.addPlayer(new Player(player1, "Player"));
          game.addPlayer(new Player(player2, "Player"));
          game.phase = "race_selection";
          
          this.games.set(gameId, game);
          
          // Remove players from waiting room
          const socket1 = this.io.sockets.sockets.get(player1);
          const socket2 = this.io.sockets.sockets.get(player2);
          
          if (socket1 && socket2) {
            socket1.leave(GameServer.WAITING_ROOM);
            socket2.leave(GameServer.WAITING_ROOM);
            
            // Add players to game room
            socket1.join(gameId);
            socket2.join(gameId);
            
            console.log(`Players joined game room: ${gameId}`);
            
            // Map players to game
            this.playerGameMap.set(player1, gameId);
            this.playerGameMap.set(player2, gameId);
            
            // Notify each player individually first
            socket1.emit("matchFound", { gameId });
            socket2.emit("matchFound", { gameId });
            
            // Then notify the game room
            this.io.to(gameId).emit("gameJoined", gameId);
            this.broadcastGameState(gameId);
            this.io.to(gameId).emit("gamePhaseChange", "race_selection");
            
            // Update waiting room count
            this.io.to(GameServer.WAITING_ROOM).emit("waitingRoomSize", { count: this.waitingPlayers.length });
          }
        }
      });

      socket.on("joinGame", (playerName, callback) => {
        try {
          let gameId: string;
          let waitingGame: GameState | undefined;

          // Check if there's a game waiting for players
          for (const [id, game] of this.games.entries()) {
            if (game.getPhase() === "waiting" && game.getPlayerCount() === 1) {
              waitingGame = game;
              gameId = id;
              break;
            }
          }

          if (waitingGame) {
            // Join the existing game
            gameId = waitingGame.gameId;
            const player = new Player(socket.id, playerName);
            waitingGame.addPlayer(player);

            // Now that we have 2 players, proceed to race selection
            waitingGame.phase = "race_selection";

            // Set up socket room for the joining player
            socket.join(gameId);

            // Map player to game
            this.playerGameMap.set(socket.id, gameId);

            console.log(`Player ${playerName} (${socket.id}) joined existing game ${gameId}`);

            // Add 1 second delay so that both clients have time to connect to the game
            setTimeout(() => {
              // Broadcast the game state first so both clients have the needed data
              this.broadcastGameState(gameId);

              // Then broadcast the phase change to all players in the game
              this.io.to(gameId).emit("gamePhaseChange", "race_selection");
            }, 1000)
          } else {
            // Create a new game if no waiting games are available
            gameId = this.createNewGame(socket.id, playerName);

            // Join socket room
            socket.join(gameId);

            // Map player to game
            this.playerGameMap.set(socket.id, gameId);

            console.log(`Player ${playerName} (${socket.id}) created new game ${gameId}`);
          }

          // Broadcast updated game state
          this.broadcastGameState(gameId);

          // Notify the player
          callback(true, gameId);
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
        if (!game || game.phase !== "race_selection") return;

        // Update player race
        game.setPlayerRace(socket.id, race);

        // Check if all players have selected races
        let allPlayersSelected = true;
        game.players.forEach(player => {
          if (!player.race) allPlayersSelected = false;
        });

        if (allPlayersSelected) {
          // Transition to building phase
          game.startBuildingPhase();
          this.io.to(gameId).emit("gamePhaseChange", "building");
        }

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

      socket.on("createGame", ({ mode }) => {
        if (mode === "ai") {
          // Create a new game with AI opponent
          const gameId = `game_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          const player = new Player(socket.id, "Player");
  
          // Create game state and add human + AI players
          const game = new GameState(gameId);
          game.addPlayer(player);
          game.addAIPlayer();
          game.phase = "race_selection";
  
          this.games.set(gameId, game);
  
          console.log(`Player ${player.name} (${socket.id}) created new AI game ${gameId}`);
  
          socket.join(gameId);
          socket.emit("gameJoined", gameId);
          this.broadcastGameState(gameId);
        } else {
          // Add player to matchmaking queue
          const queuedPlayer = this.matchmakingQueue.find(p => p.id !== socket.id);
  
          if (queuedPlayer) {
            // Match found - create game with queued player
            const gameId = `game_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const player1 = new Player(queuedPlayer.id, "Player");
            const player2 = new Player(socket.id, "Player");
  
            const game = new GameState(gameId);
            game.addPlayer(player1);
            game.addPlayer(player2);
            game.phase = "race_selection";
  
            this.games.set(gameId, game);
            
            // Map players to game
            this.playerGameMap.set(queuedPlayer.id, gameId);
            this.playerGameMap.set(socket.id, gameId);
  
            // Remove matched player from queue
            this.matchmakingQueue = this.matchmakingQueue.filter(p => p.id !== queuedPlayer.id);
  
            // Join both players to game room and notify them
            this.io.to(queuedPlayer.id).join(gameId);
            socket.join(gameId);
            
            this.io.to(gameId).emit("gameJoined", gameId);
            this.broadcastGameState(gameId);
            
            // Notify phase change
            this.io.to(gameId).emit("gamePhaseChange", "race_selection");
          } else {
            // Add to matchmaking queue if not already in it
            if (!this.matchmakingQueue.find(p => p.id === socket.id)) {
              this.matchmakingQueue.push({ id: socket.id, timestamp: Date.now() });
              
              // Broadcast updated queue size to all connected clients
              this.io.emit("queueSize", { count: this.matchmakingQueue.length });
              socket.emit("enterQueue", { queueSize: this.matchmakingQueue.length });
            }
          }
        }
      });

      socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
        // Remove from waiting players
        this.waitingPlayers = this.waitingPlayers.filter(id => id !== socket.id);
        // Broadcast updated waiting room size
        this.io.to(GameServer.WAITING_ROOM).emit("waitingRoomSize", { count: this.waitingPlayers.length });
        // Clean up any game this player was in
        const gameId = this.playerGameMap.get(socket.id);
        if (gameId) {
          this.handlePlayerLeave(socket.id, gameId);
        }
      });

      // Handle queue size requests
      socket.on("requestQueueSize", () => {
        socket.emit("queueSize", { count: this.matchmakingQueue.length });
      });
    });
  }

  private createNewGame(playerId: string, playerName: string): string {
    const gameId = `game_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const player = new Player(playerId, playerName);

    // Create a new game state
    const game = new GameState(gameId);
    game.addPlayer(player);

    // Set phase to waiting for a second player
    game.phase = "waiting";

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
      // If in race selection or building phase, return to waiting
      if (game.phase === "race_selection" || game.phase === "building") {
        game.phase = "waiting";

        // Notify remaining players about phase change
        this.io.to(gameId).emit("gamePhaseChange", "waiting");
        console.log(`Game ${gameId} returned to waiting state after player left`);
      }

      // Notify remaining players about the player leaving
      this.io.to(gameId).emit("playerLeft", playerId);

      // Broadcast updated game state
      this.broadcastGameState(gameId);
    }
  }

  private broadcastGameState(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    // Send the processed game state using getGameState() instead of the game object directly
    this.io.to(gameId).emit("gameState", game.getGameState());
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