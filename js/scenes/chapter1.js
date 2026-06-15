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

    init() {
        this.phase = 'title_card';
        this.timer = 0;
        this.titleAlpha = 0;
        this.visitedHotspots = {};
        this.pondVisits = 0;
        this.metThu = false;
        this.createMap();
        this.createNPCs();
        Player.reset(10 * 16 + 8, 14 * 16);
    },

    createMap() {
        const T = TileMap.TILES;
        // Village map - 30x20 tiles
        this.map = [];
        for (let r = 0; r < 20; r++) {
            this.map[r] = [];
            for (let c = 0; c < 30; c++) {
                // Default grass
                let tile = T.GRASS;

                // Dirt path (horizontal, middle area)
                if (r >= 9 && r <= 10 && c >= 2 && c <= 27) tile = T.DIRT;
                // Dirt path (vertical, to pond)
                if (c >= 14 && c <= 15 && r >= 10 && r <= 17) tile = T.DIRT;
                // Dirt path (to banyan tree)
                if (c >= 4 && c <= 5 && r >= 5 && r <= 9) tile = T.DIRT;

                // Water (pond, bottom right area)
                if (r >= 15 && r <= 18 && c >= 12 && c <= 20) tile = T.WATER;
                if (r >= 16 && r <= 17 && c >= 11 && c <= 21) tile = T.WATER;
                // Lotus
                if (r === 15 && c === 14) tile = T.LOTUS;
                if (r === 17 && c === 18) tile = T.LOTUS;

                // Houses
                if (r >= 5 && r <= 7 && c >= 8 && c <= 10) tile = T.HOUSE;
                if (r >= 5 && r <= 7 && c >= 18 && c <= 20) tile = T.HOUSE;
                if (r >= 11 && r <= 13 && c >= 22 && c <= 24) tile = T.HOUSE;

                // Banyan tree area (top left)
                if (r >= 3 && r <= 5 && c >= 3 && c <= 5) tile = T.BANYAN;

                // Shrine next to banyan
                if (r === 6 && c === 3) tile = T.SHRINE;

                // Temple/Đình (top right area)
                if (r >= 2 && r <= 4 && c >= 23 && c <= 27) tile = T.STONE;
                if (r >= 2 && r <= 3 && c >= 24 && c <= 26) tile = T.HOUSE;

                // Bamboo border
                if (r === 0 || r === 19) tile = T.BAMBOO;
                if (c === 0 || c === 29) tile = T.BAMBOO;

                // Trees scattered
                if (r === 7 && c === 13) tile = T.TREE;
                if (r === 3 && c === 12) tile = T.TREE;
                if (r === 12 && c === 8) tile = T.TREE;
                if (r === 8 && c === 25) tile = T.TREE;
                if (r === 14 && c === 3) tile = T.TREE;
                if (r === 2 && c === 15) tile = T.TREE;

                // Fence near houses
                if (r === 8 && c >= 8 && c <= 10) tile = T.FENCE;
                if (r === 8 && c >= 18 && c <= 20) tile = T.FENCE;

                this.map[r][c] = tile;
            }
        }
    },

    createNPCs() {
        this.npcs = [];
        // Bà Nội at house entrance
        this.baNoi = new NPC('Bà Nội', 'ba_noi', 9 * 16, 9 * 16, 'down');
        this.npcs.push(this.baNoi);

        // Thu (hidden at first, appears at pond)
        this.thuNPC = new NPC('Thu', 'thu', 15 * 16, 14 * 16 + 8, 'down', true);
        this.thuNPC.visible = false;
        this.npcs.push(this.thuNPC);

        // Hotspots
        this.hotspots = [
            new Hotspot(3 * 16, 5 * 16, 32, 16, 'tree', 'Cây đa'),
            new Hotspot(14 * 16, 14 * 16, 32, 16, 'pond', 'Bờ ao'),
            new Hotspot(24 * 16, 3 * 16, 48, 32, 'temple', 'Sân đình'),
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
                        this.phase = 'explore';
                        this.baNoi.visible = false; // Bà goes inside
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
        this.cameraX = Player.x - Engine.W / 2;
        this.cameraY = Player.y - Engine.H / 2;
        this.cameraX = Math.max(0, Math.min(this.cameraX, 30 * 16 - Engine.W));
        this.cameraY = Math.max(0, Math.min(this.cameraY, 20 * 16 - Engine.H));
    },

    updateExplore(dt) {
        Player.update(dt, (x, y) => TileMap.checkCollision(this.map, x, y));
        Dialogue.update(dt);
        if (Dialogue.active) return;

        // Check hotspot interactions
        for (const hs of this.hotspots) {
            if (!hs.active) continue;
            if (hs.containsPoint(Player.x, Player.y)) {
                if (Engine.justPressed('Space') || Engine.justPressed('KeyZ')) {
                    this.interactHotspot(hs);
                }
            }
        }

        // Check NPC interactions
        for (const npc of this.npcs) {
            if (!npc.visible) continue;
            if (npc.distTo(Player.x, Player.y) < 24) {
                if (Engine.justPressed('Space') || Engine.justPressed('KeyZ')) {
                    this.interactNPC(npc);
                }
            }
        }

        // Track pond visits
        if (Player.x > 12 * 16 && Player.x < 20 * 16 && Player.y > 13 * 16 && Player.y < 15 * 16) {
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
        // Move player to home area
        this.baNoi.visible = true;
        this.baNoi.x = 9 * 16;
        this.baNoi.y = 9 * 16;

        Dialogue.startRaw(Engine.getDialogue('ch1_unease'), () => {
            // Transition to Chapter 2
            Engine.setFlag('ch1_complete');
            Engine.fadeToScene(Chapter2Scene);
        });
    },

    render(ctx) {
        if (this.phase === 'title_card') {
            // Chapter title card
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, Engine.W, Engine.H);
            ctx.globalAlpha = this.titleAlpha;
            Engine.drawTextCentered(ctx, Engine.t('chapter_1_title'), Engine.H / 2, '#e8d8c0', 10);
            ctx.globalAlpha = 1;
            return;
        }

        // Render world
        TileMap.renderMap(ctx, this.map, this.cameraX, this.cameraY, 1);

        // Render hotspots
        this.hotspots.forEach(hs => hs.render(ctx, this.cameraX, this.cameraY));

        // Render NPCs (behind player if above, in front if below)
        const behindNPCs = this.npcs.filter(n => n.y <= Player.y);
        const frontNPCs = this.npcs.filter(n => n.y > Player.y);

        behindNPCs.forEach(n => n.render(ctx, this.cameraX, this.cameraY));
        Player.render(ctx, this.cameraX, this.cameraY);
        frontNPCs.forEach(n => n.render(ctx, this.cameraX, this.cameraY));

        // Warm overlay for Ch.1
        ctx.fillStyle = 'rgba(200, 150, 50, 0.05)';
        ctx.fillRect(0, 0, Engine.W, Engine.H);

        // Interaction hints
        if (this.phase === 'explore' && !Dialogue.active) {
            for (const hs of this.hotspots) {
                if (hs.active && !this.visitedHotspots[hs.id] && hs.containsPoint(Player.x, Player.y)) {
                    Engine.drawTextCentered(ctx, Engine.t('interact_hint'), 12, '#ffd700', 7);
                }
            }
            for (const npc of this.npcs) {
                if (npc.visible && npc.distTo(Player.x, Player.y) < 24) {
                    Engine.drawTextCentered(ctx, Engine.t('interact_hint'), 12, '#ffd700', 7);
                }
            }
            // Move hint at start
            if (this.timer < 5) {
                Engine.drawTextCentered(ctx, Engine.t('move_hint'), Engine.H - 54, '#808090', 6);
            }
        }

        // Dialogue
        Dialogue.render(ctx);
    },
};
