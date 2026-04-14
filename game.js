class Game {
    constructor(canvas, uiCtx) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ui = uiCtx;

        this.width = canvas.width;
        this.height = canvas.height;
        this.groundY = this.height - 80; // Calculate ground position

        this.gameSpeed = 0; // Starts at 0, increases when playing
        this.baseSpeed = 4; // Moderate starting speed
        this.score = 0;
        this.lives = 3;
        this.highScore = localStorage.getItem('futaRunnerHighScore') || 0;

        // Time tracking for delta
        this.lastTime = 0;

        // Game states: 'START', 'PLAYING', 'GAMEOVER'
        this.state = 'START';

        // Initialize systems
        this.background = new Background(this);
        this.player = new Player(this);
        this.obstacleManager = new ObstacleManager(this);

        this.setupInput();
        this.updateScoreDisplay();
    }

    setupInput() {
        window.addEventListener('keydown', e => {
            if (this.state !== 'PLAYING') return;

            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault(); // Stop scrolling
                this.player.jump();
            } else if (e.code === 'ArrowDown') {
                e.preventDefault();
                this.player.duck();
            }
        });

        window.addEventListener('keyup', e => {
            if (e.code === 'ArrowDown') {
                this.player.standUp();
            }
        });

        // Touch controls support
        this.canvas.addEventListener('touchstart', e => {
            if (this.state !== 'PLAYING') return;
            // Basic jump on tap anywhere, we could split left/right for duck/jump
            // Let's implement full screen tap as jump for simplicity
            const tY = e.touches[0].clientY;
            // If touch is in bottom half, duck, otherwise jump
            if (tY > window.innerHeight / 2 + 100) {
                this.player.duck();
            } else {
                this.player.jump();
            }
        }, { passive: true });

        this.canvas.addEventListener('touchend', e => {
            this.player.standUp();
        }, { passive: true });
    }

    pause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.ui.showPause();
        }
    }

    resume() {
        if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.ui.hideScreens();
            // Reset timing lock so it doesn't think 5 hours passed instantly
            this.lastTime = performance.now();
            this.loop(this.lastTime);
        }
    }

    start() {
        this.state = 'PLAYING';
        this.gameSpeed = this.baseSpeed;
        this.score = 0;
        this.lives = 3;
        this.updateScoreDisplay();
        this.player = new Player(this); // Reset player
        this.obstacleManager.reset();
        this.ui.hideScreens();

        // Reset timing lock
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    gameOver(reason) {
        this.state = 'GAMEOVER';
        this.gameSpeed = 0;
        this.player.die();

        if (Math.floor(this.score) > this.highScore) {
            this.highScore = Math.floor(this.score);
            localStorage.setItem('futaRunnerHighScore', this.highScore);
            this.updateScoreDisplay(); // Show new high score
        }

        this.ui.showGameOver(Math.floor(this.score), reason);
    }

    updateScoreDisplay() {
        this.ui.elScore.innerText = Math.floor(this.score);
        this.ui.elHiScore.innerText = this.highScore;
        this.ui.elLives.innerText = this.lives;
    }

    // AABB Collision routine
    checkCollision() {
        const ph = this.player.getHitbox();

        for (let obs of this.obstacleManager.obstacles) {
            const oh = obs.getHitbox();

            if (ph.x < oh.x + oh.w &&
                ph.x + ph.w > oh.x &&
                ph.y < oh.y + oh.h &&
                ph.y + ph.h > oh.y) {

                if (obs.isCoin) {
                    obs.markedForDeletion = true;
                    this.score += 50;
                    this.lives = Math.min(5, this.lives + 1); // Max 5 lives
                    this.updateScoreDisplay();
                    continue;
                }

                if (this.player.isInvincible) continue;

                // Hit damage
                this.lives--;
                this.updateScoreDisplay();
                
                if (this.lives > 0) {
                    // Start invincibility frames
                    this.player.makeInvincible();
                    // Knock away the obstacle you hit so you don't instantly get hit again
                    obs.markedForDeletion = true;
                    continue;
                }

                // Collision happened! Let's build a witty reason based on obstacle type
                let reason = "You tripped on campus!";
                if (obs.type === 'keke') reason = "Flattened by a Keke Napep!";
                if (obs.type === 'shuttle') reason = "Hit by the Campus Shuttle!";
                if (obs.type === 'sign') reason = `Smacked your head on ${obs.text} signboard!`;
                if (obs.type === 'pothole') reason = "Tripped into a massive pothole!";

                this.gameOver(reason);
                return;
            }
        }
    }

    // Main Game Loop updates and draws everything sequentially
    loop(timestamp) {
        if (this.state !== 'PLAYING') {
            // We only stop the animation frame if entirely dead, but we want 
            // to still draw the dead state, so we just return out of the recursive call.
            // When restart happens, start() kicks off loop() again.
            this.draw(); // Draw final frame
            return;
        }

        // Calculate DeltaTime (capped to prevent massive jumps when tab is backgrounded)
        let deltaTime = timestamp - this.lastTime;
        if (deltaTime > 100) deltaTime = 100;
        this.lastTime = timestamp;

        // Increase score passively (10 per second)
        this.score += 0.01 * deltaTime;
        // Slowly increase game speed for difficulty curve (more gradual)
        this.gameSpeed += 0.0002 * deltaTime;

        // Update components
        this.background.update(deltaTime);
        this.player.update(deltaTime);
        this.obstacleManager.update(deltaTime);

        this.checkCollision();

        // Update UI DOM
        if (Math.floor(this.score) % 10 === 0) { // Micro-optimization: only update DOM occasionally if needed
            this.updateScoreDisplay();
        }

        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    draw() {
        // Clear canvas implicitly by Background filling rect, but good practice
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Render order matters (Back to front)
        this.background.draw(this.ctx);
        this.obstacleManager.draw(this.ctx);
        this.player.draw(this.ctx);
    }
}
