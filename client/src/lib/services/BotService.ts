import { Socket } from "socket.io-client";
import { Race, BuildingType } from "@shared/types";
import { GAME_CONFIG } from "../game/gameConfig";
import { buildingsData } from "../game/buildingsData";
import { Vector3Tuple } from "three";
import { EventEmitter } from "../utils/EventEmitter";

type GamePhase = "menu" | "waiting" | "race_selection" | "building" | "combat" | "game_over";

export class BotService extends EventEmitter {
  private socket: Socket;
  private race: Race | null = null;
  private gamePhase: GamePhase = "menu";
  private buildings: { type: BuildingType; position: Vector3Tuple }[] = [];
  private gold = GAME_CONFIG.STARTING_GOLD;
  private gameId: string | null = null;
  private joinAttempts = 0;
  private maxJoinAttempts = 3;

  constructor(socket: Socket) {
    super();
    this.socket = socket;
    
    // Set up initial state
    this.setupSocketHandlers();
    this.setupEventListeners();
  }

  private setupSocketHandlers() {
    // Emit connected event when socket connects
    this.socket.on("connect", () => {
      console.log("[BOT] Socket connected with ID:", this.socket.id);
      this.emit("connected", this.socket);
    });

    // Log socket disconnections
    this.socket.on("disconnect", () => {
      console.log("[BOT] Socket disconnected");
      this.emit("disconnected");
    });

    // Handle connection errors
    this.socket.on("connect_error", (error) => {
      console.error("[BOT] Connection error:", error);
      this.emit("error", error);
    });
  }

  private setupEventListeners() {
    // Listen for game state updates
    this.socket.on("gameState", (gameState) => {
      console.log("[BOT] Received game state:", gameState);
      
      // Try to join if not already in the game
      if (this.joinAttempts < this.maxJoinAttempts && 
          !gameState.players.some((p: any) => p.id === this.socket.id)) {
        this.joinAttempts++;
        console.log("[BOT] Attempting to join game, attempt", this.joinAttempts);
        this.socket.emit("joinGame", "AI Opponent", (success: boolean, gameId?: string) => {
          if (success && gameId) {
            console.log("[BOT] Successfully joined game:", gameId);
            this.gameId = gameId;
            
            // Mark as ready after joining
            setTimeout(() => {
              console.log("[BOT] Marking as ready");
              this.socket.emit("playerReady", true);
            }, 500);
          } else {
            console.log("[BOT] Failed to join game");
            // Retry joining after a short delay
            if (this.joinAttempts < this.maxJoinAttempts) {
              setTimeout(() => this.joinGame(), 1000);
            }
          }
        });
      }
      
      this.handleGameState(gameState);
    });

    // Listen for game phase changes
    this.socket.on("gamePhaseChange", (phase: GamePhase) => {
      console.log("[BOT] Game phase changed to:", phase);
      this.gamePhase = phase;
      this.handlePhaseChange(phase);
    });

    // Listen for game invitations
    this.socket.on("gameInvitation", ({ gameId }) => {
      console.log("[BOT] Received game invitation for game:", gameId);
      setTimeout(() => {
        console.log("[BOT] Accepting game invitation");
        this.socket.emit("acceptGame");
      }, 500);
    });
  }

  private handleGameState(gameState: any) {
    const botPlayer = gameState.players.find((p: any) => p.id === this.socket.id);
    if (!botPlayer) {
      console.log("[BOT] Could not find bot player in game state. Bot ID:", this.socket.id);
      console.log("[BOT] Available players:", gameState.players);
      return;
    }

    this.race = botPlayer.race;
    this.gold = botPlayer.gold ?? GAME_CONFIG.STARTING_GOLD;
    this.buildings = botPlayer.buildings || [];
  }

  private handlePhaseChange(phase: GamePhase) {
    switch (phase) {
      case "race_selection":
        this.handleRaceSelection();
        break;
      case "building":
        this.handleBuildingPhase();
        break;
      case "combat":
        // Bot doesn't need to do anything in combat phase as units auto-attack
        break;
    }
  }

  private handleRaceSelection() {
    // Bot randomly selects a race
    const races: Race[] = ["human", "undead", "nature", "fire"];
    const selectedRace = races[Math.floor(Math.random() * races.length)];
    
    console.log("[BOT] Selected race:", selectedRace);
    this.race = selectedRace;
    
    // Emit race selection
    this.socket.emit("selectRace", selectedRace);
    
    // Mark as ready immediately
    setTimeout(() => {
      console.log("[BOT] Marking as ready");
      this.socket.emit("playerReady", true);
    }, 500);
  }

  private handleBuildingPhase() {
    if (!this.race) return;

    // Get available building types for the selected race
    const availableBuildings = Object.entries(buildingsData)
      .filter(([key]) => key.startsWith(this.race as string))
      .map(([key]) => key as BuildingType);

    // Bot's building strategy
    const buildingStrategy = () => {
      if (this.buildings.length >= 4) return; // Maximum 4 buildings

      const randomBuilding = availableBuildings[Math.floor(Math.random() * availableBuildings.length)];
      const buildingCost = buildingsData[randomBuilding].cost;

      if (this.gold >= buildingCost) {
        // Place building in a semi-random position on bot's side
        const position: Vector3Tuple = [
          6 + Math.random() * 4, // x: 6-10
          0.5, // y: always 0.5
          -3 + Math.random() * 6 // z: -3 to 3
        ];

        console.log("[BOT] Placing building:", randomBuilding, "at position:", position);
        this.socket.emit("placeBuilding", randomBuilding, position);
        this.gold -= buildingCost;
        this.buildings.push({ type: randomBuilding, position });
      }
    };

    // Place buildings every few seconds
    const interval = setInterval(() => {
      if (this.gamePhase !== "building") {
        clearInterval(interval);
        return;
      }
      buildingStrategy();
    }, 2000);
  }

  // Public method to start the bot
  public start() {
    console.log("[BOT] Starting bot service");
    
    // Ensure socket is connected before proceeding
    if (!this.socket.connected) {
      console.log("[BOT] Socket not connected, waiting for connection...");
      this.socket.connect();
      
      // Wait for connection before proceeding
      this.socket.once("connect", () => {
        this.joinGame();
      });
    } else {
      this.joinGame();
    }
  }

  private joinGame() {
    console.log("[BOT] Attempting to join game as AI");
    this.socket.emit("joinGame", "AI Opponent", (success: boolean, gameId?: string) => {
      if (success && gameId) {
        console.log("[BOT] Successfully joined game:", gameId);
        this.gameId = gameId;
      } else {
        console.log("[BOT] Failed to join game");
        // Retry joining after a short delay
        if (this.joinAttempts < this.maxJoinAttempts) {
          setTimeout(() => this.joinGame(), 1000);
        }
      }
    });
  }
} 