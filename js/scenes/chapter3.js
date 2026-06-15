// Paper Boats — Chapter 3: Vết Nứt
const Chapter3Scene = {
    phase: 'title_card',
    timer: 0,
    map: null,
    cameraX: 0,
    cameraY: 0,
    npcs: [],
    thuNPC: null,
    ongTuNPC: null,
    hotspots: [],
    foundGrave: false,
    foundNotebook: false,
    metOngTu: false,
    cinematicZoom: 1,
    cinematicDim: 0,

    init() {
        this.phase = 'title_card';
        this.timer = 0;
        this.foundGrave = false;
        this.foundNotebook = false;
        this.metOngTu = false;
        this.cinematicZoom = 1;
        this.cinematicDim = 0;
        this.createMap();
        this.createNPCs();
        Player.reset(10 * 16, 12 * 16);
        Audio.playMusic('doubt');
    },

    createMap() {
        const T = TileMap.TILES;
        this.map = [];
        for (let r = 0; r < 20; r++) {
            this.map[r] = [];
            for (let c = 0; c < 30; c++) {
                let tile = T.GRASS;
                // Paths
                if (r >= 9 && r <= 10 && c >= 2 && c <= 27) tile = T.DIRT;
                if (c >= 14 && c <= 15 && r >= 10 && r <= 17) tile = T.DIRT;
                if (c >= 4 && c <= 5 && r >= 5 && r <= 9) tile = T.DIRT;
                // River
                if (c >= 22 && c <= 28 && r >= 6 && r <= 18) tile = T.WATER;
                if (c === 21 && r >= 8 && r <= 16) tile = T.WATER;
                // Banyan tree area
                if (r >= 3 && r <= 5 && c >= 3 && c <= 5) tile = T.BANYAN;
                if (r === 6 && c === 3) tile = T.SHRINE;
                // Grave (off main path)
                if (r === 4 && c === 7) tile = T.GRAVE;
                // Grandma's house (with indoor area for notebook)
                if (r >= 11 && r <= 13 && c >= 7 && c <= 10) tile = T.HOUSE;
                if (r === 13 && c === 8) tile = T.DIRT; // door
                // Trees
                if (r === 7 && c === 13) tile = T.TREE;
                if (r === 2 && c === 12) tile = T.TREE;
                if (r === 15 && c === 5) tile = T.TREE;
                if (r === 6 && c === 18) tile = T.TREE;
                // Bamboo border
                if (r === 0 || r === 19) tile = T.BAMBOO;
                if (c === 0 || c === 29) tile = T.BAMBOO;
                this.map[r][c] = tile;
            }
        }
    },

    createNPCs() {
        // Ông Tư at the riverbank
        this.ongTuNPC = new NPC('Ông Tư', 'ong_tu', 20 * 16, 12 * 16, 'left');
        this.npcs = [this.ongTuNPC];

        this.hotspots = [
            new Hotspot(7 * 16, 4 * 16, 16, 16, 'grave', ''),
            new Hotspot(8 * 16, 12 * 16, 16, 16, 'notebook', ''),
        ];
    },

    update(dt) {
        this.timer += dt;

        switch (this.phase) {
            case 'title_card':
                if (this.timer > 2.5 || Engine.anyInteract()) {
                    this.phase = 'explore';
                    this.timer = 0;
                }
                break;

            case 'explore':
                Player.update(dt, (x, y) => TileMap.checkCollision(this.map, x, y));
                Dialogue.update(dt);
                this.npcs.forEach(n => n.update(dt));
                this.cameraX = Player.x - Engine.W / 2;
                this.cameraY = Player.y - Engine.H / 2;
                this.cameraX = Math.max(0, Math.min(this.cameraX, 30 * 16 - Engine.W));
                this.cameraY = Math.max(0, Math.min(this.cameraY, 20 * 16 - Engine.H));

                if (!Dialogue.active) {
                    this.checkInteractions();
                }
                break;

            case 'dialogue':
            case 'cinematic':
                Dialogue.update(dt);
                this.npcs.forEach(n => n.update(dt));
                // Cinematic zoom
                if (this.cinematicZoom > 1) {
                    this.cinematicDim = Math.min(0.4, this.cinematicDim + dt * 0.3);
                }
                break;
        }
    },

    checkInteractions() {
        // Grave hotspot
        if (!this.foundGrave) {
            const graveHS = this.hotspots[0];
            if (graveHS.containsPoint(Player.x, Player.y)) {
                if (Engine.justPressed('Space') || Engine.justPressed('KeyZ')) {
                    this.foundGrave = true;
                    Engine.keepMemory('mem_grave');
                    this.phase = 'dialogue';
                    Player.lock();
                    Dialogue.startRaw(Engine.getDialogue('ch3_grave'), () => {
                        Player.unlock();
                        this.phase = 'explore';
                    });
                }
            }
        }

        // Notebook hotspot
        if (!this.foundNotebook) {
            const noteHS = this.hotspots[1];
            if (noteHS.containsPoint(Player.x, Player.y)) {
                if (Engine.justPressed('Space') || Engine.justPressed('KeyZ')) {
                    this.foundNotebook = true;
                    this.phase = 'dialogue';
                    Player.lock();
                    Dialogue.startRaw(Engine.getDialogue('ch3_notebook'), () => {
                        Player.unlock();
                        this.phase = 'explore';
                    });
                }
            }
        }

        // Ông Tư interaction
        if (!this.metOngTu && this.ongTuNPC.distTo(Player.x, Player.y) < 24) {
            if (Engine.justPressed('Space') || Engine.justPressed('KeyZ')) {
                this.metOngTu = true;
                this.phase = 'dialogue';
                Player.lock();
                Audio.stopMusic();
                Dialogue.startRaw(Engine.getDialogue('ch3_ongtu'), () => {
                    // Cinematic moment
                    this.phase = 'cinematic';
                    this.cinematicZoom = 1.5;
                    Dialogue.startRaw(Engine.getDialogue('ch3_ongtu_cine'), () => {
                        // Fade to black, silence, then chapter 4
                        this.cinematicZoom = 1;
                        this.cinematicDim = 0;
                        Engine.setFlag('ch3_complete');
                        Engine.fadeToScene(Chapter4AScene);
                    });
                });
            }
        }

        // Auto-trigger Ông Tư if player goes near river after some exploration
        if (!this.metOngTu && Player.x > 18 * 16 && (this.foundGrave || this.foundNotebook || this.timer > 30)) {
            // Move Ông Tư closer if player hasn't found him
        }
    },

    render(ctx) {
        if (this.phase === 'title_card') {
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, Engine.W, Engine.H);
            ctx.globalAlpha = Math.min(1, this.timer * 0.8);
            Engine.drawTextCentered(ctx, Engine.t('chapter_3_title'), Engine.H / 2, '#c0b8a0', 10);
            ctx.globalAlpha = 1;
            return;
        }

        // Apply cinematic zoom
        if (this.cinematicZoom > 1) {
            ctx.save();
            const cx = Engine.W / 2;
            const cy = Engine.H / 2;
            ctx.translate(cx, cy);
            ctx.scale(this.cinematicZoom, this.cinematicZoom);
            ctx.translate(-cx, -cy);
        }

        // Render world
        TileMap.renderMap(ctx, this.map, this.cameraX, this.cameraY, 3);

        // Render hotspots
        this.hotspots.forEach(hs => {
            if ((hs.id === 'grave' && !this.foundGrave) || (hs.id === 'notebook' && !this.foundNotebook)) {
                hs.render(ctx, this.cameraX, this.cameraY);
            }
        });

        // Render NPCs and player
        const allEntities = [...this.npcs.filter(n => n.visible), { y: Player.y, render: (c, cx, cy) => Player.render(c, cx, cy) }];
        allEntities.sort((a, b) => a.y - b.y);
        allEntities.forEach(e => e.render(ctx, this.cameraX, this.cameraY));

        if (this.cinematicZoom > 1) {
            ctx.restore();
        }

        // Chapter 3 atmosphere: desaturated, slightly blue
        ctx.fillStyle = 'rgba(30, 40, 60, 0.08)';
        ctx.fillRect(0, 0, Engine.W, Engine.H);

        // Cinematic dim
        if (this.cinematicDim > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.cinematicDim})`;
            ctx.fillRect(0, 0, Engine.W, Engine.H);
        }

        // Interaction hints
        if (this.phase === 'explore' && !Dialogue.active) {
            // Grave hint
            if (!this.foundGrave && this.hotspots[0].containsPoint(Player.x, Player.y)) {
                Engine.drawTextCentered(ctx, Engine.t('interact_hint'), 12, '#ffd700', 7);
            }
            // Notebook hint
            if (!this.foundNotebook && this.hotspots[1].containsPoint(Player.x, Player.y)) {
                Engine.drawTextCentered(ctx, Engine.t('interact_hint'), 12, '#ffd700', 7);
            }
            // Ông Tư hint
            if (!this.metOngTu && this.ongTuNPC.distTo(Player.x, Player.y) < 24) {
                Engine.drawTextCentered(ctx, Engine.t('interact_hint'), 12, '#ffd700', 7);
            }
        }

        Dialogue.render(ctx);
    },
};
