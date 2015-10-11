/**
* @description Represents a new game
* @constructor
*/
var Game = function(){
    // Game Settings
    this.tileWidth = 101;
    this.tileHeight = 83;
    /** 
     * Sets game difficulty. 
     * Use to increase winning score and inrease enemy speed.
     * This property is only accessed from the source code.
     * 1 easy
     * 2 normal
     * 3 hard
     */
    this.difficulty = 1;
    // Score settings
    this.scoreInitial = 1000;
    this.scoreWinning = this.scoreInitial + (this.difficulty * 200);
    this.scoreStates = {
        // Score color states. Use to change score color in player updates.
        normal: {
            color: 'blue'
        },
        warning: {
            threshold: this.scoreInitial / 3,
            color: 'orange'
        },
        critical: {
            threshold: this.scoreInitial / 6,
            color: 'red'
        },
        win: {
            color: 'green'
        },
        lose: {
            color: 'red'
        }
    };
    // Canvas font
    this.textFont = '16pt Courier New'; 
    // Game states
    this.over = false;
    this.paused = false;
    // Audio
    this.audio = {
        // Sound on/off
        muted: false,
        // Load audio files
        coin: new Audio('audio/coin.wav'),
        collide: new Audio('audio/collide.wav'),
        splash: new Audio('audio/splash.wav')
    };
};
/**
* @description Starts new Game. Instantiates all game entities
*/
Game.prototype.start = function(){
    this.player = new Player();
    this.enemies = [];
    this.gem = new Gem();
    for (var i = 0, enemies = 4; i < enemies; i++) {
        this.enemies.push(new Enemy(-game.tileWidth, game.tileHeight * (i + 1)));
    }
};
/**
* @description Checks if game is in-progress
*/
Game.prototype.isRunning = function(){
    return (!this.over && !this.paused);
};
// Play game sound effects
Game.prototype.playSFX = function(SFX){
    if (!this.audio.muted) {
        switch(SFX){
            case 'coin': 
                this.audio.coin.play();
                break;
            case 'collide':
                this.audio.collide.play();
                break;
            case 'splash':
                this.audio.splash.play();
                break;
        }
    }
};

/**
* @description Represents an enemy
* @constructor 
* @param {number} x - canvas x coordinates
* @param {number} y - canvas y coordinates
*/
var Enemy = function(x, y) {
    // The image/sprite for our enemies
    this.sprite = 'images/enemy-bug.png';
    // Adjust size to be relative to tiles
    this.spriteWidth = game.tileWidth / 2;
    this.spriteHeight = game.tileHeight;
    // Set initial coordinates. Adjust enemy y position to center of tile. 
    this.x = x;
    this.y = y + this.spriteHeight / 2;
    // Set enemy speed
    this.setSpeed();
};
/**
* @description Sets speed on enemy instance
*/
Enemy.prototype.setSpeed = function() {
     /* Use game difficulty to increase the speed limit of enemies.
      * Add game tileWidth to set a baseline speed and ensure enemies don't move veeerryyy slow.
      */
    this.speed = Math.floor(Math.random() * (game.difficulty * game.tileWidth)) + game.tileWidth;
};
/**
* @description Updates enemy position
* @param {number} dt - a time delta between ticks to keep frame rate constant 
*/
Enemy.prototype.update = function(dt) {
    if (game.isRunning()) {
        // You should multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
        this.x = this.x + (dt * this.speed);
        // if enemy is right off canvas reset position
        if (this.x > c_width) {
            this.reset();
        }
    }
};
/**
* @description Moves enemy instance left off canvas and sets new speed
*/
Enemy.prototype.reset = function() {
    this.x = 0 - Math.random() * (3 * game.tileWidth);
    this.setSpeed();
};
/**
* @description Draws enemy on canvas
*/
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.spriteWidth, this.spriteHeight);
};

