import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Vector3Tuple } from "three";
import { Race, BuildingType, UnitType } from "@shared/types";
import { GAME_CONFIG } from "../game/gameConfig";
import {
  updateUnitMovement,
  updateUnitCombat,
  updateBuilding,
  spawnUnit,
  isCastleInRange,
  isPlayerUnit,
  calculateIncome
} from "../game/gameLogic";
import { v4 as uuidv4 } from "uuid";
import { buildingsData } from "../game/buildingsData";
import {
  connectSocket,
  joinGame,
  leaveGame,
  onPlayerLeft,
  selectRace,
  placeBuilding as emitPlaceBuilding,
  startCombatPhase as emitStartCombatPhase,
  onGameState,
  onGamePhaseChange
} from "../socket";

// Define the types for our game state
interface Unit {
  id: string;
  type: UnitType;
  position: Vector3Tuple;
  health: number;
  maxHealth: number;
  damage: number;
  attackCooldown: number;
  attacking: boolean;
}

interface Building {
  id: string;
  type: BuildingType;
  position: Vector3Tuple;
  health: number;
  cooldown: number;
  maxCooldown: number;
}

type GamePhase = "menu" | "waiting" | "race_selection" | "building" | "combat" | "game_over";

interface GameState {
  // Game state
  gamePhase: GamePhase;
  playerRace: Race | null;
  enemyRace: Race | null;
  playerGold: number;
  playerIncome: number;
  timeUntilCombat: number;
  lastGameTick: number;
  playerWon: boolean;

  // Castles
  playerCastleHealth: number;
  enemyCastleHealth: number;

  // Units and buildings
  playerUnits: Unit[];
  enemyUnits: Unit[];
  playerBuildings: Building[];
  enemyBuildings: Building[];

  // Game phase actions
  startRaceSelection: () => void;
  startGame: (playerRace: Race, enemyRace: Race) => void;
  startCombatPhase: () => void;
  resetGame: () => void;

  // Game mechanics
  updateGameState: (delta: number) => void;
  addPlayerBuilding: (type: BuildingType, position: Vector3Tuple) => void;
  addEnemyBuilding: (type: BuildingType, position: Vector3Tuple) => void;
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial game state
    gamePhase: "menu",
    playerRace: null,
    enemyRace: null,
    playerGold: GAME_CONFIG.STARTING_GOLD,
    playerIncome: GAME_CONFIG.BASE_INCOME,
    timeUntilCombat: GAME_CONFIG.BUILDING_PHASE_DURATION,
    lastGameTick: Date.now(),
    playerWon: false,

    // Castle health
    playerCastleHealth: GAME_CONFIG.CASTLE_MAX_HEALTH,
    enemyCastleHealth: GAME_CONFIG.CASTLE_MAX_HEALTH,

    // Units and buildings
    playerUnits: [],
    enemyUnits: [],
    playerBuildings: [],
    enemyBuildings: [],

    // Phase transitions
    startRaceSelection: () => {
      // Connect to the socket server when race selection starts
      const socket = connectSocket();
      socket.emit("createGame", { mode: "ai" });

      // Join game with a default player name
      joinGame("Player")
        .then(gameId => {
          console.log("Joined game with ID:", gameId);
          console.log("Current socket room:", gameId);
          
          // Setup socket event listeners
          onGameState((gameState) => {
            // Update local state with server state
            if (gameState.phase === "race_selection" || gameState.phase === "building" || 
                gameState.phase === "combat" || gameState.phase === "game_over") {
              
              const players = Array.from(gameState.players);
              
              // Find current player and opponent
              const currentPlayer = players.find(p => p.id === socket.id);
              const otherPlayer = players.find(p => p.id !== socket.id);
              
              if (currentPlayer && otherPlayer) {
                set({
                  gamePhase: gameState.phase as GamePhase,
                  playerRace: currentPlayer.race,
                  enemyRace: otherPlayer.race,
                  playerGold: currentPlayer.gold,
                  playerIncome: currentPlayer.income,
                  playerCastleHealth: currentPlayer.castleHealth,
                  enemyCastleHealth: otherPlayer.castleHealth,
                  timeUntilCombat: gameState.timeUntilCombat,
                  playerBuildings: currentPlayer.buildings || [],
                  enemyBuildings: otherPlayer.buildings || [],
                  playerUnits: currentPlayer.units || [],
                  enemyUnits: otherPlayer.units || [],
                  playerWon: gameState.winner === currentPlayer.id,
                  playerBuildings: currentPlayer.buildings || [],
                  enemyBuildings: otherPlayer.buildings || [],
                });
              }
            }
          });
          
          const unsubscribePhaseChange = onGamePhaseChange((phase) => {
            console.log("Game phase changed to:", phase);
            
            // When moving to race_selection, make sure we're showing the proper screen
            if (phase === "race_selection" && get().gamePhase === "waiting") {
              console.log("Transitioning from waiting to race selection");
            }
            
            // When returning to waiting, reset player selections
            if (phase === "waiting" && (get().gamePhase === "race_selection" || get().gamePhase === "building")) {
              console.log("Player left - returning to waiting screen");
              set({
                enemyRace: null,
                enemyReady: false
              });
            }
            
            // Update the game phase
            set({ gamePhase: phase as GamePhase });
          });
          
          // Subscribe to player left events
          const unsubscribePlayerLeft = onPlayerLeft((playerId) => {
            console.log("Player left:", playerId);
            // The server handles phase changes, this is just for logging
          });
          
          // Store unsubscribe functions for cleanup
          // In a real app, you would clean these up when the component unmounts
        })
        .catch(err => {
          console.error("Failed to join game:", err);
        });
      
      set({ gamePhase: "waiting" }); // First go to waiting phase
    },

