# 🎮 Castle Fight — Detailed Gameplay Explanation

## 1. Core Gameplay Concept
Castle Fight is a **passive-strategy PvP game** where players:
- Build structures that periodically spawn units.
- Units march automatically along a lane toward the enemy.
- The goal is to destroy the enemy’s **castle** (main building).
- Players cannot directly control units once they are spawned.

---

## 2. Game Setup
- **Map Type**: Usually 1–3 lanes (most commonly 1-lane for classic mode).
- **Teams**: 1v1, 2v2, up to 5v5.
- **Races**: Each player chooses a race at the beginning (e.g., Nature, Undead, Human, Fire, etc.), each with unique buildings and unit types.

---

## 3. Resources
- **Gold**: Main currency, generated passively and from kills.
- **Wood (Lumber)**: Earned over time or via special structures/upgrades; used for upgrades or special actions.

> Resource generation is usually **automated**, and players cannot farm or collect resources manually.

---

## 4. Building Phase
Players have a small building area near their base. They construct **unit-producing buildings** from their chosen race.

Each building:
- Produces 1 or more unit types.
- Has a cooldown or spawn timer.
- Spawns units periodically (e.g., every 30 seconds).

Types of buildings:
- **Melee unit buildings** (e.g., swordsmen, ghouls).
- **Ranged unit buildings** (e.g., archers, fire mages).
- **Flying or special unit buildings** (e.g., dragons, siege units).
- **Support buildings** (e.g., mana generators, auras).
- **Economy buildings** (generate more gold/wood).

---

## 5. Combat Phase
Once spawned, units:
- Follow a fixed path toward the enemy castle.
- Automatically attack enemy units and buildings they encounter.

> Players do **not** control the units.

Additional mechanics:
- Units spawn in **waves**, and timing + composition are crucial.
- Some units have special abilities (e.g., healing, stuns, AoE).

---

## 6. Base Defense
Each team has:
- **Castle**: If destroyed, you lose.
- **Towers or automatic defenses**: Limited damage output.

Players must balance **offense and defense** via unit and building choices.

---

## 7. Endgame
- The match ends when a team's **castle** is destroyed.
- **Win condition**: Survive and out-push the enemy team.

Strategic considerations:
- Counter unit types (e.g., flying vs ranged).
- Synergies (e.g., healer units + tanks).
- Scaling (some units/buildings are strong early, others late).

---

## 🧠 AI Design Considerations

To replicate Castle Fight with AI:

### Game State Tracking
- Spawn timers
- Unit waves
- Gold/wood income
- Enemy unit detection

### AI Strategy Engine
- Choose race/buildings based on enemy composition.
- Adjust unit composition dynamically.
- Prioritize economy vs. aggression.

### Unit AI
- Simple pathfinding
- Attack nearest enemy in range
- Ability usage (if applicable)

### Build Placement AI
- Optimize build area layout
- Prioritize upgrades/removals

### Wave Simulation
- Handle wave merging
- Simulate unit combat
- Position and collision updates

---

