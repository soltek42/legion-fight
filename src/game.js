// Game constants
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 5000;
const TILE_SIZE = 20;

// Unit types and costs
const UNIT_TYPES = {
    GENERAL: {
        type: 'general',
        cost: 0,
        health: 100,
        attack: 10,
        speed: 1
    },
    INFANTRY: {
        type: 'infantry',
        cost: 50,
        health: 50,
        attack: 10,
        speed: 2
    }
};

// Game state
const GameState = {
    MENU: 'menu',
    PREPARATION: 'preparation',
    BATTLE: 'battle',
    GAME_OVER: 'gameOver'
};

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = GameState.MENU;
        this.currentPlayer = 1;
        this.gold = { player1: 100, player2: 100 };
        this.units = {
            player1: [],
            player2: []
        };
        this.selectedUnitType = UNIT_TYPES.INFANTRY;
        this.preparationTime = 30; // seconds
        this.preparationTimer = this.preparationTime;
        this.lastTime = 0;
        
        this.init();
    }

    init() {
        // Set canvas size
        this.canvas.width = GAME_WIDTH;
        this.canvas.height = GAME_HEIGHT;
        
        // Initialize game elements
        this.drawGameField();
        this.setupEventListeners();
        
        // Start game loop
        this.gameLoop(0);
    }

    startNewGame() {
        // Reset game state
        this.state = GameState.PREPARATION;
        this.currentPlayer = 1;
        this.gold = { player1: 100, player2: 100 };
        this.units = {
            player1: [],
            player2: []
        };
        this.preparationTimer = this.preparationTime;
        
        // Hide start button
        const startButton = document.querySelector('.start-button');
        if (startButton) {
            startButton.style.display = 'none';
        }
        
        // Show unit buttons
        const unitButtons = document.querySelector('.unit-buttons');
        if (unitButtons) {
            unitButtons.style.display = 'flex';
        }
        
        // Show player turn indicator
        const turnIndicator = document.querySelector('.turn-indicator');
        if (turnIndicator) {
            turnIndicator.style.display = 'block';
        }
    }

    drawGameField() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.state === GameState.MENU) {
            // Draw menu background
            this.ctx.fillStyle = '#2a2a2a';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw game title
            this.ctx.fillStyle = '#ffd700';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Legion Fight', this.canvas.width / 2, this.canvas.height / 2 - 50);
            
            // Draw start button text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Click "Start Game" to begin', this.canvas.width / 2, this.canvas.height / 2 + 50);
        } else {
            // Draw background
            this.ctx.fillStyle = '#2a2a2a';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw battle corridor
            this.ctx.fillStyle = '#3a3a3a';
            this.ctx.fillRect(0, GAME_HEIGHT * 0.2, GAME_WIDTH, GAME_HEIGHT * 0.6);
            
            // Draw bases
            this.drawBase(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.2, 'Player 1 Base');
            this.drawBase(0, GAME_HEIGHT * 0.8, GAME_WIDTH, GAME_HEIGHT * 0.2, 'Player 2 Base');
        }
    }

    drawBase(x, y, width, height, label) {
        // Draw base area
        this.ctx.fillStyle = '#4a4a4a';
        this.ctx.fillRect(x, y, width, height);
        
        // Draw border
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // Draw label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(label, x + width/2, y + 30);
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.state === GameState.PREPARATION) {
                this.handleUnitPlacement(x, y);
            }
        });

        // Add start button
        const startButton = document.createElement('button');
        startButton.className = 'start-button';
        startButton.textContent = 'Start Game';
        startButton.onclick = () => this.startNewGame();
        document.getElementById('game-container').appendChild(startButton);

        // Add unit type selection buttons
        const unitButtons = document.createElement('div');
        unitButtons.className = 'unit-buttons';
        unitButtons.style.display = 'none'; // Hidden initially
        unitButtons.innerHTML = `
            <button onclick="game.selectUnitType('general')">General (Free)</button>
            <button onclick="game.selectUnitType('infantry')">Infantry (50 gold)</button>
        `;
        document.getElementById('game-container').appendChild(unitButtons);

        // Add turn indicator
        const turnIndicator = document.createElement('div');
        turnIndicator.className = 'turn-indicator';
        turnIndicator.style.display = 'none'; // Hidden initially
        document.getElementById('game-container').appendChild(turnIndicator);
    }

    selectUnitType(type) {
        this.selectedUnitType = UNIT_TYPES[type.toUpperCase()];
    }

    handleUnitPlacement(x, y) {
        const player = this.currentPlayer;
        const baseY = player === 1 ? 0 : GAME_HEIGHT * 0.8;
        const baseHeight = GAME_HEIGHT * 0.2;

        // Check if click is within player's base
        if (y >= baseY && y <= baseY + baseHeight) {
            // Check if player has enough gold
            if (this.gold[`player${player}`] >= this.selectedUnitType.cost) {
                // Check if it's the first unit (must be general)
                if (this.units[`player${player}`].length === 0 && this.selectedUnitType.type !== 'general') {
                    alert('First unit must be a General!');
                    return;
                }

                // Check if general already exists
                if (this.selectedUnitType.type === 'general' && 
                    this.units[`player${player}`].some(unit => unit.type === 'general')) {
                    alert('General already placed!');
                    return;
                }

                // Create new unit
                const unit = {
                    ...this.selectedUnitType,
                    x: Math.floor(x / TILE_SIZE) * TILE_SIZE,
                    y: Math.floor(y / TILE_SIZE) * TILE_SIZE,
                    currentHealth: this.selectedUnitType.health
                };

                // Add unit and deduct gold
                this.units[`player${player}`].push(unit);
                this.gold[`player${player}`] -= this.selectedUnitType.cost;
            } else {
                alert('Not enough gold!');
            }
        }
    }

    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Update game state
        if (this.state === GameState.PREPARATION) {
            this.preparationTimer -= deltaTime / 1000;
            if (this.preparationTimer <= 0) {
                this.startBattle();
            }
        } else if (this.state === GameState.BATTLE) {
            this.updateBattle(deltaTime);
        }

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw game field
        this.drawGameField();
        
        // Draw units
        this.drawUnits();
        
        // Draw UI
        this.drawUI();
        
        // Continue game loop
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    startBattle() {
        this.state = GameState.BATTLE;
        // Reset preparation timer for next round
        this.preparationTimer = this.preparationTime;
    }

    updateBattle(deltaTime) {
        // Move units
        this.units.player1.forEach(unit => {
            if (unit.y < GAME_HEIGHT * 0.8) {
                unit.y += unit.speed;
            }
        });

        this.units.player2.forEach(unit => {
            if (unit.y > GAME_HEIGHT * 0.2) {
                unit.y -= unit.speed;
            }
        });

        // Check for combat
        this.checkCombat();

        // Check for victory conditions
        this.checkVictoryConditions();
    }

    checkCombat() {
        // Check for unit collisions
        this.units.player1.forEach(unit1 => {
            this.units.player2.forEach(unit2 => {
                if (this.isColliding(unit1, unit2)) {
                    this.resolveCombat(unit1, unit2);
                }
            });
        });
    }

    isColliding(unit1, unit2) {
        return Math.abs(unit1.x - unit2.x) < TILE_SIZE &&
               Math.abs(unit1.y - unit2.y) < TILE_SIZE;
    }

    resolveCombat(unit1, unit2) {
        // Both units take damage
        unit1.currentHealth -= unit2.attack;
        unit2.currentHealth -= unit1.attack;

        // Remove dead units
        if (unit1.currentHealth <= 0) {
            this.units.player1 = this.units.player1.filter(u => u !== unit1);
            this.gold.player2 += 10; // Reward for killing enemy unit
        }
        if (unit2.currentHealth <= 0) {
            this.units.player2 = this.units.player2.filter(u => u !== unit2);
            this.gold.player1 += 10; // Reward for killing enemy unit
        }
    }

    checkVictoryConditions() {
        // Check if either player's general is dead
        const player1General = this.units.player1.find(u => u.type === 'general');
        const player2General = this.units.player2.find(u => u.type === 'general');

        if (!player1General) {
            this.endGame(2);
        } else if (!player2General) {
            this.endGame(1);
        }
    }

    endGame(winner) {
        this.state = GameState.GAME_OVER;
        alert(`Player ${winner} wins!`);
    }

    drawUnits() {
        // Draw player 1 units
        this.units.player1.forEach(unit => {
            this.drawUnit(unit);
        });
        
        // Draw player 2 units
        this.units.player2.forEach(unit => {
            this.drawUnit(unit);
        });
    }

    drawUnit(unit) {
        // Draw unit body
        this.ctx.fillStyle = unit.type === 'general' ? '#ffd700' : '#ffffff';
        this.ctx.fillRect(unit.x, unit.y, TILE_SIZE, TILE_SIZE);
        
        // Draw health bar
        const healthPercentage = unit.currentHealth / unit.health;
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(unit.x, unit.y - 5, TILE_SIZE * healthPercentage, 3);
        
        if (unit.type === 'general') {
            // Draw crown icon
            this.ctx.fillStyle = '#000000';
            this.ctx.beginPath();
            this.ctx.moveTo(unit.x + TILE_SIZE/2, unit.y);
            this.ctx.lineTo(unit.x + TILE_SIZE, unit.y + TILE_SIZE/2);
            this.ctx.lineTo(unit.x, unit.y + TILE_SIZE/2);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    drawUI() {
        if (this.state === GameState.MENU) {
            return; // Don't draw UI in menu state
        }

        // Draw current player indicator
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Current Player: ${this.currentPlayer}`, 20, 30);
        
        // Draw gold amounts
        this.ctx.fillText(`Player 1 Gold: ${this.gold.player1}`, 20, 60);
        this.ctx.fillText(`Player 2 Gold: ${this.gold.player2}`, 20, 90);
        
        // Draw game state
        this.ctx.fillText(`Game State: ${this.state}`, 20, 120);

        // Draw preparation timer
        if (this.state === GameState.PREPARATION) {
            this.ctx.fillText(`Time remaining: ${Math.ceil(this.preparationTimer)}s`, 20, 150);
        }

        // Update turn indicator
        const turnIndicator = document.querySelector('.turn-indicator');
        if (turnIndicator) {
            turnIndicator.textContent = `Player ${this.currentPlayer}'s Turn`;
            turnIndicator.style.color = this.currentPlayer === 1 ? '#ffd700' : '#ff6b6b';
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const game = new Game();
}); 