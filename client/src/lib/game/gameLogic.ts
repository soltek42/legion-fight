import { Vector3Tuple } from "three";
import { Unit, Building, UnitType, BuildingType } from "@shared/types";
import { GAME_CONFIG } from "./gameConfig";
import { buildingsData } from "./buildingsData";
import { unitsData } from "./unitsData";
import { v4 as uuidv4 } from "uuid";

// Helper functions for game logic

/**
 * Calculate distance between two positions
 */
export function calculateDistance(pos1: Vector3Tuple, pos2: Vector3Tuple): number {
  const dx = pos1[0] - pos2[0];
  const dz = pos1[2] - pos2[2];
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Check if a unit is within attack range of another unit
 */
export function isInRange(attacker: Unit, target: Unit): boolean {
  const attackerData = unitsData[attacker.type];
  const distance = calculateDistance(attacker.position, target.position);
  
  const attackRange = GAME_CONFIG.UNIT_ATTACK_RANGE[attackerData.category];
  return distance <= attackRange;
}

/**
 * Normalize a vector to a specific length
 */
export function normalizeVector(x: number, z: number, length: number): [number, number] {
  const magnitude = Math.sqrt(x * x + z * z);
  if (magnitude === 0) return [0, 0];
  
  return [(x / magnitude) * length, (z / magnitude) * length];
}

/**
 * Find the closest enemy unit
 */
export function findClosestEnemy(unit: Unit, enemyUnits: Unit[]): Unit | null {
  if (enemyUnits.length === 0) return null;
  
  let closestUnit = enemyUnits[0];
  let closestDistance = calculateDistance(unit.position, closestUnit.position);
  
  for (let i = 1; i < enemyUnits.length; i++) {
    const distance = calculateDistance(unit.position, enemyUnits[i].position);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestUnit = enemyUnits[i];
    }
  }
  
  return closestUnit;
}

/**
 * Spawn a new unit from a building
 */
export function spawnUnit(building: Building, isPlayer: boolean): Unit | null {
  const buildingData = buildingsData[building.type];
  if (!buildingData.produces || buildingData.produces.length === 0) {
    return null;
  }
  
  // Get a random unit type from the building's production list
  const randomIndex = Math.floor(Math.random() * buildingData.produces.length);
  const unitType = buildingData.produces[randomIndex] as UnitType;
  const unitData = unitsData[unitType];
  
  if (!unitData) return null;
  
  // Calculate spawn position slightly in front of the building
  const spawnOffset = isPlayer ? 1 : -1;
  const spawnPosition: Vector3Tuple = [
    building.position[0] + spawnOffset,
    building.position[1],
    building.position[2]
  ];
  
  // Create the new unit
  const newUnit: Unit = {
    id: uuidv4(),
    type: unitType,
    position: spawnPosition,
    health: unitData.health,
    maxHealth: unitData.health,
    damage: unitData.damage,
    attackCooldown: 0,
    attacking: false
  };
  
  return newUnit;
}

/**
 * Update unit movement towards the enemy castle
 */
export function updateUnitMovement(unit: Unit, targetPosition: Vector3Tuple, delta: number): void {
  if (unit.attacking) return; // Don't move while attacking
  
  const moveDirection = isPlayerUnit(unit.position) ? 1 : -1; // Player units move right, enemy units move left
  const moveSpeed = GAME_CONFIG.UNIT_MOVE_SPEED * delta;
  
  // Move along the x-axis
  unit.position[0] += moveDirection * moveSpeed;
  
  // If we're not on the center path, gradually move towards it
  if (Math.abs(unit.position[2]) > 0.1) {
    const centeringSpeed = moveSpeed * 0.5;
    unit.position[2] += unit.position[2] > 0 ? -centeringSpeed : centeringSpeed;
  }
}

/**
 * Update unit combat (attacking other units)
 */
export function updateUnitCombat(unit: Unit, enemyUnits: Unit[], delta: number): Unit | null {
  // Decrease attack cooldown
  if (unit.attackCooldown > 0) {
    unit.attackCooldown -= delta;
  }
  
  // Find closest enemy
  const target = findClosestEnemy(unit, enemyUnits);
  if (!target) {
    unit.attacking = false;
    return null;
  }
  
  // Check if in range
  if (isInRange(unit, target)) {
    unit.attacking = true;
    
    // Attack if cooldown is ready
    if (unit.attackCooldown <= 0) {
      // Reset cooldown
      unit.attackCooldown = GAME_CONFIG.ATTACK_COOLDOWN;
      
      // Apply damage to target
      target.health -= unit.damage;
      
      // Check if target is killed
      if (target.health <= 0) {
        return target; // Return the defeated target
      }
    }
  } else {
    unit.attacking = false;
  }
  
  return null;
}

/**
 * Update building (cooldown and unit spawning)
 */
export function updateBuilding(building: Building, delta: number): boolean {
  // Decrease cooldown
  building.cooldown -= delta;
  
  // Check if cooldown is complete
  if (building.cooldown <= 0) {
    // Reset cooldown
    building.cooldown = building.maxCooldown;
    return true; // Building is ready to spawn a unit
  }
  
  return false;
}

/**
 * Check if a position is valid for building placement
 * @param position - The position to check
 * @param isPlayer - Whether this is for the player or enemy
 * @param existingBuildings - List of existing buildings to check for collisions
 */
export function isValidBuildingPlacement(
  position: Vector3Tuple, 
  isPlayer: boolean,
  existingBuildings: Building[]
): boolean {
  // Check if position is within the building area
  const xLimit = GAME_CONFIG.BUILDING_AREA_WIDTH;
  const x = position[0];
  
  if (isPlayer) {
    // Player builds on the left side
    if (x < -xLimit || x > 0) return false;
  } else {
    // Enemy builds on the right side
    if (x < 0 || x > xLimit) return false;
  }
  
  // Check distance from lane
  const laneWidth = GAME_CONFIG.LANE_WIDTH / 2;
  if (Math.abs(position[2]) < laneWidth) return false;
  
  // Check for collisions with existing buildings
  for (const building of existingBuildings) {
    const distance = calculateDistance(position, building.position);
    if (distance < 1.5) return false; // Buildings can't be too close
  }
  
  return true;
}

/**
 * Helper function to determine if a unit belongs to the player based on position
 */
export function isPlayerUnit(position: Vector3Tuple): boolean {
  return position[0] < 0;
}

/**
 * Calculate gold income based on buildings
 */
export function calculateIncome(buildings: Building[], race: string): number {
  let income = GAME_CONFIG.BASE_INCOME;
  
  // Add income from economy buildings
  buildings.forEach(building => {
    const buildingData = buildingsData[building.type];
    if (buildingData.category === "economy") {
      income += buildingData.incomeBonus || 0;
    }
  });
  
  // Apply race modifiers (for future implementation)
  
  return income;
}

/**
 * Check if castle is in range of an enemy unit
 */
export function isCastleInRange(castlePosition: Vector3Tuple, unit: Unit): boolean {
  const unitData = unitsData[unit.type];
  const distance = calculateDistance(castlePosition, unit.position);
  
  // Use a larger range for attacking the castle
  const attackRange = (GAME_CONFIG.UNIT_ATTACK_RANGE[unitData.category] * 1.5);
  return distance <= attackRange;
}
