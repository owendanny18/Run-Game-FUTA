class Background {
    constructor(game) {
        this.game = game;

        // Parallax layers config
        this.layers = [
            { speedMult: 0.1, render: this.drawSkyline.bind(this) },
            { speedMult: 0.3, render: this.drawDistantTrees.bind(this) },
            { speedMult: 0.6, render: this.drawCampusBuildings.bind(this) }
        ];

        // Track offset for scrolling
        this.offsets = [0, 0, 0];
        this.roadOffset = 0;

        // Generate building data once to randomly loop through
        this.buildingData = [];
        for (let i = 0; i < 10; i++) {
            this.buildingData.push({
                width: 150 + Math.random() * 200,
                height: 100 + Math.random() * 150,
                color: this.getRandomBldgColor(),
                windows: Math.floor(Math.random() * 4) + 2,
                gap: 50 + Math.random() * 150
            });
        }

    }

    getRandomBldgColor() {
        // Campus pastel/concrete colors
        const colors = ['#bdc3c7', '#95a5a6', '#7f8c8d', '#d7ccc8', '#bcaaa4'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(deltaTime) {
        let dtFactor = deltaTime / 16.666;
        // Update layer offsets based on game speed
        for (let i = 0; i < this.layers.length; i++) {
            this.offsets[i] -= this.game.gameSpeed * this.layers[i].speedMult * dtFactor;
            // Wrap around (assuming width is 1000 for loop pattern)
            if (this.offsets[i] <= -2000) this.offsets[i] = 0;
        }

        // Road scroll offset
        this.roadOffset -= this.game.gameSpeed * dtFactor;
        if (this.roadOffset <= -100) this.roadOffset = 0;
    }

    draw(ctx) {
        // Fill base sky
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, this.game.width, this.game.groundY);

        // Draw Parallax Layers
        for (let i = 0; i < this.layers.length; i++) {
            ctx.save();
            ctx.translate(this.offsets[i], 0);
            this.layers[i].render(ctx);

            // Draw again for seamless looping
            ctx.translate(2000, 0);
            this.layers[i].render(ctx);
            ctx.restore();
        }

        this.drawGround(ctx);
    }

    drawSkyline(ctx) {
        // Small distant hills/buildings
        ctx.fillStyle = '#bdc3c7';
        ctx.beginPath();
        for (let x = 0; x < 2000; x += 100) {
            let h = 50 + Math.sin(x / 50) * 30;
            ctx.rect(x, this.game.groundY - h, 100, h);
        }
        ctx.fill();

        // Draw FUTA Sun or decorative cloud
        ctx.fillStyle = '#f1c40f'; // Sun
        ctx.beginPath();
        ctx.arc(300, 100, 40, 0, Math.PI * 2);
        ctx.fill();
    }

    drawDistantTrees(ctx) {
        ctx.fillStyle = '#27ae60';
        for (let x = 20; x < 2000; x += 120) {
            ctx.beginPath();
            ctx.moveTo(x, this.game.groundY);
            ctx.lineTo(x + 30, this.game.groundY - 80 - Math.random() * 40);
            ctx.lineTo(x + 60, this.game.groundY);
            ctx.fill();
        }
    }

    drawCampusBuildings(ctx) {
        let curX = 0;
        for (let i = 0; i < 15; i++) {
            // cycle through pregenerated building data
            let b = this.buildingData[i % this.buildingData.length];

            ctx.fillStyle = b.color;
            let by = this.game.groundY - b.height;
            ctx.fillRect(curX, by, b.width, b.height);

            // Roof accent
            ctx.fillStyle = '#4a235a'; // FUTA purple touch
            ctx.fillRect(curX, by, b.width, 10);

            // Windows
            ctx.fillStyle = '#34495e';
            let winWidth = (b.width - (b.windows * 10) - 10) / b.windows;
            for (let level = by + 20; level < this.game.groundY - 30; level += 40) {
                for (let w = 0; w < b.windows; w++) {
                    ctx.fillRect(curX + 10 + w * (winWidth + 10), level, winWidth, 20);
                }
            }

            curX += b.width + b.gap;
        }
    }

    drawGround(ctx) {
        const roadH = this.game.height - this.game.groundY;

        // Walkway/Curb
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(0, this.game.groundY, this.game.width, 15);
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(0, this.game.groundY + 15, this.game.width, 5);

        // Actual Asphalt Road
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, this.game.groundY + 20, this.game.width, roadH - 20);

        // Moving Road dashes
        ctx.fillStyle = '#f1c40f'; // Yellow line
        for (let x = this.roadOffset; x < this.game.width; x += 100) {
            ctx.fillRect(x, this.game.groundY + 30 + roadH / 2, 60, 8);
        }
    }
}
