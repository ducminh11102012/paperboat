// Paper Boats — Chapter 1: Đến Làng
const Chapter1Scene = {
    phase: 'title_card', // 'title_card', 'narration', 'arrive', 'explore', 'meet_thu', etc.
    timer: 0,
    titleAlpha: 0,
    map: null,
    npcs: [],
    hotspots: [],
    cameraX: 0,
    cameraY: 0,
    visitedHotspots: {},
    pondVisits: 0,
    metThu: false,
    thuNPC: null,
    baNoi: null,

    // World is a hand-laid tilemap (matches the painted reference map layout)
    mapW: 50,
    mapH: 42,

    init() {
        this.phase = 'title_card';
        this.timer = 0;
        this.titleAlpha = 0;
        this.visitedHotspots = {};
        this.pondVisits = 0;
        this.metThu = false;
        this.createMap();
        this.createNPCs();
        // Arrive at the village gate / bus stop (top-left entry, like the map)
        Player.reset(8 * 16 + 8, 5 * 16);
    },

    // Build a 50x42 tile village laid out to match the painted "Bản Đồ Làng".
    // Landmark numbers refer to the map legend (1 bến xe … 13 nghĩa địa).
    createMap() {
        const T = TileMap.TILES, W = this.mapW, H = this.mapH;
        const m = [];
        for (let r = 0; r < H; r++) { m[r] = []; for (let c = 0; c < W; c++) m[r][c] = T.GRASS; }
        const inb = (r, c) => r >= 0 && r < H && c >= 0 && c < W;
        const set = (r, c, t) => { if (inb(r, c)) m[r][c] = t; };
        const rect = (r0, c0, r1, c1, t) => { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) set(r, c, t); };
        // thick dirt roads
        const road = (r0, c0, r1, c1, w = 2) => {
            if (r0 === r1) { for (let c = Math.min(c0, c1); c <= Math.max(c0, c1); c++) for (let k = 0; k < w; k++) set(r0 + k, c, T.DIRT); }
            else { for (let r = Math.min(r0, r1); r <= Math.max(r0, r1); r++) for (let k = 0; k < w; k++) set(r, c0 + k, T.DIRT); }
        };

        // ---- 1) ROAD NETWORK (carved first; landmarks stamp over it) ----
        road(12, 4, 12, 46, 2);      // main east-west village road
        road(20, 6, 20, 36, 2);      // lower east-west road
        road(4, 7, 12, 7, 2);        // bus stop / gate -> main road
        road(6, 20, 12, 20, 2);      // grandma house -> road
        road(12, 31, 16, 31, 2);     // road -> temple/courtyard
        road(12, 24, 22, 24, 2);     // road -> well -> south
        road(20, 9, 12, 9, 2);       // ông tư house spur
        road(12, 39, 9, 39, 2);      // road -> banyan
        road(22, 24, 30, 16, 2);     // well -> down toward river bank
        road(20, 31, 24, 31, 2);     // road -> kite field
        road(12, 41, 20, 41, 2);     // road -> rice fields

        // ---- 11/12) RIVER (organic lake across the bottom) ----
        rect(34, 8, 40, 28, T.WATER);
        rect(36, 6, 41, 31, T.WATER);
        rect(33, 12, 35, 24, T.WATER);
        // soften top corners back to grass
        set(34, 8, T.GRASS); set(34, 9, T.GRASS); set(34, 27, T.GRASS); set(34, 28, T.GRASS);
        set(33, 12, T.GRASS); set(33, 24, T.GRASS);
        // bridge crossing + bathing dock
        rect(31, 15, 41, 16, T.BRIDGE);   // foot bridge over the river
        rect(34, 24, 35, 26, T.BRIDGE);   // bãi tắm sông dock (12)
        // lotus pads
        set(35, 11, T.LOTUS); set(38, 22, T.LOTUS); set(37, 13, T.LOTUS); set(39, 27, T.LOTUS);

        // ---- 1) BẾN XE LÀNG (bus stop) ----
        rect(2, 4, 3, 7, T.BUS);
        set(3, 10, T.SHELTER); set(3, 11, T.SHELTER);

        // ---- 2) CỔNG LÀNG (stone gate with a passage) ----
        rect(9, 5, 11, 9, T.STONE);
        rect(9, 7, 11, 8, T.DIRT);   // walk-through arch passage

        // ---- 3) NHÀ BÀ NỘI ----
        rect(3, 18, 6, 22, T.HOUSE);
        rect(7, 18, 7, 22, T.FENCE); set(7, 20, T.DIRT);

        // ---- 4) SÂN ĐÌNH (paved courtyard) + flag ----
        rect(14, 18, 17, 24, T.PAVED);
        set(14, 21, T.FLAG);
        set(13, 17, T.FENCE); set(14, 17, T.FENCE); set(15, 17, T.FENCE); set(16, 17, T.FENCE); set(17, 17, T.FENCE);

        // ---- 5) ĐÌNH LÀNG (communal temple) ----
        rect(8, 29, 11, 35, T.HOUSE);
        set(12, 29, T.LANTERN); set(12, 35, T.LANTERN);
        set(12, 32, T.SHRINE);

        // ---- 6) CÂY ĐA (banyan) + scattered old graves ----
        rect(5, 38, 7, 40, T.BANYAN);
        set(8, 37, T.GRAVE); set(8, 41, T.GRAVE); set(9, 38, T.GRAVE); set(9, 40, T.GRAVE);

        // ---- 7) GIẾNG NƯỚC (well) ----
        rect(21, 24, 22, 25, T.WELL);

        // ---- 8) NHÀ ÔNG TƯ ----
        rect(17, 7, 20, 11, T.HOUSE);
        rect(21, 7, 21, 11, T.FENCE); set(21, 9, T.DIRT);

        // ---- 9) BÃI THẢ DIỀU (open kite field — leave grass + flowers) ----
        set(24, 30, T.FLAG); // small marker; mostly open ground

        // ---- 10) CÁNH ĐỒNG (rice paddies, fenced with bunds) ----
        rect(18, 41, 30, 48, T.RICE);
        // bund gaps (walk lines) every few rows -> grass dividers
        for (let c = 41; c <= 48; c++) { set(22, c, T.GRASS); set(26, c, T.GRASS); }
        rect(17, 41, 17, 48, T.FENCE);

        // ---- 13) NGHĨA ĐỊA CŨ (walled old cemetery) ----
        rect(33, 38, 33, 47, T.WALL);     // top wall
        rect(33, 38, 40, 38, T.WALL);     // left wall
        rect(33, 47, 40, 47, T.WALL);     // right wall
        for (let r = 35; r <= 39; r += 2) for (let c = 40; c <= 45; c += 2) set(r, c, T.GRAVE);

        // ---- scattered trees & bushes for life ----
        const trees = [[3, 13], [5, 25], [7, 14], [9, 27], [14, 13], [16, 34], [18, 16], [22, 13], [24, 27], [10, 44], [6, 33], [16, 27], [27, 9]];
        trees.forEach(([r, c]) => { if (m[r][c] === T.GRASS) set(r, c, T.TREE); });

        // ---- bamboo hedge framing the village edges ----
        for (let c = 0; c < W; c++) { if (m[0][c] === T.GRASS) set(0, c, T.BAMBOO); if (m[H - 1][c] === T.GRASS) set(H - 1, c, T.BAMBOO); }
        for (let r = 0; r < H; r++) { if (m[r][0] === T.GRASS) set(r, 0, T.BAMBOO); if (m[r][W - 1] === T.GRASS) set(r, W - 1, T.BAMBOO); }

        this.map = m;
    },

    createNPCs() {
        const TS = 16;
        this.npcs = [];
        // Bà Nội just in front of her house (landmark 3)
        this.baNoi = new NPC('Bà Nội', 'ba_noi', 20 * TS + 8, 8 * TS, 'down');
        this.npcs.push(this.baNoi);

        // Thu (hidden at first, appears on the river bank — landmark 12)
        this.thuNPC = new NPC('Thu', 'thu', 25 * TS + 8, 32 * TS + 8, 'down', true);
        this.thuNPC.visible = false;
        this.npcs.push(this.thuNPC);

        // Hotspots — placed on walkable ground beside each landmark so the player
        // can stand inside them and press Space to interact.
        const H = (c, r, wc, hr, id, label) => new Hotspot(c * TS, r * TS, wc * TS, hr * TS, id, label);
        this.hotspots = [
            H(37, 8, 4, 2, 'tree', 'Cây đa'),     // 6 · just below the banyan
            H(18, 31, 8, 2, 'pond', 'Bờ sông'),   // 11 · river bank
            H(18, 18, 6, 2, 'temple', 'Sân đình'),// 4/5 · edge of the courtyard
        ];
    },

    update(dt) {
        this.timer += dt;

        switch (this.phase) {
            case 'title_card':
                this.titleAlpha = Math.min(1, this.timer * 0.8);
                if (this.timer > 2.5 || Engine.anyInteract()) {
                    this.phase = 'narration';
                    this.timer = 0;
                    Dialogue.startRaw(Engine.getDialogue('narr_intro'), () => {
                        this.phase = 'arrive';
                        this.timer = 0;
                    });
                }
                break;

            case 'narration':
                Dialogue.update(dt);
                break;

            case 'arrive':
                if (this.timer < 0.5) break;
                if (!this._arrivedDialogue) {
                    this._arrivedDialogue = true;
                    Dialogue.startRaw(Engine.getDialogue('ch1_arrive'), () => {
                        if (typeof Notebook !== 'undefined') Notebook.meetPerson('ba_noi');
                        this.phase = 'explore';
                        this.baNoi.visible = false; // Bà goes inside
                        this.enterExplore();
                    });
                }
                Dialogue.update(dt);
                break;

            case 'explore':
                this.updateExplore(dt);
                break;

            case 'meet_thu_intro':
                Dialogue.update(dt);
                break;

            case 'meet_thu':
                Dialogue.update(dt);
                break;

            case 'choice1':
                Dialogue.update(dt);
                break;

            case 'after_choice':
                Dialogue.update(dt);
                break;

            case 'seed1':
                Dialogue.update(dt);
                break;

            case 'unease':
                Dialogue.update(dt);
                break;
        }

        // Update NPCs
        this.npcs.forEach(n => n.update(dt));

        // Camera follow player
        const worldW = this.mapW * 16;
        const worldH = this.mapH * 16;
        this.cameraX = Player.x - Engine.W / 2;
        this.cameraY = Player.y - Engine.H / 2;
        this.cameraX = Math.max(0, Math.min(this.cameraX, worldW - Engine.W));
        this.cameraY = Math.max(0, Math.min(this.cameraY, worldH - Engine.H));
    },

    enterExplore() {
        Hud.showAreaToast('Làng Bến Cũ', 'Old Wharf Village');
        Hud.showTutorial();
        this.updateObjective();
    },

    updateObjective() {
        const TS = 16;
        if (!this.visitedHotspots.tree) {
            Engine.setObjective('Tới thăm cây đa đầu làng', 'Visit the old banyan tree',
                { x: 39 * TS, y: 8 * TS });
        } else if (!this.metThu) {
            Engine.setObjective('Ra bờ sông chơi', 'Wander down to the river',
                { x: 22 * TS, y: 32 * TS });
        } else {
            Engine.clearObjective();
        }
    },

    updateExplore(dt) {
        Player.update(dt, (x, y) => TileMap.checkCollision(this.map, x, y));
        Dialogue.update(dt);
        this.updateObjective();
        if (Dialogue.active) return;

        // Check hotspot interactions
        for (const hs of this.hotspots) {
            if (!hs.active) continue;
            if (hs.containsPoint(Player.x, Player.y)) {
                if (!this.visitedHotspots[hs.id]) {
                    const c = hs.center();
                    Hud.setPrompt('Quan sát · ' + hs.label, 'Look · ' + hs.label, { x: c.x, y: c.y });
                }
                if (Engine.justPressed('Space') || Engine.justPressed('KeyZ')) {
                    this.interactHotspot(hs);
                }
            }
        }

        // Check NPC interactions
        for (const npc of this.npcs) {
            if (!npc.visible) continue;
            if (npc.distTo(Player.x, Player.y) < 24) {
                Hud.setPrompt('Nói chuyện · ' + npc.name, 'Talk · ' + npc.name, { x: npc.x, y: npc.y - 8 });
                if (Engine.justPressed('Space') || Engine.justPressed('KeyZ')) {
                    this.interactNPC(npc);
                }
            }
        }

        // Track river-bank visits (near landmark 11/12)
        const TS = 16;
        if (Player.x > 16 * TS && Player.x < 27 * TS && Player.y > 30 * TS && Player.y < 33 * TS) {
            if (!this._atPond) {
                this._atPond = true;
                this.pondVisits++;
                if (this.pondVisits >= 2 && !this.metThu && this.visitedHotspots.tree) {
                    this.startMeetThu();
                }
            }
        } else {
            this._atPond = false;
        }
    },

    interactHotspot(hs) {
        if (this.visitedHotspots[hs.id]) return;
        this.visitedHotspots[hs.id] = true;

        switch (hs.id) {
            case 'tree':
                Dialogue.startRaw(Engine.getDialogue('ch1_tree'));
                break;
            case 'pond':
                Dialogue.startRaw(Engine.getDialogue('ch1_pond'));
                break;
            case 'temple':
                Dialogue.startRaw(Engine.getDialogue('ch1_temple'));
                break;
        }
    },

    interactNPC(npc) {
        if (npc === this.thuNPC && this.metThu) {
            // After meeting, interact with Thu
            if (!this._seed1Done) {
                this._seed1Done = true;
                Dialogue.startRaw(Engine.getDialogue('ch1_seed1'), () => {
                    this.startUnease();
                });
            }
        }
    },

    startMeetThu() {
        this.metThu = true;
        this.thuNPC.visible = true;
        Player.lock();
        this.phase = 'meet_thu_intro';

        if (typeof Notebook !== 'undefined') { Notebook.meetPerson('thu'); Notebook.addClue('thu_long_time'); }
        Dialogue.startRaw(Engine.getDialogue('ch1_meet_thu_intro'), () => {
            Dialogue.startRaw(Engine.getDialogue('ch1_meet_thu'), () => {
                this.phase = 'choice1';
                Dialogue.showChoice('ch1_choice_1', (choice) => {
                    const nextKey = choice.next;
                    Dialogue.startRaw(Engine.getDialogue(nextKey), () => {
                        this.phase = 'after_choice';
                        Dialogue.startRaw(Engine.getDialogue('ch1_after_choice'), () => {
                            // Seed #1 trigger
                            this._seed1Done = true;
                            Dialogue.startRaw(Engine.getDialogue('ch1_seed1'), () => {
                                this.startUnease();
                            });
                        });
                    });
                });
            });
        });
    },

    startUnease() {
        this.phase = 'unease';
        if (typeof Notebook !== 'undefined') { Notebook.addClue('thu_no_eat'); Notebook.addClue('ba_noi_pause'); }
        // Move player to home area
        this.baNoi.visible = true;
        this.baNoi.x = 20 * 16 + 8;
        this.baNoi.y = 8 * 16;

        Dialogue.startRaw(Engine.getDialogue('ch1_unease'), () => {
            // Transition to Chapter 2
            Engine.setFlag('ch1_complete');
            Engine.fadeToScene(Chapter2Scene);
        });
    },

    render(ctx) {
        if (this.phase === 'title_card') {
            // Chapter title card
            const g = ctx.createLinearGradient(0, 0, 0, Engine.H);
            g.addColorStop(0, '#10101a'); g.addColorStop(1, '#06060a');
            ctx.fillStyle = g; ctx.fillRect(0, 0, Engine.W, Engine.H);
            ctx.globalAlpha = this.titleAlpha;
            ctx.fillStyle = 'rgba(255,215,120,0.7)';
            ctx.fillRect(Engine.W / 2 - 26, Engine.H / 2 - 22, 52, 1);
            Engine.drawTextCentered(ctx, Engine.locale === 'vi' ? 'CHƯƠNG MỘT' : 'CHAPTER ONE', Engine.H / 2 - 8, '#caa86a', 9, 700);
            Engine.drawTextCentered(ctx, Engine.t('chapter_1_title'), Engine.H / 2 + 10, '#f0e6d2', 15, 700);
            ctx.globalAlpha = 1;
            return;
        }

        // Render world (hand-laid tilemap)
        TileMap.renderMap(ctx, this.map, this.cameraX, this.cameraY, 1);

        // Render hotspots
        this.hotspots.forEach(hs => hs.render(ctx, this.cameraX, this.cameraY));

        // Render NPCs (behind player if above, in front if below)
        const behindNPCs = this.npcs.filter(n => n.y <= Player.y);
        const frontNPCs = this.npcs.filter(n => n.y > Player.y);

        behindNPCs.forEach(n => n.render(ctx, this.cameraX, this.cameraY));
        Player.render(ctx, this.cameraX, this.cameraY);
        frontNPCs.forEach(n => n.render(ctx, this.cameraX, this.cameraY));

        // Ambient lighting / mood (Zelda-like)
        TileMap.drawAmbient(ctx, 1);

        // Dialogue
        Dialogue.render(ctx);
    },
};
