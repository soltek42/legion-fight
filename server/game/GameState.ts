import { Vector3Tuple } from "three";
import { Player, Building, Unit } from "./Player";
import { BuildingType, Race, GamePhaseType } from "../../shared/types";
import { buildingsData } from "../../shared/gameData/buildingsData";
import { unitsData } from "../../shared/gameData/unitsData";
import { GAME_CONFIG } from "../../shared/gameData/gameConfig";
import { v4 as uuidv4 } from "uuid";

export class GameState {
  gameId: string;
  players: Map<string, Player>;
  phase: GamePhaseType;
  timeUntilCombat: number;
  lastUpdateTime: number;
  winner: string | null;

  constructor(gameId: string) {
    this.gameId = gameId;
    this.players = new Map();
    this.phase = "menu";
    this.timeUntilCombat = GAME_CONFIG.BUILDING_PHASE_DURATION;
    this.lastUpdateTime = Date.now();
    this.winner = null;
  }

  addPlayer(player: Player) {
    this.players.set(player.id, player);
  }

  removePlayer(playerId: string) {
    this.players.delete(playerId);
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  getPhase(): GamePhaseType {
    return this.phase;
  }

  addAIPlayer() {
    const aiPlayer = new Player(uuidv4(), "🤖 AI Bot", true);
    this.addPlayer(aiPlayer);
  }

  setPlayerRace(playerId: string, race: Race) {
    const player = this.players.get(playerId);
    if (player) {
      player.setRace(race);
      
      // If we now have all race selections, proceed to building phase
      let allPlayersReady = true;
      this.players.forEach(p => {
        if (p.race === null) {
          allPlayersReady = false;
        }
      });
      
      if (allPlayersReady) {
        this.startBuildingPhase();
      }
    }
  }

  startBuildingPhase() {
    this.phase = "building";
    this.timeUntilCombat = GAME_CONFIG.BUILDING_PHASE_DURATION;
    
    // Set up initial positions and buildings for AI
    this.setupAIBuildings();
  }

  startCombatPhase() {
    this.phase = "combat";
  }

  placeBuilding(playerId: string, buildingType: string, position: Vector3Tuple) {
    const player = this.players.get(playerId);
    if (!player || this.phase !== "building" || !player.race) return;
    
    const buildingData = buildingsData[buildingType as BuildingType];
    if (!buildingData || player.race !== buildingData.race) return;
    
    // Check if player has enough gold
    if (player.gold < buildingData.cost) return;
    
    // Check if position is valid (simplified for now)
    if (!this.isValidBuildingPlacement(position, player.id)) return;
    
    // Deduct gold and place building
    player.deductGold(buildingData.cost);
    player.addBuilding(
      buildingType as BuildingType,
      position,
      buildingData.cooldown,
      buildingData.cooldown,
      buildingData.health
    );
  }

  setupAIBuildings() {
    // Find the AI player
    let aiPlayer: Player | undefined;
    this.players.forEach(player => {
      if (player.isAI) {
        aiPlayer = player;
      }
    });
    
    if (!aiPlayer || !aiPlayer.race) return;
    
    // Add some basic buildings for the AI
    const race = aiPlayer.race;
    
    // Basic buildings setup
    if (race === "human") {
      aiPlayer.addBuilding("human_barracks", [6, 0.5, 2], 10, 10, 300);
      aiPlayer.addBuilding("human_archery", [8, 0.5, -2], 15, 15, 250);
      aiPlayer.addBuilding("human_market", [10, 0.5, 0], 0, 0, 200);
    } else if (race === "undead") {
      aiPlayer.addBuilding("undead_crypt", [6, 0.5, 2], 8, 8, 220);
      aiPlayer.addBuilding("undead_graveyard", [8, 0.5, -2], 12, 12, 200);
      aiPlayer.addBuilding("undead_mine", [10, 0.5, 0], 0, 0, 180);
    } else if (race === "nature") {
      aiPlayer.addBuilding("nature_grove", [6, 0.5, 2], 12, 12, 250);
      aiPlayer.addBuilding("nature_den", [8, 0.5, -2], 14, 14, 230);
      aiPlayer.addBuilding("nature_farm", [10, 0.5, 0], 0, 0, 150);
    } else if (race === "fire") {
      aiPlayer.addBuilding("fire_forge", [6, 0.5, 2], 15, 15, 220);
      aiPlayer.addBuilding("fire_altar", [8, 0.5, -2], 18, 18, 200);
      aiPlayer.addBuilding("fire_mine", [10, 0.5, 0], 0, 0, 180);
    }
  }

  isValidBuildingPlacement(position: Vector3Tuple, playerId: string): boolean {
    // Basic validation
    const player = this.players.get(playerId);
    if (!player) return false;
    
    // Player builds on the left side, AI on the right
    const isAI = player.isAI;
    const x = position[0];
    
    if (isAI) {
      // AI builds on the right side
      if (x < 0 || x > 12) return false;
    } else {
      // Player builds on the left side
      if (x < -12 || x > 0) return false;
    }
    
    // Check for overlap with existing buildings (simplified)
    for (const [_, p] of this.players) {
      for (const building of p.buildings) {
        const dx = building.position[0] - position[0];
        const dz = building.position[2] - position[2];
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance < 1.5) {
          return false; // Too close to another building
        }
      }
    }
    
    return true;
  }

