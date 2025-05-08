interface Unit {
  id: string;
  x: number;
  y: number;
  lane: number;
  health: number;
  damage: number;
  speed: number;
}

export class GameState {
  private units: Unit[];
  private gold: number;
  private readonly LANE_COUNT = 3;
  private readonly LANE_HEIGHT = 200;

  constructor() {
    this.units = [];
    this.gold = 100;
  }

  getState() {
    return {
      units: this.units,
      gold: this.gold
    };
  }

  placeUnit(lane: number, unitType: string) {
    if (lane < 0 || lane >= this.LANE_COUNT) return;
    if (this.gold < 50) return; // Basic unit cost

    const unit: Unit = {
      id: Math.random().toString(36).substr(2, 9),
      x: 50,
      y: this.LANE_HEIGHT * (lane + 0.5),
      lane,
      health: 100,
      damage: 10,
      speed: 2
    };

    this.units.push(unit);
    this.gold -= 50;
  }

  update() {
    // Update unit positions
    this.units.forEach(unit => {
      unit.x += unit.speed;
    });

    // Remove units that have moved off screen
    this.units = this.units.filter(unit => unit.x < 800);

    // Generate gold over time
    this.gold += 1;
  }
} 