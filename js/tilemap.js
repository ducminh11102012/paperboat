// Paper Boats — Tilemap & World Rendering (Kenney CC0 atlas + autotiling)
const TileMap = {
    TILE_SIZE: 16,

    TILES: {
        GRASS: 0, DIRT: 1, WATER: 2, TREE: 3, HOUSE: 4, WALL: 5,
        BAMBOO: 6, BANYAN: 7, SHRINE: 8, LANTERN: 9, STONE: 10,
        BRIDGE: 11, FENCE: 12, LOTUS: 13, GRAVE: 14, DOOR: 15,
        FLOOR: 16, SHELF: 17,
        RICE: 18, PAVED: 19, WELL: 20, FLAG: 21, BUS: 22, SHELTER: 23,
    },

    isBlocking(tile) {
        // RICE(18) WELL(20) FLAG(21) BUS(22) SHELTER(23) are solid
        return [2, 3, 4, 5, 6, 7, 8, 12, 14, 17, 18, 20, 21, 22, 23].includes(tile);
    },

    is(map, r, c, type) {
        if (r < 0 || r >= map.length || c < 0 || c >= map[0].length) return false;
        return map[r][c] === type;
    },

    // deterministic pseudo-random 0..1 from coords
    rnd(c, r, salt = 0) {
        let n = Math.sin((c * 127.1 + r * 311.7 + salt * 74.7)) * 43758.5453;
        return n - Math.floor(n);
    },

    renderMap(ctx, map, cameraX, cameraY, chapter = 1) {
        const TS = this.TILE_SIZE;
        const T = this.TILES;
        const useAtlas = (typeof Tileset !== 'undefined') && Tileset.available();
        const startCol = Math.floor(cameraX / TS);
        const startRow = Math.floor(cameraY / TS);
        const endCol = startCol + Math.ceil(Engine.W / TS) + 1;
        const endRow = startRow + Math.ceil(Engine.H / TS) + 1;

        if (!useAtlas) {
            this.renderMapFallback(ctx, map, cameraX, cameraY, chapter, startCol, startRow, endCol, endRow);
            return;
        }

        // PASS 1 — ground
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) continue;
                const tile = map[row][col];
                const x = col * TS - cameraX;
                const y = row * TS - cameraY;
                this.drawGround(ctx, map, tile, row, col, x, y, chapter);
            }
        }

        // PASS 2 — objects (back-to-front by row)
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) continue;
                const tile = map[row][col];
                const x = col * TS - cameraX;
                const y = row * TS - cameraY;
                this.drawObject(ctx, map, tile, row, col, x, y, chapter);
            }
        }
    },

    drawGround(ctx, map, tile, r, c, x, y, chapter) {
        const T = this.TILES;
        const N = Tileset.NAMED;
        // Water & indoor floor have their own ground
        if (tile === T.WATER || tile === T.LOTUS) { this.drawWater(ctx, map, r, c, x, y, chapter); return; }
        if (tile === T.FLOOR || tile === T.SHELF || tile === T.WALL || tile === T.DOOR) {
            this.drawWoodFloor(ctx, x, y); return;
        }
        if (tile === T.RICE) { this.drawRice(ctx, map, r, c, x, y); return; }
        if (tile === T.PAVED) { this.drawPaved(ctx, map, r, c, x, y); return; }
        if (tile === T.DIRT || tile === T.BRIDGE) { this.drawPath(ctx, map, r, c, x, y); return; }
        // banyan / well / flag / bus / shelter sit on a grass base
        // default: grass base (also under trees/houses/fences/etc)
        this.drawGrass(ctx, c, r, x, y);
    },

    // Rice paddy ground — wet green field with crop rows and earthen bunds
    drawRice(ctx, map, r, c, x, y) {
        const TS = this.TILE_SIZE, T = this.TILES;
        const isR = (rr, cc) => this.is(map, rr, cc, T.RICE);
        // water-logged base
        ctx.fillStyle = '#6f9a3e';
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = 'rgba(120,160,80,0.45)';
        ctx.fillRect(x, y, TS, TS);
        // crop rows
        ctx.fillStyle = '#4e7a2c';
        for (let i = 1; i < 4; i++) {
            const yy = y + i * 4;
            for (let xx = x + 1; xx < x + TS; xx += 3) ctx.fillRect(xx, yy, 1, 2);
        }
        // glint
        ctx.fillStyle = 'rgba(220,240,180,0.25)';
        ctx.fillRect(x + 2, y + 2, 2, 1);
        // earthen bund (dike) on edges next to non-rice
        ctx.fillStyle = '#a98b5a';
        if (!isR(r - 1, c)) ctx.fillRect(x, y, TS, 2);
        if (!isR(r + 1, c)) ctx.fillRect(x, y + TS - 2, TS, 2);
        if (!isR(r, c - 1)) ctx.fillRect(x, y, 2, TS);
        if (!isR(r, c + 1)) ctx.fillRect(x + TS - 2, y, 2, TS);
    },

    // Paved courtyard ground — warm terracotta brick
    drawPaved(ctx, map, r, c, x, y) {
        const TS = this.TILE_SIZE, T = this.TILES;
        ctx.fillStyle = '#9c6b47';
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = 'rgba(60,35,20,0.35)';
        // brick seams (offset rows)
        const off = (r % 2) * 8;
        ctx.fillRect(x, y, TS, 1);
        ctx.fillRect(x, y + 8, TS, 1);
        ctx.fillRect(x + ((off) % TS), y, 1, 8);
        ctx.fillRect(x + ((off + 8) % TS), y + 8, 1, 8);
        ctx.fillStyle = 'rgba(255,225,180,0.10)';
        ctx.fillRect(x, y + 1, TS, 1);
    },

    drawGrass(ctx, c, r, x, y) {
        const N = Tileset.NAMED, TS = this.TILE_SIZE;
        const v = this.rnd(c, r, 1);
        let idx = N.GRASS;
        if (v > 0.95) idx = N.GRASS_FLOWER;       // flower clumps (a touch more)
        else if (v > 0.72) idx = N.GRASS2;        // subtle variation
        Tileset.draw(ctx, idx, x, y, TS);

        // very rare mushroom decoration
        if (v > 0.992) Tileset.draw(ctx, N.MUSHROOM, x, y, TS);

        // --- "đắp" decoration pass: scatter small bushes + ground detail ---
        const w = this.rnd(c, r, 7);
        if (w > 0.978) {
            Tileset.draw(ctx, N.BUSH, x, y - 1, TS);   // small bush tuft
        } else if (w > 0.40 && w < 0.62) {
            // tiny grass-blade / pebble specks for texture (procedural, cheap)
            const gx = x + Math.floor(this.rnd(c, r, 11) * 12) + 2;
            const gy = y + Math.floor(this.rnd(c, r, 13) * 11) + 3;
            if (w > 0.55) { ctx.fillStyle = 'rgba(120,150,80,0.45)'; ctx.fillRect(gx, gy, 1, 2); ctx.fillRect(gx + 1, gy + 1, 1, 1); }
            else { ctx.fillStyle = 'rgba(150,140,120,0.40)'; ctx.fillRect(gx, gy, 2, 1); }
        }
        // occasional scattered flower dots (warm accent)
        const f = this.rnd(c, r, 17);
        if (f > 0.93 && idx !== N.GRASS_FLOWER) {
            const fx = x + Math.floor(this.rnd(c, r, 19) * 12) + 2;
            const fy = y + Math.floor(this.rnd(c, r, 23) * 10) + 3;
            ctx.fillStyle = f > 0.97 ? 'rgba(235,210,90,0.85)' : 'rgba(220,140,170,0.8)';
            ctx.fillRect(fx, fy, 1, 1);
            ctx.fillStyle = 'rgba(90,130,70,0.6)';
            ctx.fillRect(fx, fy + 1, 1, 1);
        }
    },

    drawPath(ctx, map, r, c, x, y) {
        const N = Tileset.NAMED, T = this.TILES;
        const isPath = (rr, cc) => this.is(map, rr, cc, T.DIRT) || this.is(map, rr, cc, T.BRIDGE);
        // grass base first for edges to blend
        this.drawGrass(ctx, c, r, x, y);
        const top = !isPath(r - 1, c), bot = !isPath(r + 1, c);
        const left = !isPath(r, c - 1), right = !isPath(r, c + 1);
        let vy = top ? 'T' : (bot ? 'B' : 'M');
        let hx = left ? 'L' : (right ? 'R' : 'M');
        const table = {
            'TL': N.PATH_TL, 'TM': N.PATH_T, 'TR': N.PATH_TR,
            'ML': N.PATH_L, 'MM': N.PATH_C, 'MR': N.PATH_R,
            'BL': N.PATH_BL, 'BM': N.PATH_B, 'BR': N.PATH_BR,
        };
        Tileset.draw(ctx, table[vy + hx] ?? N.PATH_C, x, y, this.TILE_SIZE);
    },

    drawWater(ctx, map, r, c, x, y, chapter) {
        const TS = this.TILE_SIZE;
        // base water gradient
        const warm = chapter <= 2;
        ctx.fillStyle = warm ? '#3f7fa6' : '#2f6286';
        ctx.fillRect(x, y, TS, TS);
        // ripples
        const t = Engine.frameCount * 0.04;
        ctx.fillStyle = warm ? 'rgba(150,200,225,0.35)' : 'rgba(120,170,205,0.30)';
        for (let i = 0; i < 2; i++) {
            const ry = y + 4 + i * 7 + Math.sin(t + (x + i * 13) * 0.3) * 1.2;
            ctx.fillRect(x + 2 + ((Math.floor(t) + i) % 4), Math.round(ry), 6, 1);
        }
        // shoreline highlight where adjacent to land
        const T = this.TILES;
        const land = (rr, cc) => !(this.is(map, rr, cc, T.WATER) || this.is(map, rr, cc, T.LOTUS));
        ctx.fillStyle = 'rgba(220,235,245,0.5)';
        if (land(r - 1, c)) ctx.fillRect(x, y, TS, 1);
        if (land(r + 1, c)) ctx.fillRect(x, y + TS - 1, TS, 1);
        if (land(r, c - 1)) ctx.fillRect(x, y, 1, TS);
        if (land(r, c + 1)) ctx.fillRect(x + TS - 1, y, 1, TS);
    },

    drawWoodFloor(ctx, x, y) {
        const TS = this.TILE_SIZE;
        ctx.fillStyle = '#9c7b54';
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = 'rgba(80,55,35,0.5)';
        ctx.fillRect(x, y + (Math.floor(x / 1) % 2 === 0 ? 7 : 7), TS, 1);
        ctx.fillStyle = 'rgba(255,230,190,0.12)';
        ctx.fillRect(x, y, TS, 1);
    },

    drawObject(ctx, map, tile, r, c, x, y, chapter) {
        const N = Tileset.NAMED, T = this.TILES, TS = this.TILE_SIZE;
        switch (tile) {
            case T.TREE: {
                const o = this.rnd(c, r, 3);
                const idx = o > 0.32 ? 16 : N.BUSH;   // tree-with-trunk (16) or round bush (5)
                ctx.fillStyle = 'rgba(0,0,0,0.18)';
                ctx.beginPath(); ctx.ellipse(x + 8, y + 14, 6, 2.5, 0, 0, 7); ctx.fill();
                Tileset.draw(ctx, idx, x, y - 3, TS);
                break;
            }
            case T.BANYAN: {
                // Draw ONE big old tree at the block centre only (avoids overlap mess)
                const center = this.is(map, r - 1, c, T.BANYAN) && this.is(map, r + 1, c, T.BANYAN)
                    && this.is(map, r, c - 1, T.BANYAN) && this.is(map, r, c + 1, T.BANYAN);
                if (center) {
                    const cx = x + 8, cy = y + 8;
                    // ground shadow
                    ctx.fillStyle = 'rgba(0,0,0,0.26)';
                    ctx.beginPath(); ctx.ellipse(cx, cy + 16, 26, 7, 0, 0, 7); ctx.fill();
                    // gnarled trunk with hanging aerial roots (đặc trưng cây đa)
                    ctx.fillStyle = '#5a4632';
                    ctx.fillRect(cx - 6, cy - 2, 12, 22);
                    ctx.fillStyle = '#6b5640';
                    ctx.fillRect(cx - 10, cy + 2, 3, 18);
                    ctx.fillRect(cx + 8, cy + 4, 3, 16);
                    ctx.fillRect(cx - 2, cy + 6, 2, 14);
                    ctx.fillStyle = '#46362a';
                    ctx.fillRect(cx - 6, cy - 2, 3, 22);
                    // big layered canopy
                    const blobs = [
                        [0, -20, 24, 16, '#33602f'], [-16, -14, 18, 13, '#2c5429'],
                        [16, -14, 18, 13, '#2c5429'], [0, -28, 18, 12, '#3a6c34'],
                        [-10, -22, 14, 11, '#3f7338'], [10, -22, 14, 11, '#3f7338'],
                    ];
                    for (const [dx, dy, rx, ry, col] of blobs) {
                        ctx.fillStyle = col;
                        ctx.beginPath(); ctx.ellipse(cx + dx, cy + dy, rx, ry, 0, 0, 7); ctx.fill();
                    }
                    // leaf speckle highlights
                    ctx.fillStyle = 'rgba(150,200,110,0.45)';
                    for (let i = 0; i < 14; i++) {
                        const a = i * 1.3, rr = 10 + (i % 3) * 6;
                        ctx.fillRect(cx + Math.cos(a) * rr, cy - 20 + Math.sin(a) * rr * 0.7, 2, 2);
                    }
                    // red prayer cloth + offering on the trunk
                    ctx.fillStyle = '#b0301f'; ctx.fillRect(cx - 3, cy + 4, 6, 8);
                    ctx.fillStyle = '#ffd76a'; ctx.fillRect(cx - 3, cy + 4, 6, 2);
                    ctx.fillStyle = '#e0c070'; ctx.fillRect(cx - 2, cy + 13, 4, 2);
                }
                break;
            }
            case T.BAMBOO: {
                // tidy hedge of bushes along village edges
                Tileset.draw(ctx, N.BUSH, x, y - 1, TS);
                break;
            }
            case T.HOUSE: this.drawHouse(ctx, map, r, c, x, y); break;
            case T.STONE: this.drawStone(ctx, map, r, c, x, y); break;
            case T.SHRINE: {
                Tileset.draw(ctx, N.STONE_MID, x, y, TS);
                ctx.fillStyle = '#a0392b'; ctx.fillRect(x + 3, y + 2, 10, 4);
                const fl = Math.sin(Engine.frameCount * 0.12) > 0;
                if (fl) { ctx.fillStyle = '#ffd76a'; ctx.fillRect(x + 7, y + 1, 2, 2); }
                break;
            }
            case T.FENCE: {
                const hv = (this.is(map, r, c - 1, T.FENCE) || this.is(map, r, c + 1, T.FENCE));
                Tileset.draw(ctx, hv ? N.FENCE_H : N.FENCE_V, x, y, TS);
                break;
            }
            case T.BRIDGE: Tileset.draw(ctx, N.PLANK_M, x, y, TS); break;
            case T.LANTERN: this.drawLantern(ctx, x, y); break;
            case T.GRAVE: this.drawGrave(ctx, x, y); break;
            case T.LOTUS: {
                ctx.fillStyle = '#2f8f5a'; ctx.beginPath(); ctx.ellipse(x + 8, y + 9, 5, 4, 0, 0, 7); ctx.fill();
                ctx.fillStyle = '#f4a6c8'; ctx.fillRect(x + 7, y + 6, 3, 3);
                ctx.fillStyle = '#ffd76a'; ctx.fillRect(x + 8, y + 7, 1, 1);
                break;
            }
            case T.WALL: Tileset.draw(ctx, N.WALL, x, y, TS); break;
            case T.DOOR: Tileset.draw(ctx, N.WALL_DOOR, x, y, TS); break;
            case T.SHELF: Tileset.draw(ctx, N.BARREL, x, y, TS); break;
            case T.WELL: {
                // stone well — only on the block's top-left so the 2x2 draws once
                const W2 = (rr, cc) => this.is(map, rr, cc, T.WELL);
                if (!W2(r - 1, c) && !W2(r, c - 1)) {
                    ctx.fillStyle = 'rgba(0,0,0,0.22)';
                    ctx.beginPath(); ctx.ellipse(x + 16, y + 24, 14, 4, 0, 0, 7); ctx.fill();
                    Tileset.draw(ctx, N.WELL, x, y + 4, TS);           // base
                    Tileset.draw(ctx, N.WELL, x + TS, y + 4, TS);
                    // little roof posts + beam
                    ctx.fillStyle = '#6b4a2c'; ctx.fillRect(x + 2, y - 2, 2, 10); ctx.fillRect(x + 28, y - 2, 2, 10);
                    ctx.fillStyle = '#8a3324'; ctx.fillRect(x, y - 5, TS * 2, 4);
                    ctx.fillStyle = '#5a2018'; ctx.fillRect(x, y - 1, TS * 2, 1);
                }
                break;
            }
            case T.FLAG: {
                // tall pole with a red ceremonial banner (sân đình)
                ctx.fillStyle = 'rgba(0,0,0,0.18)';
                ctx.beginPath(); ctx.ellipse(x + 8, y + 15, 4, 1.6, 0, 0, 7); ctx.fill();
                ctx.fillStyle = '#caa15a'; ctx.fillRect(x + 7, y - 8, 2, 23);
                const sw = Math.sin(Engine.frameCount * 0.06) * 1.5;
                ctx.fillStyle = '#b0301f';
                ctx.beginPath();
                ctx.moveTo(x + 9, y - 7);
                ctx.lineTo(x + 18 + sw, y - 4);
                ctx.lineTo(x + 9, y + 1);
                ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#ffd76a'; ctx.fillRect(x + 11, y - 5, 3, 3);
                break;
            }
            case T.BUS: {
                // old village bus — draw once at the block's top-left (4 wide x 2 tall)
                const B = (rr, cc) => this.is(map, rr, cc, T.BUS);
                if (!B(r - 1, c) && !B(r, c - 1)) {
                    const bw = 56, bh = 26, bx = x + 2, by = y + 2;
                    ctx.fillStyle = 'rgba(0,0,0,0.22)';
                    ctx.fillRect(bx + 2, by + bh - 2, bw - 4, 4);
                    ctx.fillStyle = '#d9c187'; ctx.fillRect(bx, by, bw, bh - 6);          // cream body
                    ctx.fillStyle = '#c0392b'; ctx.fillRect(bx, by + bh - 12, bw, 5);    // red stripe
                    ctx.fillStyle = '#3a3a44'; ctx.fillRect(bx, by + bh - 7, bw, 5);     // skirt
                    ctx.fillStyle = '#7fb0c8';                                            // windows
                    for (let i = 0; i < 5; i++) ctx.fillRect(bx + 4 + i * 11, by + 4, 8, 8);
                    ctx.fillStyle = '#2a2a30';                                            // wheels
                    ctx.beginPath(); ctx.arc(bx + 12, by + bh, 4, 0, 7); ctx.arc(bx + bw - 12, by + bh, 4, 0, 7); ctx.fill();
                    ctx.fillStyle = '#ffe08a'; ctx.fillRect(bx + bw - 2, by + bh - 14, 2, 3); // headlight
                }
                break;
            }
            case T.SHELTER: {
                // simple wooden roof shelter (bến xe / bus stop & well shade)
                const S2 = (rr, cc) => this.is(map, rr, cc, T.SHELTER);
                if (!S2(r - 1, c) && !S2(r, c - 1)) {
                    const left = !S2(r, c - 1), right = !S2(r, c + 1);
                    ctx.fillStyle = '#6b4a2c';
                    ctx.fillRect(x + 1, y + 6, 2, 10);
                    ctx.fillStyle = '#8a5a30'; ctx.fillRect(x, y, TS, 5);
                    ctx.fillStyle = '#5a3a1e'; ctx.fillRect(x, y + 4, TS, 1);
                }
                break;
            }
        }
    },

    drawHouse(ctx, map, r, c, x, y) {
        const N = Tileset.NAMED, T = this.TILES, TS = this.TILE_SIZE;
        const H = (rr, cc) => this.is(map, rr, cc, T.HOUSE);
        // horizontal span of this building row
        let cl = c; while (H(r, cl - 1)) cl--;
        let cr = c; while (H(r, cr + 1)) cr++;
        const left = (c === cl), right = (c === cr);
        const width = cr - cl + 1, mid = cl + Math.floor(width / 2);
        // stable colour variant per building
        const red = this.rnd(cl, cr, 9) > 0.45;

        const isRoof = !H(r - 1, c);                 // very top row
        const isEave = H(r - 1, c) && !H(r - 2, c);  // second row
        if (isRoof) {
            const idx = left ? (red ? N.ROOF_RED_L : N.ROOF_GREY_L)
                : right ? (red ? N.ROOF_RED_R : N.ROOF_GREY_R)
                    : (red ? N.ROOF_RED_M : N.ROOF_GREY_M);
            Tileset.draw(ctx, idx, x, y, TS);
            return;
        }
        if (isEave) {
            const idx = left ? (red ? N.EAVE_RED_L : N.EAVE_GREY_L)
                : right ? (red ? N.EAVE_RED_R : N.EAVE_GREY_R)
                    : (red ? N.EAVE_RED_M : N.EAVE_GREY_M);
            Tileset.draw(ctx, idx, x, y, TS);
            return;
        }
        // wall rows: single central door at the bottom, sparse windows above
        const bottom = !H(r + 1, c);
        let idx = N.WALL;
        if (bottom && c === mid) idx = N.WALL_DOOR;
        else if (!bottom && !left && !right && ((c - cl) % 2 === 0)) idx = N.WALL_WINDOW;
        Tileset.draw(ctx, idx, x, y, TS);
    },

    drawStone(ctx, map, r, c, x, y) {
        const N = Tileset.NAMED, T = this.TILES, TS = this.TILE_SIZE;
        const S = (rr, cc) => this.is(map, rr, cc, T.STONE);
        const top = !S(r - 1, c);
        const bottom = !S(r + 1, c);
        const centerCol = S(r, c - 1) && S(r, c + 1);
        let idx;
        if (top) {
            const left = !S(r, c - 1), right = !S(r, c + 1);
            idx = left ? N.STONE_TOP_L : (right ? N.STONE_TOP_R : N.STONE_TOP_M);
        } else if (bottom && centerCol) {
            idx = N.STONE_GATE;
        } else {
            idx = bottom ? N.STONE_BASE : N.STONE_MID;
        }
        Tileset.draw(ctx, idx, x, y, TS);
    },

    drawLantern(ctx, x, y) {
        // pole
        ctx.fillStyle = '#5a4632'; ctx.fillRect(x + 7, y + 6, 2, 9);
        // glow bloom
        const g = 0.55 + 0.25 * Math.sin(Engine.frameCount * 0.08 + x);
        const grad = ctx.createRadialGradient(x + 8, y + 5, 1, x + 8, y + 5, 11);
        grad.addColorStop(0, `rgba(255,200,90,${0.7 * g})`);
        grad.addColorStop(1, 'rgba(255,200,90,0)');
        ctx.fillStyle = grad; ctx.fillRect(x - 3, y - 6, 22, 22);
        // lantern body
        ctx.fillStyle = '#c0392b'; ctx.fillRect(x + 5, y + 1, 6, 6);
        ctx.fillStyle = `rgba(255,225,150,${0.8})`; ctx.fillRect(x + 6, y + 2, 4, 4);
        ctx.fillStyle = '#3a2a1a'; ctx.fillRect(x + 5, y, 6, 1);
    },

    drawGrave(ctx, x, y) {
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath(); ctx.ellipse(x + 8, y + 14, 6, 2, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#8a8f96'; ctx.fillRect(x + 4, y + 3, 8, 11);
        ctx.fillStyle = '#a7adb4'; ctx.fillRect(x + 5, y + 2, 6, 2);
        ctx.fillStyle = '#6c7177'; ctx.fillRect(x + 5, y + 6, 6, 1);
        ctx.fillStyle = '#6c7177'; ctx.fillRect(x + 7, y + 8, 2, 4);
    },

    // ===== Lighting / ambiance overlay (Zelda-like mood) =====
    drawAmbient(ctx, chapter, opts = {}) {
        const W = Engine.W, H = Engine.H;
        // chapter tint
        let tint;
        if (chapter <= 1) tint = 'rgba(255,190,110,0.10)';      // warm afternoon
        else if (chapter === 2) tint = 'rgba(120,110,200,0.16)'; // dusk/blue
        else if (chapter === 3) tint = 'rgba(90,100,130,0.20)';  // overcast
        else tint = 'rgba(255,170,90,0.12)';                     // festival warm
        if (opts.tint) tint = opts.tint;
        ctx.fillStyle = tint;
        ctx.fillRect(0, 0, W, H);
        // vignette
        const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(0,0,0,0.32)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, W, H);
    },

    // ---------- Fallback (no atlas) : simple colored tiles ----------
    renderMapFallback(ctx, map, cameraX, cameraY, chapter, startCol, startRow, endCol, endRow) {
        const TS = this.TILE_SIZE;
        const colors = ['#4a7a3a','#a08060','#4a80a0','#2a5a2a','#8a7060','#7a6a5a','#3a6a30','#5a4a30','#8a4040','#e8c040','#888','#907050','#a09070','#c08090','#707070','#6a5a40','#907a60','#6a5a40'];
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) continue;
                const tile = map[row][col];
                const x = Math.floor(col * TS - cameraX), y = Math.floor(row * TS - cameraY);
                ctx.fillStyle = colors[tile] || '#000';
                ctx.fillRect(x, y, TS, TS);
            }
        }
    },

    checkCollision(map, x, y, w = 10, h = 6) {
        const points = [
            [x - w/2, y - h/2], [x + w/2, y - h/2],
            [x - w/2, y + h/2], [x + w/2, y + h/2],
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

// ===== NPC =====
class NPC {
    constructor(name, spriteName, x, y, dir = 'down', isGhost = false) {
        this.name = name; this.spriteName = spriteName;
        this.x = x; this.y = y; this.dir = dir; this.isGhost = isGhost;
        this.visible = true; this.alpha = isGhost ? 0.9 : 1;
        this.animFrame = 0; this.animTimer = 0; this.flickerTimer = 0;
        this.bob = Math.random() * 6;
        // --- cutscene actor movement / acting ---
        this.tx = x; this.ty = y;        // walk target
        this.moveSpeed = 34;
        this.walking = false;
        this.hopT = 0;                    // >0 while doing a little hop (joy)
        this.shakeT = 0;                  // >0 while trembling (fear/cold)
        this.gestureCb = null;
    }
    // Tell the actor to walk to a world point; face it on arrival.
    walkTo(x, y, faceDir = null) { this.tx = x; this.ty = y; this._faceOnArrive = faceDir; }
    face(dir) { this.dir = dir; }
    hop() { this.hopT = 0.42; }          // a small happy jump
    tremble(d = 0.6) { this.shakeT = d; }
    atTarget() { return Math.hypot(this.tx - this.x, this.ty - this.y) < 1.5; }

    update(dt) {
        this.bob += dt;
        if (this.hopT > 0) this.hopT = Math.max(0, this.hopT - dt);
        if (this.shakeT > 0) this.shakeT = Math.max(0, this.shakeT - dt);

        // walk toward target
        const dx = this.tx - this.x, dy = this.ty - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 1.2) {
            const step = Math.min(dist, this.moveSpeed * dt);
            this.x += (dx / dist) * step;
            this.y += (dy / dist) * step;
            this.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
            this.walking = true;
            this.animTimer += dt;
            if (this.animTimer >= 0.14) { this.animTimer = 0; this.animFrame = (this.animFrame + 1) % 4; }
        } else {
            if (this.walking && this._faceOnArrive) { this.dir = this._faceOnArrive; this._faceOnArrive = null; }
            this.walking = false; this.animFrame = 0;
        }

        if (this.isGhost) {
            this.flickerTimer += dt;
            if (this.flickerTimer > 3 + Math.random() * 2) {
                this.alpha = 0.78;
                setTimeout(() => { this.alpha = 0.9; }, 100);
                this.flickerTimer = 0;
            }
        }
    }
    render(ctx, cameraX, cameraY) {
        if (!this.visible) return;
        const animName = this.walking ? `walk_${this.dir}` : `idle_${this.dir}`;
        const frame = Sprites.getFrame(this.spriteName, animName, this.animFrame) ||
                      Sprites.getFrame(this.spriteName, `idle_${this.dir}`, 0);
        if (!frame) return;
        let sx = Math.floor(this.x - cameraX), sy = Math.floor(this.y - cameraY);
        if (this.shakeT > 0) sx += Math.round(Math.sin(Engine.frameCount * 0.9) * 1.2);
        // soft shadow
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.beginPath(); ctx.ellipse(sx, sy - 1, 6, 2.4, 0, 0, 7); ctx.fill();
        ctx.globalAlpha = this.alpha;
        let fy = this.isGhost ? Math.sin(this.bob * 1.5) * 1 : 0;
        if (this.hopT > 0) fy -= Math.sin((1 - this.hopT / 0.42) * Math.PI) * 5; // arc of the hop
        ctx.drawImage(frame, sx - 8, Math.floor(sy - 20 + fy));
        ctx.globalAlpha = 1;
    }
    distTo(px, py) { return Math.hypot(this.x - px, this.y - py); }
}

// ===== Hotspot =====
class Hotspot {
    constructor(x, y, w, h, id, label = '') {
        this.x = x; this.y = y; this.w = w; this.h = h;
        this.id = id; this.label = label; this.active = true; this.triggered = false;
    }
    containsPoint(px, py) {
        return this.active && px >= this.x && px < this.x + this.w && py >= this.y && py < this.y + this.h;
    }
    center() { return { x: this.x + this.w / 2, y: this.y + this.h / 2 }; }
    render(ctx, cameraX, cameraY) {
        if (!this.active) return;
        const g = 0.18 + 0.1 * Math.sin(Engine.frameCount * 0.06);
        ctx.fillStyle = `rgba(255, 215, 120, ${g})`;
        ctx.fillRect(Math.floor(this.x - cameraX), Math.floor(this.y - cameraY), this.w, this.h);
    }
}
