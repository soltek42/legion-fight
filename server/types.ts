export type Race = "human" | "undead" | "nature" | "fire";
export type GamePhaseType = "menu" | "waiting" | "race_selection" | "building" | "combat" | "game_over";
export type BuildingType = 
  | "human_barracks" | "human_archery" | "human_market"
  | "undead_crypt" | "undead_graveyard" | "undead_mine"
  | "nature_grove" | "nature_den" | "nature_farm"
  | "fire_forge" | "fire_altar" | "fire_mine"; 