/**
* @description Represents the player
* @constructor 
*/var Player = function(){
    this.sprite = 'images/char-horn-girl.png';
    // Set player starting coordinates.
    this.X = 3 * game.tileWidth;
    this.Y = 5 * game.tileHeight;
    // Set initial coordinates
    this.x = this.X;
    this.y = this.Y;
    // Set player starting score
    this.score = game.scoreInitial;
};
/**
* @description Updates player state
*/
Player.prototype.update = function() {
    if (game.isRunning()) {
        if (this.hasWon()) {
            // Game Won
            game.over = true;
            this.drawScore('win');
        }
        else if (this.hasLost()) {
            // Game Lost
            game.over = true;
            this.drawScore('lose');
        }
        else {
            // Update Player Score
            this.updateScore();
        }
    }
};
/**
* @description Checks if player has won the game
* @returns {boolean}  
*/ 
Player.prototype.hasWon = function() {
    return (this.score >= game.scoreWinning);
};
/**
* @description Checks if player has lost the game
* @returns {boolean}  
*/ 
Player.prototype.hasLost = function() {
    return (this.score <= 0);
};
/**
* @description Updates player score
*/ 
Player.prototype.updateScore = function(a){
    // Decrease player score.
    this.score--;
    // Apply score color states
    // Warning
    if(this.isWarning()) {
        this.drawScore('warning');
    }
    // Critical
    else if(this.isCritical()){
        this.drawScore('critical');
    }          
    else {
    // Normal
        this.drawScore('normal');
    }      
};
/**
* @description Draws player score on canvas
*/ 
Player.prototype.drawScore = function(state){
    // Set scoreboard
    var scoreboard;
    if (state === 'win' || state === 'lose') {
        scoreBoard = 'You '+ state.toUpperCase() +'. Press SPACE to restart';
    }
    else {
        scoreBoard = 'SCORE' + ' ' + this.score + ' of ' + game.scoreWinning + '.';
    }
    // Draw scoreboard on canvas
    ctx.font = game.textFont;
    ctx.fillStyle = game.scoreStates[state].color;
    ctx.clearRect(0,0,800,400);
    ctx.fillText(scoreBoard, 0, 30);
};
/**
* @description Checks if player score is in a warning state
* @returns {boolean}  
*/ 
Player.prototype.isWarning = function(){
    return (this.score <= game.scoreStates.warning.threshold && this.score > game.scoreStates.critical.threshold);
};
/**
* @description Checks if player score is in a critical state
* @returns {boolean}  
*/ 
Player.prototype.isCritical = function(){
    return (this.score <= game.scoreStates.critical.threshold);
};
/**
* @description Renders player on canvas
*/ 
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
/**
* @description Handles keyboard input
*/ 
Player.prototype.handleInput = function(key) {
    if (key === 'spacebar') {
        if(game.over){
            // Re-assign game to a new Game instance and restart.
            game = new Game();
            game.start();
        }
        else {
            // Toggle pause.
            game.paused = !game.paused;
        }
    }
    else if (game.isRunning()) {
        switch(key) { 
            case 'up':
                /* Check if move to be executed is within boundaries.
                 * The water tile is taken into consideration as well.
                 */
                if(this.y - game.tileHeight >= 0 + game.tileHeight){
                    this.y -= game.tileHeight;
                }
                else {
                    // Water tile reached.
                    game.playSFX('splash');
                    // Reset player position.
                    this.reset();
                }
                break;   
            case 'down':
                this.y += (this.y + game.tileHeight < c_height - game.tileHeight) ? game.tileHeight : 0;
                break;
            case 'right':
                this.x += (this.x + game.tileWidth < c_width) ? game.tileWidth : 0;
                break;
            case 'left':
                this.x += (this.x - game.tileWidth >= 0) ? (-game.tileWidth) : 0;
                break;
            case 'M':
                // Toggle mute.
                game.audio.muted = !game.audio.muted;
        }
    }
};
/**
* @description Resets player to start position
*/ 
Player.prototype.reset = function(){
    this.x = this.X;
    this.y = this.Y;
};
/**
* @description Represents a gem
* @constructor 
*/ 
var Gem = function(){
    this.sprite = 'images/Gem Orange.png';
    // Adjust sprite dimensions
    this.spriteWidth = game.tileWidth / 2;
    this.spriteHeight = game.tileHeight;
    // Randomize gem position and align on tiles
    this.x = (Math.floor(Math.random() * 7) + 1) * game.tileWidth - (this.spriteWidth + this.spriteWidth / 2);
    this.y = (Math.floor(Math.random() * 5) + 1) * game.tileHeight + game.tileHeight / 2;
};
/**
* @description Replaces current gem with a new gem
*/ 
Gem.prototype.reset = function(){
    if (game.isRunning()) {
        game.gem = new Gem();
    }
};
/**
* @description Draws gem on canvas
*/ 
Gem.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.spriteWidth, this.spriteHeight);
};

// Create and start game
var game = new Game();
game.start();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        32: 'spacebar',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        77: 'M'
    };

    game.player.handleInput(allowedKeys[e.keyCode]);
});
