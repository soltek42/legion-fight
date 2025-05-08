// Game initialization
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.init();
    }

    init() {
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Initialize game state
        this.gameState = {
            isRunning: false,
            score: 0
        };

        // Start game loop
        this.gameLoop();
    }

    gameLoop() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update game state
        this.update();
        
        // Render game
        this.render();
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Update game logic here
    }

    render() {
        // Render game elements here
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const game = new Game();
}); 