    startGame: (playerRace: Race, enemyRace: Race) => {
      // Set local state
      set({
        gamePhase: "building",
        playerRace,
        enemyRace,
        playerGold: GAME_CONFIG.STARTING_GOLD,
        playerIncome: GAME_CONFIG.BASE_INCOME,
        timeUntilCombat: GAME_CONFIG.BUILDING_PHASE_DURATION,
        lastGameTick: Date.now(),
        playerCastleHealth: GAME_CONFIG.CASTLE_MAX_HEALTH,
        enemyCastleHealth: GAME_CONFIG.CASTLE_MAX_HEALTH,
        playerUnits: [],
        enemyUnits: [],
        playerBuildings: [],
        enemyBuildings: []
      });

      // Send race selection to server
      selectRace(playerRace);

      // Add some basic buildings for the enemy (now happens on the server)
      setTimeout(() => {
        const state = get();
        if (state.enemyRace === "human") {
          state.addEnemyBuilding("human_barracks", [6, 0.5, 2]);
          state.addEnemyBuilding("human_archery", [8, 0.5, -2]);
        } else if (state.enemyRace === "undead") {
          state.addEnemyBuilding("undead_crypt", [6, 0.5, 2]);
          state.addEnemyBuilding("undead_graveyard", [8, 0.5, -2]);
        } else if (state.enemyRace === "nature") {
          state.addEnemyBuilding("nature_grove", [6, 0.5, 2]);
          state.addEnemyBuilding("nature_den", [8, 0.5, -2]);
        } else if (state.enemyRace === "fire") {
          state.addEnemyBuilding("fire_forge", [6, 0.5, 2]);
          state.addEnemyBuilding("fire_altar", [8, 0.5, -2]);
        }
      }, 1000);
    },

    startCombatPhase: () => {
      // Tell the server to start combat phase
      emitStartCombatPhase();

      // Local state will be updated when server confirms phase change
      set({ gamePhase: "combat" });
    },

    resetGame: () => {
      // Clean up socket connection
      leaveGame(localStorage.getItem('gameId') || '');

      set({
        gamePhase: "menu",
        playerRace: null,
        enemyRace: null,
        playerGold: GAME_CONFIG.STARTING_GOLD,
        playerIncome: GAME_CONFIG.BASE_INCOME,
        timeUntilCombat: GAME_CONFIG.BUILDING_PHASE_DURATION,
        lastGameTick: Date.now(),
        playerWon: false,
        playerCastleHealth: GAME_CONFIG.CASTLE_MAX_HEALTH,
        enemyCastleHealth: GAME_CONFIG.CASTLE_MAX_HEALTH,
        playerUnits: [],
        enemyUnits: [],
        playerBuildings: [],
        enemyBuildings: []
      });
    },

