import { UnitType } from "@shared/types";

interface UnitData {
  name: string;
  description: string;
  category: "melee" | "ranged" | "flying" | "siege";
  race: string;
  health: number;
  damage: number;
  speed: number;
  special?: string;
}

export const unitsData: Record<UnitType, UnitData> = {
  // Human Units
  human_swordsman: {
    name: "Swordsman",
    description: "Basic infantry unit with balanced stats.",
    category: "melee",
    race: "human",
    health: 100,
    damage: 12,
    speed: 2
  },
  human_knight: {
    name: "Knight",
    description: "Heavy cavalry unit with high health and damage.",
    category: "melee",
    race: "human",
    health: 180,
    damage: 18,
    speed: 3
  },
  human_archer: {
    name: "Archer",
    description: "Basic ranged unit that attacks from a distance.",
    category: "ranged",
    race: "human",
    health: 60,
    damage: 15,
    speed: 2
  },
  human_crossbowman: {
    name: "Crossbowman",
    description: "Advanced ranged unit with higher damage.",
    category: "ranged",
    race: "human",
    health: 80,
    damage: 20,
    speed: 1.5
  },
  human_paladin: {
    name: "Paladin",
    description: "Elite holy warrior with high health and damage.",
    category: "melee",
    race: "human",
    health: 250,
    damage: 25,
    speed: 2,
    special: "Holy aura heals nearby friendly units"
  },
  human_cleric: {
    name: "Cleric",
    description: "Support unit that heals nearby allies.",
    category: "ranged",
    race: "human",
    health: 70,
    damage: 5,
    speed: 1.5,
    special: "Heals nearby friendly units"
  },
  human_priest: {
    name: "Priest",
    description: "Advanced support unit with stronger healing and damage.",
    category: "ranged",
    race: "human",
    health: 90,
    damage: 10,
    speed: 1.5,
    special: "Stronger healing and can damage undead units"
  },
  human_catapult: {
    name: "Catapult",
    description: "Siege weapon that deals area damage from a distance.",
    category: "siege",
    race: "human",
    health: 120,
    damage: 50,
    speed: 1,
    special: "Area of effect damage"
  },
  
  // Undead Units
  undead_zombie: {
    name: "Zombie",
    description: "Basic undead unit with low stats but cheap to produce.",
    category: "melee",
    race: "undead",
    health: 80,
    damage: 8,
    speed: 1.5
  },
  undead_ghoul: {
    name: "Ghoul",
    description: "Fast melee attacker that can frenzy.",
    category: "melee",
    race: "undead",
    health: 100,
    damage: 15,
    speed: 2.5,
    special: "Frenzies after kills, increasing attack speed"
  },
  undead_skeleton: {
    name: "Skeleton Warrior",
    description: "Basic undead warrior with balanced stats.",
    category: "melee",
    race: "undead",
    health: 70,
    damage: 12,
    speed: 2
  },
  undead_archer: {
    name: "Skeleton Archer",
    description: "Basic ranged undead unit.",
    category: "ranged",
    race: "undead",
    health: 50,
    damage: 14,
    speed: 2
  },
  undead_necromancer: {
    name: "Necromancer",
    description: "Powerful ranged caster that can raise dead.",
    category: "ranged",
    race: "undead",
    health: 100,
    damage: 18,
    speed: 1.5,
    special: "Can summon skeleton warriors from fallen units"
  },
  undead_abomination: {
    name: "Abomination",
    description: "Large undead monstrosity with high health.",
    category: "melee",
    race: "undead",
    health: 300,
    damage: 30,
    speed: 1,
    special: "Deals poison damage over time"
  },
  undead_dragon: {
    name: "Bone Dragon",
    description: "Flying undead dragon with high damage.",
    category: "flying",
    race: "undead",
    health: 200,
    damage: 40,
    speed: 3,
    special: "Can attack ground and air units"
  },
  
  // Nature Units
  nature_treant: {
    name: "Treant",
    description: "Living tree with high health but slow movement.",
    category: "melee",
    race: "nature",
    health: 250,
    damage: 20,
    speed: 1,
    special: "Regenerates health over time"
  },
  nature_dryad: {
    name: "Dryad",
    description: "Forest spirit that heals allies and damages enemies.",
    category: "ranged",
    race: "nature",
    health: 80,
    damage: 12,
    speed: 2,
    special: "Heals nearby nature units"
  },
  nature_wolf: {
    name: "Dire Wolf",
    description: "Fast melee attacker that hunts in packs.",
    category: "melee",
    race: "nature",
    health: 90,
    damage: 15,
    speed: 3,
    special: "Bonus damage when near other wolves"
  },
  nature_bear: {
    name: "Guardian Bear",
    description: "Powerful melee unit with high health and damage.",
    category: "melee",
    race: "nature",
    health: 220,
    damage: 25,
    speed: 2
  },
  nature_water_elemental: {
    name: "Water Elemental",
    description: "Magical being made of water that slows enemies.",
    category: "ranged",
    race: "nature",
    health: 150,
    damage: 18,
    speed: 2,
    special: "Slows enemy movement"
  },
  nature_nymph: {
    name: "Forest Nymph",
    description: "Agile ranged attacker that enhances nearby allies.",
    category: "ranged",
    race: "nature",
    health: 70,
    damage: 10,
    speed: 2.5,
    special: "Increases nearby allies' attack speed"
  },
  nature_wasp: {
    name: "Giant Wasp",
    description: "Flying insect that poisons enemies.",
    category: "flying",
    race: "nature",
    health: 60,
    damage: 12,
    speed: 3.5,
    special: "Poisons enemies, dealing damage over time"
  },
  nature_spider: {
    name: "Giant Spider",
    description: "Fast melee attacker that can web enemies.",
    category: "melee",
    race: "nature",
    health: 100,
    damage: 14,
    speed: 2.5,
    special: "Can immobilize enemies temporarily"
  },
  nature_eagle: {
    name: "Giant Eagle",
    description: "Flying unit with high speed and decent damage.",
    category: "flying",
    race: "nature",
    health: 120,
    damage: 22,
    speed: 4
  },
  
  // Fire Units
  fire_elemental: {
    name: "Fire Elemental",
    description: "Basic fire unit that burns enemies.",
    category: "melee",
    race: "fire",
    health: 110,
    damage: 18,
    speed: 2,
    special: "Burns enemies, dealing damage over time"
  },
  fire_imp: {
    name: "Fire Imp",
    description: "Small, fast fire creature with ranged attacks.",
    category: "ranged",
    race: "fire",
    health: 50,
    damage: 15,
    speed: 3
  },
  fire_mage: {
    name: "Fire Mage",
    description: "Caster that launches powerful fireballs.",
    category: "ranged",
    race: "fire",
    health: 80,
    damage: 25,
    speed: 1.5,
    special: "Area of effect damage"
  },
  fire_warlock: {
    name: "Warlock",
    description: "Powerful caster with devastating fire spells.",
    category: "ranged",
    race: "fire",
    health: 100,
    damage: 35,
    speed: 1.5,
    special: "Can cast a powerful fire nova"
  },
  fire_phoenix: {
    name: "Phoenix",
    description: "Majestic fire bird that can resurrect once.",
    category: "flying",
    race: "fire",
    health: 150,
    damage: 30,
    speed: 3.5,
    special: "Resurrects once with half health when killed"
  },
  fire_golem: {
    name: "Fire Golem",
    description: "Massive fire construct with very high health and damage.",
    category: "melee",
    race: "fire",
    health: 400,
    damage: 50,
    speed: 1,
    special: "Deals splash damage to nearby enemies"
  },
  fire_cannon_ball: {
    name: "Cannon Ball",
    description: "Explosive projectile that deals area damage.",
    category: "siege",
    race: "fire",
    health: 30,
    damage: 60,
    speed: 2.5,
    special: "Large area of effect damage"
  }
};