  update(deltaTime: number) {
    if (this.phase !== "combat") return;
    
    const now = Date.now();
    const timeDiff = now - this.lastUpdateTime;
    this.lastUpdateTime = now;
    
    // Process income generation (once per second)
    if (timeDiff >= 1000) {
      this.players.forEach(player => {
        player.addGold(player.income);
      });
    }
    
    // Update buildings (spawn units)
    this.players.forEach(player => {
      for (let i = 0; i < player.buildings.length; i++) {
        const building = player.buildings[i];
        
        // Decrease cooldown
        building.cooldown -= deltaTime;
        
        // Spawn units if cooldown complete
        if (building.cooldown <= 0) {
          this.spawnUnitFromBuilding(player, building);
          building.cooldown = building.maxCooldown;
        }
      }
    });
    
    // Update units (movement and combat)
    this.updateUnits(deltaTime);
    
    // Check victory conditions
    this.checkVictoryConditions();
  }

  spawnUnitFromBuilding(player: Player, building: Building) {
    const buildingData = buildingsData[building.type];
    if (!buildingData.produces || buildingData.produces.length === 0) return;
    
    // Get a random unit type from building's production list
    const randomIndex = Math.floor(Math.random() * buildingData.produces.length);
    const unitType = buildingData.produces[randomIndex];
    const unitData = unitsData[unitType];
    
    if (!unitData) return;
    
    // Calculate spawn position
    const spawnOffset = player.isAI ? -1 : 1;
    const spawnPosition: Vector3Tuple = [
      building.position[0] + spawnOffset,
      building.position[1],
      building.position[2]
    ];
    
    // Create the unit
    player.addUnit(
      unitType,
      spawnPosition,
      unitData.health,
      unitData.health,
      unitData.damage
    );
  }

  updateUnits(deltaTime: number) {
    const playerList: Player[] = Array.from(this.players.values());
    if (playerList.length < 2) return;
    
    // For simplicity, assuming 2 players: index 0 is human, index 1 is AI
    const humanPlayer = playerList.find(p => !p.isAI) || playerList[0];
    const aiPlayer = playerList.find(p => p.isAI) || playerList[1];
    
    // Update human player units
    for (const unit of humanPlayer.units) {
      this.updateUnitMovement(unit, deltaTime, true);
      this.updateUnitCombat(unit, humanPlayer, aiPlayer, deltaTime);
    }
    
    // Update AI units
    for (const unit of aiPlayer.units) {
      this.updateUnitMovement(unit, deltaTime, false);
      this.updateUnitCombat(unit, aiPlayer, humanPlayer, deltaTime);
    }
  }

  updateUnitMovement(unit: Unit, deltaTime: number, isHumanUnit: boolean) {
    if (unit.attacking) return; // Don't move while attacking
    
    // Human units move right, AI units move left
    const moveDirection = isHumanUnit ? 1 : -1;
    const moveSpeed = GAME_CONFIG.UNIT_MOVE_SPEED * deltaTime;
    
    // Move along x-axis
    unit.position[0] += moveDirection * moveSpeed;
    
    // Gradually move towards center path if needed
    if (Math.abs(unit.position[2]) > 0.1) {
      const centeringSpeed = moveSpeed * 0.5;
      unit.position[2] += unit.position[2] > 0 ? -centeringSpeed : centeringSpeed;
    }
  }

