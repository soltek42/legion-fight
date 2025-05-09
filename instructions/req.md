# Legion Fight - Game Requirements

## Game Overview
Legion Fight is a two-player strategy game where players command armies in a battle for territory. The game features a turn-based combat system with real-time battles.

## Game Rules
1. Game Field
   - Size: 1000 x 5000 units (tiles)
   - Two bases on opposite sides
   - Connected by a battle corridor
   - Each base has a deployment area for units

2. Game Flow
   - Players start by placing their generals in their base
   - Each round, all units from the base march into battle
   - Players earn gold during battles
   - Gold can be spent to purchase new units
   - Between rounds, players have time to prepare their next wave

3. Victory Conditions
   - Win by killing the opponent's general during the preparation phase
   - Lose if your general is killed before entering battle

## Unit Types
1. General
   - Health: 100 HP
   - Attack: 10
   - Special: Must be protected during preparation phase

2. Infantry
   - Health: 50 HP
   - Attack: 10
   - Basic combat unit

## Visual Representation
- Lines: Walls
- Squares: Infantry units
- Crown icon: General
- Simple geometric shapes for initial implementation

## Technical Implementation
1. Core Systems
   - [ ] Canvas-based rendering
   - [ ] Turn management system
   - [ ] Unit placement system
   - [ ] Combat resolution system
   - [ ] Resource (gold) management
   - [ ] Unit movement and pathfinding

2. Game States
   - [ ] Preparation phase
   - [ ] Battle phase
   - [ ] Resource collection
   - [ ] Unit deployment
   - [ ] Victory/Defeat conditions

3. UI Elements
   - [ ] Game field display
   - [ ] Unit selection interface
   - [ ] Resource counter
   - [ ] Turn indicator
   - [ ] Unit placement controls

## Development Phases
1. Phase 1: Core Mechanics
   - Basic game field rendering
   - Unit placement system
   - Simple movement system
   - Basic combat resolution

2. Phase 2: Game Flow
   - Turn management
   - Resource system
   - Unit purchasing
   - Victory conditions

3. Phase 3: Polish
   - Improved visuals
   - Sound effects
   - UI improvements
   - Animation system

## Technical Requirements
1. Browser Compatibility
   - Modern browsers (Chrome, Firefox, Safari, Edge)
   - Canvas support required

2. Performance
   - Smooth unit movement
   - Efficient pathfinding
   - Responsive UI

3. Controls
   - Mouse-based unit placement
   - Drag and drop interface
   - Clear visual feedback

## Questions to Consider
1. Should there be different types of infantry units?
2. How should the gold economy be balanced?
3. What should be the duration of preparation phases?
4. Should there be any special abilities for units?
5. How should the battle corridor be structured?
6. Should there be any defensive structures?
7. How should unit movement speed be implemented?
8. What should be the initial gold amount for players?

Please provide feedback and additional requirements to help shape the game's development. 