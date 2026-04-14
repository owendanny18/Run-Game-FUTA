/**
 * Manages game obstacles including Kekes, Campus Shuttles, Potholes, and Overhead Signboards
 */
class Obstacle {
    constructor(game, type) {
        this.game = game;
        this.type = type; // 'keke', 'shuttle', 'pothole', 'sign'
        this.markedForDeletion = false;

        this.setupProperties();

        this.x = this.game.width;
    }

    setupProperties() {
        switch (this.type) {
            case 'coin':
                this.width = 30;
                this.height = 30;
                // Place randomly: either high (requires jump) or low (requires running/ducking)
                this.y = this.game.groundY - (Math.random() > 0.5 ? 110 : 40);
                this.points = 50;
                this.isCoin = true;
                break;
            case 'keke':
                this.width = 60;
                this.height = 45;
                this.y = this.game.groundY - this.height;
                this.points = 10;
                break;
            case 'shuttle':
                this.width = 120;
                this.height = 55;
                this.y = this.game.groundY - this.height;
                this.points = 20;
                break;
            case 'pothole':
                this.width = 50;
                this.height = 10;
                this.y = this.game.groundY - 5; // Embedded in the ground
                this.points = 5;
                break;
            case 'sign':
                this.width = 80;
                this.height = 90;
                // Signboard hangs from the top or is on a pole. 
                // We'll calculate collision carefully.
                // The actual solid part is the top board.
                this.y = this.game.groundY - 120; // High enough to duck under
                this.points = 15;

                // Randomly pick a signboard text
                const faculties = ["SESE", "SET", "SIIMES", "SEMS", "SOC", "SBMS", "SLS", "SAAT", "SPS"];
                this.text = faculties[Math.floor(Math.random() * faculties.length)];
                break;
        }
    }