    // Game update loop
    updateGameState: (delta: number) => {
      const state = get();
      const now = Date.now();

      // Update state based on game phase
      if (state.gamePhase === "building" || state.gamePhase === "combat") {
        // Generate income
        if (now - state.lastGameTick >= 1000) { // Every second
          const goldToAdd = state.playerIncome;
          set({
            playerGold: state.playerGold + goldToAdd,
            lastGameTick: now,
            timeUntilCombat: state.timeUntilCombat > 0 && state.gamePhase === "building"
              ? state.timeUntilCombat - 1
              : 0
          });

          // If building phase timer runs out, transition to combat
          if (state.timeUntilCombat <= 0 && state.gamePhase === "building") {
            set({ gamePhase: "combat" });
          }
        }

        if (state.gamePhase === "combat") {
          // Process unit movements and combat
          const newPlayerUnits = [...state.playerUnits];
          const newEnemyUnits = [...state.enemyUnits];
          const defeatedPlayerUnits: string[] = [];
          const defeatedEnemyUnits: string[] = [];

          // Update player units
          for (const unit of newPlayerUnits) {
            // Move towards enemy castle
            updateUnitMovement(unit, [12, 1, 0], delta);

            // Attack enemy units if in range
            const defeatedEnemy = updateUnitCombat(unit, newEnemyUnits, delta);
            if (defeatedEnemy) {
              defeatedEnemyUnits.push(defeatedEnemy.id);
            }

            // Attack enemy castle if in range
            if (isCastleInRange([12, 1, 0], unit) && unit.attackCooldown <= 0) {
              unit.attacking = true;
              unit.attackCooldown = GAME_CONFIG.ATTACK_COOLDOWN;
              set({ enemyCastleHealth: Math.max(0, state.enemyCastleHealth - unit.damage) });
            }
          }

          // Update enemy units
          for (const unit of newEnemyUnits) {
            // Move towards player castle
            updateUnitMovement(unit, [-12, 1, 0], delta);

            // Attack player units if in range
            const defeatedPlayer = updateUnitCombat(unit, newPlayerUnits, delta);
            if (defeatedPlayer) {
              defeatedPlayerUnits.push(defeatedPlayer.id);
            }

            // Attack player castle if in range
            if (isCastleInRange([-12, 1, 0], unit) && unit.attackCooldown <= 0) {
              unit.attacking = true;
              unit.attackCooldown = GAME_CONFIG.ATTACK_COOLDOWN;
              set({ playerCastleHealth: Math.max(0, state.playerCastleHealth - unit.damage) });
            }
          }

          // Remove defeated units
          const updatedPlayerUnits = newPlayerUnits.filter(unit => !defeatedPlayerUnits.includes(unit.id));
          const updatedEnemyUnits = newEnemyUnits.filter(unit => !defeatedEnemyUnits.includes(unit.id));

          set({
            playerUnits: updatedPlayerUnits,
            enemyUnits: updatedEnemyUnits
          });

          // Check win/loss conditions
          if (state.playerCastleHealth <= 0) {
            set({
              gamePhase: "game_over",
              playerWon: false
            });
          } else if (state.enemyCastleHealth <= 0) {
            set({
              gamePhase: "game_over",
              playerWon: true
            });
          }
        }

        // Update buildings (spawn units)
        const newPlayerBuildings = [...state.playerBuildings];
        const newEnemyBuildings = [...state.enemyBuildings];

        // Update player buildings
        for (let i = 0; i < newPlayerBuildings.length; i++) {
          const building = newPlayerBuildings[i];
          const shouldSpawn = updateBuilding(building, delta);

          if (shouldSpawn && state.gamePhase === "combat") {
            const newUnit = spawnUnit(building, true);
            if (newUnit) {
              set({ playerUnits: [...state.playerUnits, newUnit] });
            }
          }
        }

        // Update enemy buildings
        for (let i = 0; i < newEnemyBuildings.length; i++) {
          const building = newEnemyBuildings[i];
          const shouldSpawn = updateBuilding(building, delta);

          if (shouldSpawn && state.gamePhase === "combat") {
            const newUnit = spawnUnit(building, false);
            if (newUnit) {
              set({ enemyUnits: [...state.enemyUnits, newUnit] });
            }
          }
        }

        // Update building states
        set({
          playerBuildings: newPlayerBuildings,
          enemyBuildings: newEnemyBuildings,
          // Update income based on buildings
          playerIncome: calculateIncome(newPlayerBuildings, state.playerRace || "human")
        });
      }
    },

    // Add new buildings
    addPlayerBuilding: (type: BuildingType, position: Vector3Tuple) => {
      const state = get();
      const buildingData = buildingsData[type];

      // Check if player has enough gold
      if (state.playerGold < buildingData.cost) return;

      // Create new building locally (will be updated from server when it confirms)
      const newBuilding: Building = {
        id: uuidv4(),
        type,
        position,
        health: buildingData.health,
        cooldown: buildingData.cooldown,
        maxCooldown: buildingData.cooldown
      };

      // Deduct cost and add building
      set({
        playerGold: state.playerGold - buildingData.cost,
        playerBuildings: [...state.playerBuildings, newBuilding]
      });

      // Send building placement to server
      emitPlaceBuilding(type, position);
    },

    addEnemyBuilding: (type: BuildingType, position: Vector3Tuple) => {
      const state = get();
      const buildingData = buildingsData[type];

      // Create new building
      const newBuilding: Building = {
        id: uuidv4(),
        type,
        position,
        health: buildingData.health,
        cooldown: buildingData.cooldown,
        maxCooldown: buildingData.cooldown
      };

      // Add building
      set({
        enemyBuildings: [...state.enemyBuildings, newBuilding]
      });
    }
  }))
);
