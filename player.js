class Player {
    constructor(game) {
        this.game = game;
        this.width = 40;
        this.height = 80;
        this.duckHeight = 40;
        this.normalHeight = 80;

        // Initial position
        this.x = 80;
        this.y = this.game.groundY - this.height;

        // Physics
        this.vy = 0;
        this.gravity = 1.2;
        this.jumpForce = -18;

        // State
        this.isJumping = false;
        this.isDucking = false;
        this.isDead = false;

        // Health
        this.isInvincible = false;
        this.invincibilityTimer = 0;

        // Animation
        this.runTimer = 0;
        this.color = '#3498db'; // Student shirt color
        this.pantsColor = '#34495e';
    }

    update(deltaTime) {
        if (this.isDead) return;

        if (this.isInvincible) {
            this.invincibilityTimer -= deltaTime;
            if (this.invincibilityTimer <= 0) {
                this.isInvincible = false;
            }
        }

        let dtFactor = deltaTime / 16.666;
        // Apply gravity
        this.vy += this.gravity * dtFactor;
        this.y += this.vy * dtFactor;

        // Ground collision validation
        if (this.y >= this.game.groundY - this.height) {
            this.y = this.game.groundY - this.height;
            this.vy = 0;
            this.isJumping = false;
        }

        // Animation timing
        if (!this.isJumping && !this.isDucking) {
            this.runTimer += deltaTime * this.game.gameSpeed * 0.05;
        } else {
            this.runTimer = 0; // Reset animation state when jumping/ducking
        }
    }

    jump() {
        if (!this.isJumping && !this.isDucking && !this.isDead) {
            this.vy = this.jumpForce;
            this.isJumping = true;
        }
    }

    duck() {
        if (!this.isJumping && !this.isDead) {
            this.isDucking = true;
            this.height = this.duckHeight;
            // Instantly push down to ground to match new height
            this.y = this.game.groundY - this.height;
        }
    }

    standUp() {
        if (this.isDucking) {
            this.isDucking = false;
            this.height = this.normalHeight;
            // Adjust y so player doesn't clip into ground
            this.y = this.game.groundY - this.height;
        }
    }

    die() {
        this.isDead = true;
    }

    makeInvincible() {
        this.isInvincible = true;
        this.invincibilityTimer = 1500;
    }

    // Modern drawing algorithm making the character look like a real organically curved person
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.isDead) {
            ctx.translate(this.width / 2, this.height);
            ctx.rotate(Math.PI / 2);
            ctx.translate(-this.width / 2, -this.height);
            this.y = this.game.groundY - this.width;
            ctx.globalAlpha = 0.5;
        } else if (this.isInvincible && Math.floor(Date.now() / 150) % 2 === 0) {
            ctx.globalAlpha = 0.5; // Damage flash effect
        }

        const centerX = this.width / 2;
        let frontLegAngle = Math.sin(this.runTimer) * (Math.PI / 4);
        let backLegAngle = Math.sin(this.runTimer + Math.PI) * (Math.PI / 4);
        
        if (this.isJumping) {
            frontLegAngle = -Math.PI / 6;
            backLegAngle = Math.PI / 5;
        } else if (this.isDucking) {
            frontLegAngle = -Math.PI / 3;
            backLegAngle = Math.PI / 3;
        }

        const bodyY = this.isDucking ? 15 : 0;
        const bodyH = this.isDucking ? 20 : 35;
        const headOffset = this.isDucking ? 2 : -15;
        const legsPivotY = bodyY + bodyH - 5;
        const legLen = this.isDucking ? 15 : 24;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // --- Back Leg ---
        ctx.strokeStyle = this.pantsColor;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(centerX, legsPivotY);
        ctx.quadraticCurveTo(
            centerX + Math.sin(backLegAngle) * legLen * 0.5, 
            legsPivotY + legLen * 0.5, 
            centerX + Math.sin(backLegAngle) * legLen, 
            legsPivotY + Math.cos(backLegAngle) * legLen
        );
        ctx.stroke();

        // --- Back Arm ---
        const armAngle1 = Math.sin(this.runTimer + Math.PI) * (Math.PI / 3);
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(centerX, bodyY + 10);
        ctx.quadraticCurveTo(
            centerX + Math.sin(armAngle1) * 10,
            bodyY + 20,
            centerX + Math.sin(armAngle1) * 18, 
            bodyY + 10 + Math.cos(armAngle1) * 18
        );
        ctx.stroke();

        // --- Organic Torso ---
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (this.isDucking) {
            ctx.ellipse(centerX, bodyY + bodyH/2, 16, 10, 0, 0, Math.PI * 2);
        } else {
            ctx.ellipse(centerX + 2, bodyY + bodyH/2, 12, bodyH/2 + 2, Math.PI/12, 0, Math.PI * 2);
        }
        ctx.fill();

        // --- Backpack ---
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.ellipse(centerX - 10, bodyY + bodyH/2 - 2, 8, 12, -Math.PI/12, 0, Math.PI * 2);
        ctx.fill();

        // --- Head & Hair ---
        ctx.fillStyle = '#f3c6a5';
        ctx.beginPath();
        ctx.arc(centerX + (this.isDucking ? 8 : 4), headOffset, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2c1635';
        ctx.beginPath();
        ctx.arc(centerX + (this.isDucking ? 6 : 2), headOffset - 4, 13, Math.PI*0.8, Math.PI * 2.2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(centerX + (this.isDucking ? 12 : 8), headOffset - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // --- Front Leg ---
        ctx.strokeStyle = this.pantsColor;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(centerX, legsPivotY);
        ctx.quadraticCurveTo(
            centerX + Math.sin(frontLegAngle) * legLen * 0.5, 
            legsPivotY + legLen * 0.5, 
            centerX + Math.sin(frontLegAngle) * legLen, 
            legsPivotY + Math.cos(frontLegAngle) * legLen
        );
        ctx.stroke();

        // --- Front Arm ---
        const armAngle2 = Math.sin(this.runTimer) * (Math.PI / 3);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(centerX, bodyY + 10);
        ctx.quadraticCurveTo(
            centerX + Math.sin(armAngle2) * 10,
            bodyY + 20,
            centerX + Math.sin(armAngle2) * 18, 
            bodyY + 10 + Math.cos(armAngle2) * 18
        );
        ctx.stroke();

        ctx.restore();
    }

    // Returns axis-aligned bounding box (AABB) for collision
    getHitbox() {
        return {
            x: this.x + 10,     // Tighten hitbox slightly to be forgiving
            y: this.y,
            w: this.width - 20, // Give some collision grace on the sides
            h: this.height
        };
    }
}