    update(deltaTime) {
        let dtFactor = deltaTime / 16.666;
        // Move to the left based on game speed
        this.x -= this.game.gameSpeed * dtFactor;

        // Remove if it goes off screen on the left edge
        if (this.x + this.width < 0) {
            this.markedForDeletion = true;
            this.game.score += this.points; // Give points when successfully dodged
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        switch (this.type) {
            case 'keke':
                this.drawKeke(ctx);
                break;
            case 'shuttle':
                this.drawShuttle(ctx);
                break;
            case 'pothole':
                this.drawPothole(ctx);
                break;
            case 'sign':
                this.drawSignboard(ctx);
                break;
            case 'coin':
                this.drawCoin(ctx);
                break;
        }

        ctx.restore();

        // Debug Hitbox visualization
        // const h = this.getHitbox();
        // ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        // ctx.strokeRect(h.x, h.y, h.w, h.h);
    }

    // Draw Keke Napep (Tricycle)
    drawKeke(ctx) {
        // Main body (Yellow)
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        // Custom shape for tricycle profile
        ctx.moveTo(10, 0); // roof back
        ctx.lineTo(this.width - 15, 0); // roof front
        ctx.lineTo(this.width, 25); // hood front
        ctx.lineTo(this.width - 5, this.height - 10); // bottom front
        ctx.lineTo(5, this.height - 10); // bottom back
        ctx.lineTo(0, 15); // back slope
        ctx.fill();

        // Canopy opening/Window
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.moveTo(15, 5);
        ctx.lineTo(this.width - 25, 5);
        ctx.lineTo(this.width - 15, 20);
        ctx.lineTo(15, 20);
        ctx.fill();

        // Wheels
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(15, this.height - 5, 8, 0, Math.PI * 2); // rear wheel
        ctx.arc(this.width - 15, this.height - 5, 8, 0, Math.PI * 2); // front wheel
        ctx.fill();
    }

    // Draw Campus Shuttle Mini-bus
    drawShuttle(ctx) {
        // Main Body (White)
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.roundRect(0, 0, this.width, this.height - 10, 5);
        ctx.fill();

        // Blue Stripe down the middle
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(0, 20, this.width, 10);

        // Windows
        ctx.fillStyle = '#87CEFA';
        for (let i = 10; i < this.width - 30; i += 25) {
            ctx.fillRect(i, 5, 20, 13);
        }
        // Front Windshield
        ctx.fillRect(this.width - 25, 5, 15, 13);

        // Headlight
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.width - 5, 35, 4, 0, Math.PI * 2);
        ctx.fill();

        // Wheels
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(25, this.height - 5, 12, 0, Math.PI * 2); // rear diff
        ctx.arc(this.width - 25, this.height - 5, 12, 0, Math.PI * 2); // front diff
        ctx.fill();

        // Rims
        ctx.fillStyle = '#bdc3c7';
        ctx.beginPath();
        ctx.arc(25, this.height - 5, 5, 0, Math.PI * 2);
        ctx.arc(this.width - 25, this.height - 5, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw Pothole on road
    drawPothole(ctx) {
        ctx.fillStyle = '#333'; // Deep hole shadow
        ctx.beginPath();
        ctx.ellipse(this.width / 2, this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Some water puddle effect
        ctx.fillStyle = 'rgba(60, 100, 120, 0.6)';
        ctx.beginPath();
        ctx.ellipse(this.width / 2, this.height / 2, this.width / 2 - 5, this.height / 2 - 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw Overhead Signboard
    drawSignboard(ctx) {
        // Draw the pole
        ctx.fillStyle = '#7f8c8d'; // Metal gray
        ctx.fillRect(this.width - 15, 0, 10, 120);

        // Draw the Board
        ctx.fillStyle = '#27ae60'; // Green sign background
        ctx.fillRect(0, 0, this.width, 35);

        // Border
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, this.width - 4, 31);

        // Text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px "Press Start 2P", monospace, sans-serif';
        // Adjust for font loading fallback
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.width / 2 - 5, 17);
    }

    // Draw Coin
    drawCoin(ctx) {
        ctx.fillStyle = '#f1c40f'; // Gold
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#d4ac0d';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#d4ac0d';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', this.width / 2, this.height / 2 + 1);
    }

    getHitbox() {
        let hbx = this.x;
        let hby = this.y;
        let hbw = this.width;
        let hbh = this.height;

        // Refine hitbox to make the game fair
        switch (this.type) {
            case 'keke':
                hbx += 5; hbw -= 10;
                hby += 10; hbh -= 10;
                break;
            case 'shuttle':
                hbx += 5; hbw -= 15;
                hby += 5; hbh -= 5;
                break;
            case 'pothole':
                hbx += 15; hbw -= 30; // only the center really trips you
                hbh += 5; // extend up slightly
                break;
            case 'sign':
                // The dangerous part is the board itself, not the pole
                hbx += 0;
                hbw -= 15; // Ignore the pole on the right side for collision checking easily
                hbh = 40;  // Only the top 40px are dangerous
                break;
            case 'coin':
                hbx += 5; hbw -= 10;
                hby += 5; hbh -= 10;
                break;
        }

        return { x: hbx, y: hby, w: hbw, h: hbh };
    }
}

class ObstacleManager {
    constructor(game) {
        this.game = game;
        this.obstacles = [];
        this.spawnTimer = 0;
        this.minSpawnInterval = 1200; // ms between spawns
        this.maxSpawnInterval = 2500;
        this.nextSpawnTime = this.randomInterval();

        // Available obstacle types (weighted to give coins)
        this.types = ['keke', 'keke', 'pothole', 'sign', 'shuttle', 'coin', 'coin', 'coin'];
    }

    randomInterval() {
        // Speed up spawn rate as game speed increases
        let speedFactor = 1 + ((this.game.gameSpeed - 5) * 0.1);
        let min = this.minSpawnInterval / speedFactor;
        let max = this.maxSpawnInterval / speedFactor;
        return Math.random() * (max - min) + min;
    }

    update(deltaTime) {
        // Spawn mechanism
        this.spawnTimer += deltaTime;
        if (this.spawnTimer > this.nextSpawnTime) {
            this.spawn();
            this.spawnTimer = 0;
            this.nextSpawnTime = this.randomInterval();
        }

        // Update objects and filter out deleted ones
        this.obstacles.forEach(o => o.update(deltaTime));
        this.obstacles = this.obstacles.filter(o => !o.markedForDeletion);
    }

    draw(ctx) {
        this.obstacles.forEach(o => o.draw(ctx));
    }

    spawn() {
        // Pick random type
        const randType = this.types[Math.floor(Math.random() * this.types.length)];
        this.obstacles.push(new Obstacle(this.game, randType));
    }

    reset() {
        this.obstacles = [];
        this.spawnTimer = 0;
        this.nextSpawnTime = this.randomInterval();
    }
}
