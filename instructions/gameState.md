# Technical Requirements: Game Process Changes

## 1. Start Screen Changes
### 1.1. Interface Modification
- Replace existing "Play game" button with two separate elements:
  - "Play vs AI" button
  - "Play Online 1v1" button
- Maintain style and design in accordance with existing game UI/UX
- Add appropriate icons for each button to improve readability

### 1.2. Functional Requirements
- Buttons should respond to clicks with visual feedback (hover/active states)
- Position buttons in the same place where the single "Play game" button was previously
- Ensure correct display on all supported screen sizes

## 2. Play vs AI Mode
### 2.1. Session Creation Logic
- When clicking the "Play vs AI" button:
  - Server automatically creates a new game session
  - Server adds the current player (human) to the session
  - Server adds a virtual player (bot/AI) to the session
  - Unique session identifier is generated for future tracking

### 2.2. Transition to Race Selection
- After session creation, both players automatically proceed to the race selection screen
- Bot's race selection decision should be delayed by 1-3 seconds to simulate the selection process

## 3. Online 1v1 Mode
### 3.1. Queue System
- When clicking the "Play Online 1v1" button:
  - Player is added to the waiting queue
  - A waiting screen with opponent search indicator is displayed
  - Approximate waiting time and number of players in queue are shown
  - Option to cancel match search is available

### 3.2. Matchmaking Logic
- Server constantly monitors the waiting queue
- When 2 or more players are available:
  - A pair of players is selected on a "first come, first served" basis
  - A new game session is created
  - Both players are added to the session
  - Players are removed from the waiting queue

## 4. Pair Formation and Game Start
### 4.1. Session Creation for Player Pairs
- For identified player pairs:
  - Create a unique session identifier
  - Configure basic session parameters
  - Notify both players about successful pair formation
  - Redirect players to the race selection stage

## 5. Race Selection Stage
### 5.1. Race Selection Synchronization
- Implement a waiting mechanism for both players:
  - Each player selects a race from the list of available options
  - After selecting a race, player clicks the "Ready" button
  - An indicator shows the opponent's readiness status
  - Provide the ability to change race selection until both players have confirmed readiness

### 5.2. Readiness Confirmation
- When a player has selected a race:
  - "Ready to play" button is displayed
  - When clicked, player's status changes to "Ready"
  - Readiness information is sent to the server
  - Opponent receives notification about the player's readiness

### 5.3. Waiting for Readiness
- If one player is ready and the other is not:
  - Display "Waiting for opponent..." status
  - Add a waiting time counter (optional)
  - Provide the ability to cancel readiness

## 6. Game Start
### 6.1. Game Field Creation
- After both players confirm readiness:
  - Server generates the game field according to game parameters
  - Main bases for players are created on opposite sides of the field
  - Initial resources and units are initialized

### 6.2. Countdown
- Implement a 3-second countdown:
  - Display a large counter in the center of the screen
  - Provide appropriate sound effects
  - Animate number changes (3, 2, 1)
  - After countdown completion, show "Game Start!" or similar message
  - After countdown, unlock the ability to control units/base

## Technical Implementation Requirements
1. All changes must be compatible with the existing project architecture
2. Ensure a reliable synchronization mechanism between players
3. Implement error handling and network failure recovery
5. Test changes thoroughly before release