import { BuildingType, UnitType } from "../types";

interface BuildingData {
  name: string;
  description: string;
  category: "combat" | "economy" | "special";
  race: string;
  cost: number;
  cooldown: number;
  health: number;
  icon?: string;
  produces?: UnitType[];
  incomeBonus?: number;
}

export const buildingsData: Record<BuildingType, BuildingData> = {
  // Human Buildings
  human_barracks: {
    name: "Barracks",
    description: "Trains human soldiers to defend your castle.",
    category: "combat",
    race: "human",
    cost: 150,
    cooldown: 10,
    health: 300,
    icon: "🏢",
    produces: ["human_swordsman", "human_knight"]
  },
  human_archery: {
    name: "Archery Range",
    description: "Trains skilled archers that attack from a distance.",
    category: "combat",
    race: "human",
    cost: 200,
    cooldown: 15,
    health: 250,
    icon: "🏹",
    produces: ["human_archer", "human_crossbowman"]
  },
  human_stable: {
    name: "Stables",
    description: "Trains mounted knights that move quickly across the battlefield.",
    category: "combat",
    race: "human",
    cost: 250,
    cooldown: 20,
    health: 280,
    icon: "🐎",
    produces: ["human_knight", "human_paladin"]
  },
  human_church: {
    name: "Church",
    description: "Trains clerics that can heal nearby units.",
    category: "special",
    race: "human",
    cost: 300,
    cooldown: 25,
    health: 350,
    icon: "⛪",
    produces: ["human_cleric", "human_priest"]
  },
  human_workshop: {
    name: "Workshop",
    description: "Builds siege weapons that can attack from a great distance.",
    category: "combat",
    race: "human",
    cost: 350,
    cooldown: 30,
    health: 300,
    icon: "🔨",
    produces: ["human_catapult"]
  },
  human_market: {
    name: "Market",
    description: "Generates additional gold over time.",
    category: "economy",
    race: "human",
    cost: 180,
    cooldown: 0,
    health: 200,
    icon: "🏪",
    incomeBonus: 5
  },
  
  // Undead Buildings
  undead_crypt: {
    name: "Crypt",
    description: "Raises zombies and ghouls to attack enemies.",
    category: "combat",
    race: "undead",
    cost: 120,
    cooldown: 8,
    health: 220,
    icon: "⚰️",
    produces: ["undead_zombie", "undead_ghoul"]
  },
  undead_graveyard: {
    name: "Graveyard",
    description: "Summons skeletal archers and warriors.",
    category: "combat",
    race: "undead",
    cost: 180,
    cooldown: 12,
    health: 200,
    icon: "🪦",
    produces: ["undead_skeleton", "undead_archer"]
  },
  undead_altar: {
    name: "Dark Altar",
    description: "Creates powerful necromancers that can raise the dead.",
    category: "special",
    race: "undead",
    cost: 320,
    cooldown: 25,
    health: 280,
    icon: "🕯️",
    produces: ["undead_necromancer"]
  },
  undead_laboratory: {
    name: "Laboratory",
    description: "Creates plague-spreading abominations.",
    category: "combat",
    race: "undead",
    cost: 280,
    cooldown: 18,
    health: 250,
    icon: "🧪",
    produces: ["undead_abomination"]
  },
  undead_boneyard: {
    name: "Boneyard",
    description: "Raises skeletal dragons that dominate the skies.",
    category: "combat",
    race: "undead",
    cost: 400,
    cooldown: 35,
    health: 300,
    icon: "🦴",
    produces: ["undead_dragon"]
  },
  undead_mine: {
    name: "Haunted Mine",
    description: "Undead miners generate gold from beyond the grave.",
    category: "economy",
    race: "undead",
    cost: 200,
    cooldown: 0,
    health: 180,
    icon: "⛏️",
    incomeBonus: 6
  },
  
  // Nature Buildings
  nature_grove: {
    name: "Ancient Grove",
    description: "Grows treants and dryads to protect the forest.",
    category: "combat",
    race: "nature",
    cost: 130,
    cooldown: 12,
    health: 250,
    icon: "🌳",
    produces: ["nature_treant", "nature_dryad"]
  },
  nature_den: {
    name: "Beast Den",
    description: "Raises wild animals that fight with tooth and claw.",
    category: "combat",
    race: "nature",
    cost: 160,
    cooldown: 14,
    health: 230,
    icon: "🐺",
    produces: ["nature_wolf", "nature_bear"]
  },
  nature_pond: {
    name: "Mystical Pond",
    description: "Spawns water elementals and nymphs.",
    category: "special",
    race: "nature",
    cost: 220,
    cooldown: 20,
    health: 200,
    icon: "🌊",
    produces: ["nature_water_elemental", "nature_nymph"]
  },
  nature_hive: {
    name: "Giant Hive",
    description: "Home to giant insects that swarm enemies.",
    category: "combat",
    race: "nature",
    cost: 200,
    cooldown: 10,
    health: 180,
    icon: "🐝",
    produces: ["nature_wasp", "nature_spider"]
  },
  nature_aviary: {
    name: "Aviary",
    description: "Houses giant birds that attack from above.",
    category: "combat",
    race: "nature",
    cost: 300,
    cooldown: 25,
    health: 220,
    icon: "🦅",
    produces: ["nature_eagle"]
  },
  nature_farm: {
    name: "Ancient Farm",
    description: "Grows magical crops that generate gold.",
    category: "economy",
    race: "nature",
    cost: 150,
    cooldown: 0,
    health: 150,
    icon: "🌱",
    incomeBonus: 8
  },
  
  // Fire Buildings
  fire_forge: {
    name: "Infernal Forge",
    description: "Creates fire elementals that burn everything in their path.",
    category: "combat",
    race: "fire",
    cost: 200,
    cooldown: 15,
    health: 220,
    icon: "🔥",
    produces: ["fire_elemental", "fire_imp"]
  },
  fire_altar: {
    name: "Flame Altar",
    description: "Summons powerful fire mages.",
    category: "combat",
    race: "fire",
    cost: 250,
    cooldown: 18,
    health: 200,
    icon: "🔮",
    produces: ["fire_mage", "fire_warlock"]
  },
  fire_pyre: {
    name: "Phoenix Pyre",
    description: "Hatches phoenixes that dominate the skies.",
    category: "combat",
    race: "fire",
    cost: 350,
    cooldown: 30,
    health: 180,
    icon: "🦅",
    produces: ["fire_phoenix"]
  },
  fire_foundry: {
    name: "Demon Foundry",
    description: "Forges fire golems that are slow but extremely powerful.",
    category: "special",
    race: "fire",
    cost: 400,
    cooldown: 35,
    health: 280,
    icon: "⚒️",
    produces: ["fire_golem"]
  },
  fire_cannon: {
    name: "Flame Cannon",
    description: "Launches fireballs that damage multiple enemies.",
    category: "combat",
    race: "fire",
    cost: 300,
    cooldown: 20,
    health: 220,
    icon: "💣",
    produces: ["fire_cannon_ball"]
  },
  fire_mine: {
    name: "Magma Mine",
    description: "Extracts gold from the depths of volcanic chambers.",
    category: "economy",
    race: "fire",
    cost: 220,
    cooldown: 0,
    health: 180,
    icon: "🌋",
    incomeBonus: 7
  }
};