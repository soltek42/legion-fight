import { Race } from "../types";

export interface RaceData {
  description: string;
  specialty: string;
  offense: string;
  defense: string;
  economy: string;
}

export const racesData: Record<Race, RaceData> = {
  human: {
    description: "Balanced race with versatile units and solid defenses. Humans specialize in defensive structures and have well-rounded economy.",
    specialty: "Balanced units and defensive structures",
    offense: "Medium",
    defense: "High",
    economy: "Medium"
  },
  undead: {
    description: "Undead forces focus on overwhelming enemies with cheap, expendable units. Their buildings produce units quickly, but have less health.",
    specialty: "Fast production and swarming tactics",
    offense: "High",
    defense: "Low",
    economy: "Medium"
  },
  nature: {
    description: "Nature focuses on economy and regeneration. Their units are cheaper but individually weaker, making them excellent for early game rushes.",
    specialty: "Resource generation and economic advantage",
    offense: "Low",
    defense: "Medium",
    economy: "High"
  },
  fire: {
    description: "Fire elementals deal massive damage but are fragile and expensive. Their buildings and units focus on dealing area damage to multiple targets.",
    specialty: "High damage and area of effect attacks",
    offense: "Very High",
    defense: "Very Low",
    economy: "Low"
  }
};