  updateUnitCombat(unit: Unit, ownerPlayer: Player, enemyPlayer: Player, deltaTime: number) {
    // Decrease attack cooldown
    if (unit.attackCooldown > 0) {
      unit.attackCooldown -= deltaTime;
    }
    
    // Find closest enemy
    const closestEnemy = this.findClosestEnemy(unit, enemyPlayer.units);
    const isHumanUnit = !ownerPlayer.isAI;
    const castlePosition: Vector3Tuple = isHumanUnit ? [12, 1, 0] : [-12, 1, 0];
    
    if (closestEnemy) {
      // Check if in attack range
      if (this.isInRange(unit, closestEnemy)) {
        unit.attacking = true;
        
        // Attack if cooldown is ready
        if (unit.attackCooldown <= 0) {
          unit.attackCooldown = GAME_CONFIG.ATTACK_COOLDOWN;
          
          // Deal damage to enemy unit
          const killed = enemyPlayer.damageUnit(closestEnemy.id, unit.damage);
          
          // Remove enemy if killed
          if (killed) {
            enemyPlayer.removeUnit(closestEnemy.id);
          }
        }
        
        return; // Don't check castle if attacking a unit
      }
    }
    
    // If no enemies in range, check if castle is in range
    if (this.isCastleInRange(unit, castlePosition)) {
      unit.attacking = true;
      
      // Attack castle if cooldown is ready
      if (unit.attackCooldown <= 0) {
        unit.attackCooldown = GAME_CONFIG.ATTACK_COOLDOWN;
        enemyPlayer.damageCastle(unit.damage);
      }
    } else {
      unit.attacking = false;
    }
  }

  findClosestEnemy(unit: Unit, enemyUnits: Unit[]): Unit | null {
    if (enemyUnits.length === 0) return null;
    
    let closestEnemy = enemyUnits[0];
    let minDistance = this.calculateDistance(unit.position, closestEnemy.position);
    
    for (let i = 1; i < enemyUnits.length; i++) {
      const distance = this.calculateDistance(unit.position, enemyUnits[i].position);
      if (distance < minDistance) {
        minDistance = distance;
        closestEnemy = enemyUnits[i];
      }
    }
    
    return closestEnemy;
  }

  calculateDistance(pos1: Vector3Tuple, pos2: Vector3Tuple): number {
    const dx = pos1[0] - pos2[0];
    const dz = pos1[2] - pos2[2];
    return Math.sqrt(dx * dx + dz * dz);
  }

  isInRange(attacker: Unit, target: Unit): boolean {
    const distance = this.calculateDistance(attacker.position, target.position);
    const attackerData = unitsData[attacker.type as any];
    
    if (!attackerData) return false;
    
    let attackRange = 1; // Default
    
    switch (attackerData.category) {
      case "melee":
        attackRange = 0.8;
        break;
      case "ranged":
        attackRange = 4;
        break;
      case "siege":
        attackRange = 6;
        break;
      case "flying":
        attackRange = 1;
        break;
    }
    
    return distance <= attackRange;
  }

  isCastleInRange(unit: Unit, castlePosition: Vector3Tuple): boolean {
    const distance = this.calculateDistance(unit.position, castlePosition);
    const unitData = unitsData[unit.type as any];
    
    if (!unitData) return false;
    
    let attackRange = 1; // Default
    
    switch (unitData.category) {
      case "melee":
        attackRange = 1.2;
        break;
      case "ranged":
        attackRange = 6;
        break;
      case "siege":
        attackRange = 8;
        break;
      case "flying":
        attackRange = 1.5;
        break;
    }
    
    return distance <= attackRange;
  }

  checkVictoryConditions() {
    this.players.forEach(player => {
      if (player.castleHealth <= 0) {
        this.phase = "game_over";
        
        // The winner is the one whose castle is still standing
        this.players.forEach(p => {
          if (p.id !== player.id && p.castleHealth > 0) {
            this.winner = p.id;
          }
        });
      }
    });
  }

  isGameOver(): boolean {
    return this.phase === "game_over";
  }

  getWinner(): string | null {
    return this.winner;
  }

  getGameState() {
    const playerStates: any[] = [];
    
    this.players.forEach(player => {
      playerStates.push(player.getSnapshot());
    });
    
    return {
      gameId: this.gameId,
      phase: this.phase,
      timeUntilCombat: this.timeUntilCombat,
      players: playerStates,
      winner: this.winner
    };
  }
}