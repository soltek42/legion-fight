import { Race } from "@shared/types";

// Game configuration constants
export const GAME_CONFIG = {
  // Board settings
  BOARD_WIDTH: 30,
  BOARD_HEIGHT: 20,
  LANE_WIDTH: 4,
  
  // Game phases
  BUILDING_PHASE_DURATION: 120, // in seconds
  
  // Resource settings
  STARTING_GOLD: 500,
  BASE_INCOME: 10, // gold per second
  
  // Building settings
  BUILDING_AREA_WIDTH: 6, // How far from the castle buildings can be placed
  BUILDING_GRID_SIZE: 1, // Size of each grid cell for building placement
  
  // Castle settings
  CASTLE_MAX_HEALTH: 1000,
  
  // Combat settings
  UNIT_MOVE_SPEED: 2, // Units per second
  UNIT_ATTACK_RANGE: {
    MELEE: 0.8,
    RANGED: 4,
    SIEGE: 6,
    FLYING: 1
  },
  ATTACK_COOLDOWN: 1, // seconds between attacks
  
  // Race base modifiers (applied to units/buildings of that race)
  RACE_MODIFIERS: {
    human: {
      health: 1.1, // 10% more health
      damage: 1.0, 
      cost: 1.0
    },
    undead: {
      health: 0.9, // 10% less health
      damage: 1.2, // 20% more damage
      cost: 1.0
    },
    nature: {
      health: 1.0,
      damage: 0.9, // 10% less damage
      cost: 0.8 // 20% cheaper
    },
    fire: {
      health: 0.8, // 20% less health
      damage: 1.3, // 30% more damage
      cost: 1.2 // 20% more expensive
    }
  } as Record<Race, { health: number, damage: number, cost: number }>
};

// AI difficulty levels - for future implementation
export const AI_DIFFICULTY = {
  EASY: {
    INCOME_MULTIPLIER: 0.8,
    BUILDING_DELAY: 5, // seconds between AI building decisions
    DECISION_QUALITY: 0.5 // probability of making optimal decision
  },
  MEDIUM: {
    INCOME_MULTIPLIER: 1.0,
    BUILDING_DELAY: 3,
    DECISION_QUALITY: 0.7
  },
  HARD: {
    INCOME_MULTIPLIER: 1.2,
    BUILDING_DELAY: 1,
    DECISION_QUALITY: 0.9
  }
};
