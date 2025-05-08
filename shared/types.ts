// Race types 
export type Race = "human" | "undead" | "nature" | "fire";

// Building types
export type BuildingType = 
  // Human buildings
  | "human_barracks" 
  | "human_archery" 
  | "human_stable" 
  | "human_church" 
  | "human_workshop"
  | "human_market"
  // Undead buildings
  | "undead_crypt"
  | "undead_graveyard"
  | "undead_altar"
  | "undead_laboratory"
  | "undead_boneyard"
  | "undead_mine"
  // Nature buildings
  | "nature_grove"
  | "nature_den"
  | "nature_pond"
  | "nature_hive"
  | "nature_aviary"
  | "nature_farm"
  // Fire buildings
  | "fire_forge"
  | "fire_altar"
  | "fire_pyre"
  | "fire_foundry"
  | "fire_cannon"
  | "fire_mine";

// Unit types
export type UnitType = 
  // Human units
  | "human_swordsman"
  | "human_knight"
  | "human_archer"
  | "human_crossbowman"
  | "human_paladin"
  | "human_cleric"
  | "human_priest"
  | "human_catapult"
  // Undead units
  | "undead_zombie"
  | "undead_ghoul"
  | "undead_skeleton"
  | "undead_archer"
  | "undead_necromancer"
  | "undead_abomination"
  | "undead_dragon"
  // Nature units
  | "nature_treant"
  | "nature_dryad"
  | "nature_wolf"
  | "nature_bear"
  | "nature_water_elemental"
  | "nature_nymph"
  | "nature_wasp"
  | "nature_spider"
  | "nature_eagle"
  // Fire units
  | "fire_elemental"
  | "fire_imp"
  | "fire_mage"
  | "fire_warlock"
  | "fire_phoenix"
  | "fire_golem"
  | "fire_cannon_ball";

// Game phase types
export type GamePhaseType = "menu" | "race_selection" | "building" | "combat" | "game_over";

// Building category types
export type BuildingCategoryType = "combat" | "economy" | "special";

// Unit category types
export type UnitCategoryType = "melee" | "ranged" | "flying" | "siege";

// Server response types
export interface GameStateResponse {
  gameId: string;
  phase: GamePhaseType;
  timeUntilCombat: number;
  players: PlayerState[];
  winner: string | null;
}

export interface PlayerState {
  id: string;
  name: string;
  race: Race | null;
  gold: number;
  income: number;
  castleHealth: number;
  buildings: BuildingState[];
  units: UnitState[];
  isAI: boolean;
}

export interface BuildingState {
  id: string;
  type: BuildingType;
  position: [number, number, number];
  health: number;
  cooldown: number;
  maxCooldown: number;
}

export interface UnitState {
  id: string;
  type: UnitType;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  damage: number;
  attackCooldown: number;
  attacking: boolean;
}

// Game data interfaces (for buildings and units)
export interface BuildingData {
  name: string;
  description: string;
  category: BuildingCategoryType;
  race: string;
  cost: number;
  cooldown: number;
  health: number;
  icon?: string;
  produces?: UnitType[];
  incomeBonus?: number;
}

export interface UnitData {
  name: string;
  description: string;
  category: UnitCategoryType;
  race: string;
  health: number;
  damage: number;
  speed: number;
  special?: string;
}

export interface RaceData {
  description: string;
  specialty: string;
  offense: string;
  defense: string;
  economy: string;
}

// Game configuration interface
export interface GameConfig {
  BOARD_WIDTH: number;
  BOARD_HEIGHT: number;
  LANE_WIDTH: number;
  BUILDING_PHASE_DURATION: number;
  STARTING_GOLD: number;
  BASE_INCOME: number;
  BUILDING_AREA_WIDTH: number;
  BUILDING_GRID_SIZE: number;
  CASTLE_MAX_HEALTH: number;
  UNIT_MOVE_SPEED: number;
  UNIT_ATTACK_RANGE: {
    MELEE: number;
    RANGED: number;
    SIEGE: number;
    FLYING: number;
  };
  ATTACK_COOLDOWN: number;
  RACE_MODIFIERS: Record<Race, {
    health: number;
    damage: number;
    cost: number;
  }>;
}
