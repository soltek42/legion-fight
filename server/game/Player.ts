import { Race, BuildingType } from "../../shared/types";
import { Vector3Tuple } from "three";

export class Player {
  id: string;
  name: string;
  race: Race | null;
  gold: number;
  income: number;
  buildings: Building[];
  units: Unit[];
  castleHealth: number;
  isAI: boolean;
  isReady: boolean;

  constructor(id: string, name: string, isAI: boolean = false) {
    this.id = id;
    this.name = name;
    this.race = null;
    this.gold = 500; // Starting gold
    this.income = 10; // Base income
    this.buildings = [];
    this.units = [];
    this.castleHealth = 1000; // Default castle health
    this.isAI = isAI;
    this.isReady = isAI; // AI players are always ready
  }

  setRace(race: Race) {
    this.race = race;
  }

  addGold(amount: number) {
    this.gold += amount;
  }

  deductGold(amount: number): boolean {
    if (this.gold >= amount) {
      this.gold -= amount;
      return true;
    }
    return false;
  }

  updateIncome(newIncome: number) {
    this.income = newIncome;
  }

  addBuilding(type: BuildingType, position: Vector3Tuple, cooldown: number, maxCooldown: number, health: number) {
    const building: Building = {
      id: `${type}_${Date.now()}_${this.buildings.length}`,
      type,
      position,
      health,
      cooldown,
      maxCooldown
    };
    this.buildings.push(building);
    return building;
  }

  addUnit(type: string, position: Vector3Tuple, health: number, maxHealth: number, damage: number) {
    const unit: Unit = {
      id: `${type}_${Date.now()}_${this.units.length}`,
      type: type as any,
      position,
      health,
      maxHealth,
      damage,
      attackCooldown: 0,
      attacking: false
    };
    this.units.push(unit);
    return unit;
  }

  removeUnit(id: string) {
    this.units = this.units.filter(unit => unit.id !== id);
  }

  damageUnit(id: string, amount: number): boolean {
    const unit = this.units.find(unit => unit.id === id);
    if (unit) {
      unit.health -= amount;
      return unit.health <= 0;
    }
    return false;
  }

  damageCastle(amount: number): boolean {
    this.castleHealth -= amount;
    return this.castleHealth <= 0;
  }

  getSnapshot() {
    return {
      id: this.id,
      name: this.name,
      race: this.race,
      gold: this.gold,
      income: this.income,
      buildings: this.buildings,
      units: this.units,
      castleHealth: this.castleHealth,
      isAI: this.isAI
    };
  }
}

// Types for buildings and units
export interface Building {
  id: string;
  type: BuildingType;
  position: Vector3Tuple;
  health: number;
  cooldown: number;
  maxCooldown: number;
}

export interface Unit {
  id: string;
  type: string;
  position: Vector3Tuple;
  health: number;
  maxHealth: number;
  damage: number;
  attackCooldown: number;
  attacking: boolean;
}
