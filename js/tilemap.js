// Paper Boats — Tilemap & World Rendering
const TileMap = {
    TILE_SIZE: 16,

    // Tile types
    TILES: {
        GRASS: 0,
        DIRT: 1,
        WATER: 2,
        TREE: 3,
        HOUSE: 4,
        WALL: 5,
        BAMBOO: 6,
        BANYAN: 7,
        SHRINE: 8,
        LANTERN: 9,
        STONE: 10,
        BRIDGE: 11,
        FENCE: 12,
        LOTUS: 13,
        GRAVE: 14,
        DOOR: 15,
        FLOOR: 16,
        SHELF: 17,
    },

    // Color palette per tile
    getTileColor(tile, chapter) {
        const warm = chapter <= 2;
        const doubt = chapter === 3;

        switch (tile) {
            case 0: return warm ? '#4a7a3a' : (doubt ? '#3a6a30' : '#3a5a2a');  // grass
            case 1: return warm ? '#a08060' : '#907050';  // dirt
            case 2: return warm ? '#4a80a0' : '#3a6888';  // water
            case 3: return '#2a5a2a';  // tree
            case 4: return '#8a7060';  // house
            case 5: return '#7a6a5a';  // wall
            case 6: return '#3a6a30';  // bamboo
            case 7: return '#5a4a30';  // banyan
            case 8: return '#8a4040';  // shrine
            case 9: return '#e8c040';  // lantern
            case 10: return '#888888'; // stone
            case 11: return '#907050'; // bridge
            case 12: return '#a09070'; // fence
            case 13: return '#c08090'; // lotus
            case 14: return '#707070'; // grave
            case 15: return '#6a5a40'; // door
            case 16: return '#907a60'; // floor
            case 17: return '#6a5a40'; // shelf
            default: return '#000';
        }
    },

    isBlocking(tile) {
        return [2, 3, 4, 5, 6, 7, 8, 12, 14, 17].includes(tile);
    },

    // Render a map
    renderMap(ctx, map, cameraX, cameraY, chapter = 1) {
        const startCol = Math.floor(cameraX / this.TILE_SIZE);
        const startRow = Math.floor(cameraY / this.TILE_SIZE);
        const endCol = startCol + Math.ceil(Engine.W / this.TILE_SIZE) + 1;
        const endRow = startRow + Math.ceil(Engine.H / this.TILE_SIZE) + 1;

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) continue;
                const tile = map[row][col];
                const x = col * this.TILE_SIZE - cameraX;
                const y = row * this.TILE_SIZE - cameraY;

                ctx.fillStyle = this.getTileColor(tile, chapter);
                ctx.fillRect(Math.floor(x), Math.floor(y), this.TILE_SIZE, this.TILE_SIZE);

                // Add tile details
                this.drawTileDetails(ctx, tile, Math.floor(x), Math.floor(y), chapter);
            }
        }
    },

    drawTileDetails(ctx, tile, x, y, chapter) {
        switch (tile) {
            case 0: // Grass - random dots
                ctx.fillStyle = chapter <= 2 ? '#5a8a4a' : '#4a7a3a';
                if ((x * 7 + y * 13) % 5 === 0) ctx.fillRect(x + 3, y + 5, 1, 1);
                if ((x * 11 + y * 3) % 7 === 0) ctx.fillRect(x + 10, y + 8, 1, 1);
                if ((x * 3 + y * 7) % 6 === 0) {
                    ctx.fillStyle = '#6a9a5a';
                    ctx.fillRect(x + 7, y + 3, 1, 2);
                }
                break;
            case 1: // Dirt path
                ctx.fillStyle = '#b09070';
                if ((x * 3 + y) % 7 === 0) ctx.fillRect(x + 4, y + 6, 2, 1);
                break;
            case 2: // Water - ripples
                const ripple = Math.sin((Engine.frameCount + x + y) * 0.05);
                ctx.fillStyle = ripple > 0 ? '#5a90b0' : '#4a80a0';
                ctx.fillRect(x + 4, y + 4 + Math.floor(ripple), 8, 1);
                break;
            case 3: // Tree
                ctx.fillStyle = '#1a4a1a';
                ctx.fillRect(x + 6, y + 8, 4, 8); // trunk
                ctx.fillStyle = chapter <= 2 ? '#3a7a2a' : '#2a6a20';
                ctx.fillRect(x + 2, y + 1, 12, 8); // canopy
                break;
            case 7: // Banyan tree
                ctx.fillStyle = '#4a3a20';
                ctx.fillRect(x + 2, y + 4, 12, 12); // massive trunk
                ctx.fillStyle = '#3a6a2a';
                ctx.fillRect(x, y, 16, 6); // canopy
                // Roots
                ctx.fillStyle = '#5a4a30';
                ctx.fillRect(x, y + 12, 3, 4);
                ctx.fillRect(x + 13, y + 12, 3, 4);
                // Red cloth
                ctx.fillStyle = '#c04040';
                ctx.fillRect(x + 4, y + 2, 1, 3);
                break;
            case 8: // Shrine
                ctx.fillStyle = '#a05050';
                ctx.fillRect(x + 2, y + 4, 12, 8);
                ctx.fillStyle = '#c8a060';
                ctx.fillRect(x + 4, y + 2, 8, 2); // roof
                // Incense
                ctx.fillStyle = '#e8c040';
                const flicker = Math.sin(Engine.frameCount * 0.1) > 0;
                if (flicker) ctx.fillRect(x + 7, y + 1, 2, 1);
                break;
            case 4: // House
                ctx.fillStyle = '#9a8070';
                ctx.fillRect(x + 1, y + 1, 14, 14);
                ctx.fillStyle = '#b09880';
                ctx.fillRect(x + 2, y, 12, 2); // roof
                ctx.fillStyle = '#6a5040';
                ctx.fillRect(x + 6, y + 10, 4, 6); // door
                break;
            case 9: // Lantern
                const glow = 0.7 + 0.3 * Math.sin(Engine.frameCount * 0.08);
                ctx.fillStyle = `rgba(232, 192, 64, ${glow})`;
                ctx.fillRect(x + 5, y + 2, 6, 8);
                ctx.fillStyle = '#c04040';
                ctx.fillRect(x + 6, y + 3, 4, 6);
                break;
            case 14: // Grave
                ctx.fillStyle = '#888888';
                ctx.fillRect(x + 4, y + 2, 8, 12);
                ctx.fillStyle = '#999999';
                ctx.fillRect(x + 5, y + 1, 6, 2);
                break;
            case 16: // Floor (indoor)
                ctx.fillStyle = '#a08a70';
                if ((x + y) % 32 < 16) ctx.fillRect(x, y, 16, 1);
                break;
        }
    },

    checkCollision(map, x, y, w = 10, h = 6) {
        // Check the player's feet area
        const points = [
            [x - w/2, y - h/2],
            [x + w/2, y - h/2],
            [x - w/2, y + h/2],
            [x + w/2, y + h/2],
        ];

        for (const [px, py] of points) {
            const col = Math.floor(px / this.TILE_SIZE);
            const row = Math.floor(py / this.TILE_SIZE);
            if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return true;
            if (this.isBlocking(map[row][col])) return true;
        }
        return false;
    },
};

