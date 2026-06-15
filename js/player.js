// Paper Boats — Player Controller
const Player = {
    x: 80,
    y: 80,
    speed: 48,
    dir: 'down',
    animFrame: 0,
    animTimer: 0,
    walking: false,
    canMove: true,
    width: 16,
    height: 24,

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.dir = 'down';
        this.animFrame = 0;
        this.walking = false;
        this.canMove = true;
    },

    lock() { this.canMove = false; },
    unlock() { this.canMove = true; },

    update(dt, collisionCheck) {
        if (!this.canMove || Dialogue.active) {
            this.walking = false;
            return;
        }

        let dx = 0, dy = 0;
        if (Engine.keys['ArrowLeft'] || Engine.keys['KeyA']) dx = -1;
        if (Engine.keys['ArrowRight'] || Engine.keys['KeyD']) dx = 1;
        if (Engine.keys['ArrowUp'] || Engine.keys['KeyW']) dy = -1;
        if (Engine.keys['ArrowDown'] || Engine.keys['KeyS']) dy = 1;

        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        if (dx !== 0 || dy !== 0) {
            // Set direction
            if (Math.abs(dx) > Math.abs(dy)) {
                this.dir = dx > 0 ? 'right' : 'left';
            } else {
                this.dir = dy > 0 ? 'down' : 'up';
            }

            const newX = this.x + dx * this.speed * dt;
            const newY = this.y + dy * this.speed * dt;

            // Collision check
            if (!collisionCheck || !collisionCheck(newX, newY)) {
                this.x = newX;
                this.y = newY;
            } else {
                // Try axis-separated movement
                if (!collisionCheck(newX, this.y)) {
                    this.x = newX;
                } else if (!collisionCheck(this.x, newY)) {
                    this.y = newY;
                }
            }

            this.walking = true;
            this.animTimer += dt;
            if (this.animTimer >= 0.15) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }
        } else {
            this.walking = false;
            this.animFrame = 0;
        }
    },

    render(ctx, cameraX, cameraY) {
        const animName = this.walking ? `walk_${this.dir}` : `idle_${this.dir}`;
        const frame = Sprites.getFrame('minh', animName, this.animFrame);
        if (frame) {
            ctx.drawImage(frame,
                Math.floor(this.x - cameraX - 8),
                Math.floor(this.y - cameraY - 20)
            );
        }
    },
};