// NPC class
class NPC {
    constructor(name, spriteName, x, y, dir = 'down', isGhost = false) {
        this.name = name;
        this.spriteName = spriteName;
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.isGhost = isGhost;
        this.visible = true;
        this.alpha = isGhost ? 0.88 : 1;
        this.animFrame = 0;
        this.animTimer = 0;
        this.flickerTimer = 0;
    }

    update(dt) {
        if (this.isGhost) {
            this.flickerTimer += dt;
            if (this.flickerTimer > 3 + Math.random() * 2) {
                this.alpha = 0.75;
                setTimeout(() => { this.alpha = 0.88; }, 100);
                this.flickerTimer = 0;
            }
        }
    }

    render(ctx, cameraX, cameraY) {
        if (!this.visible) return;
        const frame = Sprites.getFrame(this.spriteName, `idle_${this.dir}`, 0);
        if (!frame) return;

        ctx.globalAlpha = this.alpha;
        ctx.drawImage(frame,
            Math.floor(this.x - cameraX - 8),
            Math.floor(this.y - cameraY - 20)
        );
        ctx.globalAlpha = 1;
    }

    distTo(px, py) {
        return Math.hypot(this.x - px, this.y - py);
    }
}

// Hotspot class
class Hotspot {
    constructor(x, y, w, h, id, label = '') {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.id = id;
        this.label = label;
        this.active = true;
        this.triggered = false;
    }

    containsPoint(px, py) {
        return this.active && px >= this.x && px < this.x + this.w && py >= this.y && py < this.y + this.h;
    }

    render(ctx, cameraX, cameraY) {
        if (!this.active) return;
        // Subtle glow indicator
        const glow = 0.2 + 0.1 * Math.sin(Engine.frameCount * 0.06);
        ctx.fillStyle = `rgba(255, 215, 0, ${glow})`;
        ctx.fillRect(
            Math.floor(this.x - cameraX),
            Math.floor(this.y - cameraY),
            this.w, this.h
        );
    }
}
