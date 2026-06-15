// Paper Boats — Chapter 2: Những Ngày Mùa Hè
// Pixel-live cutscenes: Minh and Thu actually move, walk and gesture in-engine
// on the real village world — no more glued static paintings with a frozen
// character. Each scene has a "stage" (camera + mood + props) and a small bit
// of choreography so the world always feels alive.
const Chapter2Scene = {
    phase: 'title_card',
    timer: 0,
    titleAlpha: 0,
    map: null,
    cameraX: 0,
    cameraY: 0,
    // actors
    minh: null,
    thuNPC: null,
    bap: null,
    actors: [],
    // stage
    sceneTag: '',
    env: 'day',
    zone: null,
    camFocusX: 0,
    camFocusY: 0,
    wanderT: 0,
    accentT: 0,
    _lastLine: -1,
    lanterns: [],
    boats: [],
    glints: [],
    thuFade: 1,
    // Firefly mini-game
    fireflies: [],
    caughtFireflies: 0,

    init() {
        this.phase = 'title_card';
        this.timer = 0;
        this.titleAlpha = 0;
        this.caughtFireflies = 0;
        this.fireflies = [];
        this.lanterns = [];
        this.boats = [];
        this.glints = [];
        this.thuFade = 1;
        this._lastLine = -1;
        this.createMap();

        // Pond-bank meadow is our main stage (grass just above the pond water).
        Player.reset(10 * 16, 12 * 16);
        this.minh = new NPC('Minh', 'minh', 10 * 16, 12 * 16 + 4, 'right');
        this.thuNPC = new NPC('Thu', 'thu', 12 * 16, 12 * 16 + 4, 'left', true);
        this.bap = new NPC('Bắp', 'bap', 18 * 16, 9 * 16 + 8, 'left');
        this.bap.visible = false;
        this.actors = [this.minh, this.thuNPC, this.bap];

        Audio.playMusic('village_day');
    },

    createMap() {
        const T = TileMap.TILES;
        this.map = [];
        for (let r = 0; r < 20; r++) {
            this.map[r] = [];
            for (let c = 0; c < 30; c++) {
                let tile = T.GRASS;
                // Path
                if (r >= 9 && r <= 10 && c >= 2 && c <= 27) tile = T.DIRT;
                if (c >= 14 && c <= 15 && r >= 10 && r <= 17) tile = T.DIRT;
                // River (right side)
                if (c >= 22 && c <= 28 && r >= 8 && r <= 18) tile = T.WATER;
                if (c === 21 && r >= 10 && r <= 16) tile = T.WATER;
                // Banyan tree
                if (r >= 3 && r <= 5 && c >= 3 && c <= 5) tile = T.BANYAN;
                if (r === 6 && c === 3) tile = T.SHRINE;
                // Pond
                if (r >= 14 && r <= 17 && c >= 8 && c <= 14) tile = T.WATER;
                // Trees
                if (r === 2 && c === 10) tile = T.TREE;
                if (r === 7 && c === 18) tile = T.TREE;
                if (r === 13 && c === 5) tile = T.TREE;
                // Bamboo border
                if (r === 0 || r === 19) tile = T.BAMBOO;
                if (c === 0 || c === 29) tile = T.BAMBOO;
                this.map[r][c] = tile;
            }
        }
    },

    // ======================================================================
    //  STAGE — set the camera, mood and props for a cutscene, place actors.
    // ======================================================================
    enterScene(tag) {
        this.sceneTag = tag;
        this._lastLine = -1;
        this.wanderT = 0;
        this.accentT = 0;
        this.bap.visible = false;

        // default pond-bank meadow zone (world px rectangle the actors live in)
        this.zone = { x: 7 * 16, y: 11 * 16, w: 7 * 16, h: 2 * 16 };
        this.camFocusX = 10 * 16;
        this.camFocusY = 12 * 16;

        switch (tag) {
            case 'fireflies':
                this.env = 'night';
                this.spawnGlints(16);
                this.place(this.minh, 9 * 16, 12 * 16, 'right');
                this.place(this.thuNPC, 11 * 16, 12 * 16, 'left');
                this.thuNPC.tx = 12 * 16; this.thuNPC.ty = 11 * 16 + 8;
                break;
            case 'boats':
                this.env = 'dusk';
                this.boats = [];
                this.place(this.minh, 9 * 16, 12 * 16, 'right');
                this.place(this.thuNPC, 11 * 16, 12 * 16 + 6, 'left');
                break;
            case 'jealousy':
                this.env = 'day';
                this.zone = { x: 6 * 16, y: 11 * 16, w: 8 * 16, h: 2 * 16 };
                this.place(this.minh, 9 * 16, 12 * 16, 'right');
                this.place(this.thuNPC, 11 * 16, 12 * 16, 'left');
                this.bap.visible = false;
                this.place(this.bap, 19 * 16, 10 * 16, 'left');
                break;
            case 'song':
                this.env = 'night';
                this.place(this.minh, 10 * 16, 12 * 16, 'right');
                this.place(this.thuNPC, 12 * 16, 12 * 16 + 6, 'down');
                break;
            case 'wish':
                this.env = 'night';
                this.place(this.minh, 10 * 16, 12 * 16, 'right');
                this.place(this.thuNPC, 12 * 16, 12 * 16, 'up');
                break;
            case 'ghost':
                this.env = 'festival';
                this.lanterns = [];
                this.place(this.minh, 10 * 16, 12 * 16, 'right');
                this.place(this.thuNPC, 12 * 16, 12 * 16, 'left');
                this.thuFade = 1;
                break;
            case 'silence':
                this.env = 'cold';
                this.place(this.minh, 10 * 16, 12 * 16, 'right');
                this.place(this.thuNPC, 12 * 16, 12 * 16, 'left');
                break;
        }
    },

    place(a, x, y, dir) { a.x = x; a.y = y; a.tx = x; a.ty = y; a.dir = dir; a.walking = false; a.alpha = a.isGhost ? 0.9 : 1; },

    spawnGlints(n) {
        this.glints = [];
        for (let i = 0; i < n; i++) {
            this.glints.push({
                x: 7 * 16 + Math.random() * 8 * 16,
                y: 9 * 16 + Math.random() * 5 * 16,
                ph: Math.random() * 6.28,
                sp: 0.3 + Math.random() * 0.5,
            });
        }
    },

    // ======================================================================
    //  UPDATE
    // ======================================================================
    update(dt) {
        this.timer += dt;

        switch (this.phase) {
            case 'title_card':
                this.titleAlpha = Math.min(1, this.timer * 0.8);
                if (this.timer > 2.5 || Engine.anyInteract()) {
                    this.timer = 0;
                    this.startFirefliesScene();
                }
                break;

            case 'scene_fireflies':
            case 'scene_boats':
            case 'scene_jealousy':
            case 'scene_song':
            case 'scene_wish':
            case 'scene_ghost':
            case 'scene_silence':
                this.updateStage(dt);
                break;

            case 'minigame_fireflies':
                this.updateFireflyGame(dt);
                break;

            case 'minigame_boat':
                this.updateBoatGame(dt);
                break;
        }
    },

    updateStage(dt) {
        Dialogue.update(dt);
        this.actors.forEach(a => a.update(dt));

        // props
        this.updateProps(dt);

        // ambient liveliness: stroll within the zone so nobody stands frozen
        this.wanderT -= dt;
        if (this.wanderT <= 0 && this.zone && this.sceneTag !== 'silence') {
            this.wanderT = 1.4 + Math.random() * 1.4;
            const z = this.zone;
            // Thu wanders a little; Minh drifts toward Thu but keeps a gap
            if (this.thuNPC.atTarget() && this.thuNPC.alpha > 0.05) {
                this.thuNPC.walkTo(z.x + Math.random() * z.w, z.y + Math.random() * z.h);
            }
            if (this.minh.atTarget()) {
                const gx = this.thuNPC.x - 18 - Math.random() * 8;
                this.minh.walkTo(Math.max(z.x, gx), this.thuNPC.y + (Math.random() - 0.5) * 10, 'right');
            }
            // playful hop on the happy scenes
            if ((this.sceneTag === 'fireflies' || this.sceneTag === 'wish') && Math.random() < 0.5) this.thuNPC.hop();
        }

        // emotional accents fired on each new dialogue line
        if (Dialogue.active && Dialogue.currentIndex !== this._lastLine) {
            this._lastLine = Dialogue.currentIndex;
            this.accent(Dialogue.currentIndex);
        }

        // camera eases toward the focus (mid-point of the two leads, mostly)
        const fx = this.sceneTag === 'jealousy' && this.bap.visible
            ? (this.minh.x + this.bap.x) / 2
            : (this.minh.x + this.thuNPC.x) / 2;
        const fy = (this.minh.y + this.thuNPC.y) / 2 - 6;
        let cx = fx - Engine.W / 2, cy = fy - Engine.H / 2;
        cx = Math.max(0, Math.min(cx, 30 * 16 - Engine.W));
        cy = Math.max(0, Math.min(cy, 20 * 16 - Engine.H));
        this.cameraX += (cx - this.cameraX) * Math.min(1, dt * 3);
        this.cameraY += (cy - this.cameraY) * Math.min(1, dt * 3);
    },

    // Scene-specific beats keyed to the current dialogue line index.
    accent(line) {
        switch (this.sceneTag) {
            case 'fireflies':
                this.thuNPC.hop();
                break;
            case 'boats':
                if (line >= 1) this.spawnBoat();
                break;
            case 'jealousy':
                if (this.phase === 'scene_jealousy') {
                    // Thu jealous: she turns away from Minh
                    if (line === 1) { this.thuNPC.face('left'); this.thuNPC.walkTo(this.thuNPC.x - 14, this.thuNPC.y, 'left'); }
                } else {
                    // jealousy_after: Bắp walks in and looks right through Thu's spot
                    if (line === 0) { this.bap.visible = true; this.bap.walkTo(13 * 16, 12 * 16, 'left'); }
                    if (line === 2) { this.bap.face('left'); this.thuNPC.alpha = 0; this.thuNPC.tremble(0.1); } // Thu unseen
                    if (line === 3) { this.minh.face('left'); }
                    if (line === 4) { this.thuNPC.alpha = 0.9; this.bap.visible = false; this.bap.x = 19 * 16; } // Thu back
                    if (line === 5) { this.thuNPC.hop(); }
                }
                break;
            case 'song':
                this.minh.face('right');
                break;
            case 'wish':
                this.thuNPC.face('up'); this.thuNPC.hop();
                break;
            case 'ghost':
                this.thuNPC.tremble(0.4);
                break;
            case 'silence':
                if (line === 1) this.thuNPC.tremble(0.6);
                // on the narration line she stands and walks away mid-sentence
                if (line >= 4) { this.thuNPC.face('left'); this.thuNPC.walkTo(2 * 16, 11 * 16, 'left'); this.minh.face('left'); }
                break;
        }
    },

    updateProps(dt) {
        if (this.sceneTag === 'fireflies') {
            for (const g of this.glints) { g.ph += dt * g.sp; }
        } else if (this.sceneTag === 'boats') {
            for (const b of this.boats) { b.x += b.vx * dt; b.bob += dt; }
            this.boats = this.boats.filter(b => b.x < 30 * 16);
        } else if (this.sceneTag === 'ghost') {
            // spawn drifting lanterns over the pond (on-camera) so they're visible
            if (Math.random() < dt * 5) {
                this.lanterns.push({ x: 8 * 16 + Math.random() * 7 * 16, y: 17 * 16, vy: -7 - Math.random() * 6, sway: Math.random() * 6, life: 0 });
            }
            for (const l of this.lanterns) { l.y += l.vy * dt; l.life += dt; l.x += Math.sin(l.life + l.sway) * dt * 4; }
            this.lanterns = this.lanterns.filter(l => l.y > -10);
            // Thu slowly fades during the festival (foreshadow)
            this.thuFade = Math.max(0, this.thuFade - dt * 0.04);
            this.thuNPC.alpha = 0.9 * this.thuFade;
        }
    },

    spawnBoat() {
        this.boats.push({ x: 7 * 16, y: 15 * 16 + 8 + Math.random() * 8, vx: 8 + Math.random() * 6, bob: Math.random() * 6 });
    },

    // ======================================================================
    //  SCENE FLOW (dialogue beats) — each opens with enterScene(tag)
    // ======================================================================
    startFirefliesScene() {
        this.phase = 'scene_fireflies';
        this.enterScene('fireflies');
        Dialogue.startRaw(Engine.getDialogue('ch2_fireflies_start'), () => {
            this.phase = 'minigame_fireflies';
            this.timer = 0;
            this.caughtFireflies = 0;
            this.fireflies = [];
            for (let i = 0; i < 12; i++) {
                this.fireflies.push({
                    x: 40 + Math.random() * 240,
                    y: 30 + Math.random() * 100,
                    vx: (Math.random() - 0.5) * 30,
                    vy: (Math.random() - 0.5) * 20,
                    brightness: Math.random(),
                    caught: false,
                    changeTimer: Math.random() * 2,
                });
            }
        });
    },

    updateFireflyGame(dt) {
        this.timer += dt;
        for (const f of this.fireflies) {
            if (f.caught) continue;
            f.changeTimer -= dt;
            if (f.changeTimer <= 0) {
                f.vx = (Math.random() - 0.5) * 40;
                f.vy = (Math.random() - 0.5) * 25;
                f.changeTimer = 1 + Math.random() * 2;
            }
            f.x += f.vx * dt;
            f.y += f.vy * dt;
            f.x = Math.max(20, Math.min(300, f.x));
            f.y = Math.max(20, Math.min(140, f.y));
            f.brightness = 0.4 + 0.6 * Math.abs(Math.sin(Engine.frameCount * 0.05 + f.x));
        }
        if (Engine.mouseClicked) {
            for (const f of this.fireflies) {
                if (f.caught) continue;
                if (Math.hypot(f.x - Engine.mouseX, f.y - Engine.mouseY) < 10) {
                    f.caught = true; this.caughtFireflies++;
                    Audio.playSFX('firefly_catch'); break;
                }
            }
        }
        if (this.caughtFireflies >= 5) {
            Engine.keepMemory('mem_fireflies');
            if (typeof Notebook !== 'undefined') Notebook.addClue('firefly_souls');
            this.phase = 'scene_fireflies';
            this.enterScene('fireflies');
            this.thuNPC.hop();
            Dialogue.startRaw(Engine.getDialogue('ch2_fireflies_end'), () => { this.startBoatsScene(); });
        }
        if (Engine.justPressed('Space')) {
            for (const f of this.fireflies) {
                if (!f.caught) { f.caught = true; this.caughtFireflies++; Audio.playSFX('firefly_catch'); break; }
            }
        }
    },

    startBoatsScene() {
        this.phase = 'scene_boats';
        this.enterScene('boats');
        Dialogue.startRaw(Engine.getDialogue('ch2_boats'), () => {
            Dialogue.showChoice('ch2_boats_choice', (choice) => {
                if (choice.memory) Engine.keepMemory(choice.memory);
                if (choice.next === 'ch2_boats_teach') {
                    this.startBoatFold();
                } else {
                    Dialogue.startRaw(Engine.getDialogue(choice.next), () => { this.startJealousyScene(); });
                }
            });
        });
    },

    // ---- Paper-boat folding mini-game ------------------------------------
    startBoatFold() {
        this.phase = 'minigame_boat';
        this.boatStep = 0;
        this.boatShake = 0;
        this.boatStageT = 1;
        this.boatSteps = [
            { key: 'ArrowDown',  vi: 'Gập đôi tờ giấy xuống', en: 'Fold the sheet in half', arrow: '↓' },
            { key: 'ArrowRight', vi: 'Miết mép cho thật thẳng', en: 'Crease the edge flat',  arrow: '→' },
            { key: 'ArrowUp',    vi: 'Bẻ hai góc lên thành mũ', en: 'Bend the corners up',   arrow: '↑' },
            { key: 'ArrowLeft',  vi: 'Mở bụng thuyền ra',      en: 'Open out the hull',      arrow: '←' },
            { key: 'Space',      vi: 'Vuốt nhẹ cho thuyền nở',  en: 'Smooth it into shape',   arrow: '○' },
        ];
    },

    updateBoatGame(dt) {
        this.timer += dt;
        if (this.boatShake > 0) this.boatShake = Math.max(0, this.boatShake - dt);
        if (this.boatStageT < 1) this.boatStageT = Math.min(1, this.boatStageT + dt * 4);

        const step = this.boatSteps[this.boatStep];
        if (!step) return;
        const want = step.key;
        const pressedRight = Engine.justPressed(want)
            || (want === 'Space' && (Engine.justPressed('Enter') || Engine.justPressed('KeyZ') || Engine.mouseClicked));
        const pressedAnyArrow = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].some(k => Engine.justPressed(k));

        if (pressedRight) {
            this.boatStep++;
            this.boatStageT = 0;
            if (typeof Audio !== 'undefined' && Audio.playSFX) Audio.playSFX('firefly_catch');
            if (this.boatStep >= this.boatSteps.length) {
                if (typeof Notebook !== 'undefined') Notebook.addClue('thu_cold_hands');
                this.phase = 'scene_boats';
                this.enterScene('boats');
                this.spawnBoat();
                Dialogue.startRaw(Engine.getDialogue('ch2_boats_teach'), () => { this.startJealousyScene(); });
            }
        } else if (pressedAnyArrow) {
            this.boatShake = 0.25;
        }
    },

    startJealousyScene() {
        this.phase = 'scene_jealousy';
        this.enterScene('jealousy');
        Dialogue.startRaw(Engine.getDialogue('ch2_jealousy'), () => {
            // switch to the "after" beat (Bắp arrives, looks through Thu)
            this._lastLine = -1;
            Dialogue.startRaw(Engine.getDialogue('ch2_jealousy_after'), () => {
                if (typeof Notebook !== 'undefined') { Notebook.meetPerson('bap'); Notebook.addClue('bap_cant_see'); }
                this.startSongScene();
            });
        });
    },

    startSongScene() {
        this.phase = 'scene_song';
        this.enterScene('song');
        Dialogue.startRaw(Engine.getDialogue('ch2_song_intro'), () => {
            Dialogue.showChoice('ch2_song_choice', (choice) => {
                if (choice.memory) Engine.keepMemory(choice.memory);
                Dialogue.startRaw(Engine.getDialogue(choice.next), () => { this.startWishScene(); });
            });
        });
    },

    startWishScene() {
        this.phase = 'scene_wish';
        this.enterScene('wish');
        if (typeof Notebook !== 'undefined') Notebook.addClue('thu_wish');
        Dialogue.startRaw(Engine.getDialogue('ch2_wish'), () => { this.startGhostFestival(); });
    },

    startGhostFestival() {
        this.phase = 'scene_ghost';
        this.enterScene('ghost');
        Audio.stopMusic();
        Dialogue.startRaw(Engine.getDialogue('ch2_ghost_festival'), () => {
            setTimeout(() => {
                Audio.playMusic('village_day');
                if (typeof Notebook !== 'undefined') Notebook.addClue('thu_vanish_ram');
                this._lastLine = -1;
                Dialogue.startRaw(Engine.getDialogue('ch2_ghost_festival_after'), () => { this.startSilenceScene(); });
            }, 2000);
        });
    },

    startSilenceScene() {
        this.phase = 'scene_silence';
        this.enterScene('silence');
        Dialogue.startRaw(Engine.getDialogue('ch2_silence'), () => {
            Engine.setFlag('ch2_complete');
            if (typeof NightVision !== 'undefined') NightVision.unlock();
            Engine.fadeToScene(typeof FerrymanCaseScene !== 'undefined' ? FerrymanCaseScene : Chapter3Scene);
        });
    },

    // ======================================================================
    //  RENDER
    // ======================================================================
    render(ctx) {
        if (this.phase === 'title_card') {
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, Engine.W, Engine.H);
            ctx.globalAlpha = Math.min(1, this.timer * 0.8);
            Engine.drawTextCentered(ctx, Engine.t('chapter_2_title'), Engine.H / 2, '#e8d8c0', 10);
            ctx.globalAlpha = 1;
            return;
        }
        if (this.phase === 'minigame_fireflies') { this.renderFireflyGame(ctx); return; }
        if (this.phase === 'minigame_boat') { this.renderBoatGame(ctx); return; }

        this.drawWorld(ctx);
        Dialogue.render(ctx);
    },

    drawWorld(ctx) {
        const cx = Math.round(this.cameraX), cy = Math.round(this.cameraY);
        // live tilemap world (chapter 2 tint)
        TileMap.renderMap(ctx, this.map, cx, cy, 2);

        // behind-actor props
        if (this.sceneTag === 'boats') this.renderBoats(ctx, cx, cy, 'water');

        // actors, depth-sorted by feet
        const ents = this.actors.filter(a => a.visible && a.alpha > 0.02);
        ents.push({ y: -9999, render: () => {} }); // guard
        ents.sort((a, b) => a.y - b.y);
        ents.forEach(e => e.render && e.render(ctx, cx, cy));

        // front props / atmosphere by mood
        this.renderMood(ctx, cx, cy);
    },

    renderBoats(ctx, cx, cy, layer) {
        for (const b of this.boats) {
            const sx = Math.floor(b.x - cx), sy = Math.floor(b.y - cy + Math.sin(b.bob) * 1.2);
            ctx.fillStyle = '#f4efe2';
            ctx.beginPath();
            ctx.moveTo(sx - 5, sy); ctx.lineTo(sx + 5, sy); ctx.lineTo(sx + 3, sy + 3); ctx.lineTo(sx - 3, sy + 3); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(sx, sy - 4); ctx.lineTo(sx + 4, sy); ctx.lineTo(sx, sy); ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(180,200,220,0.25)';
            ctx.fillRect(sx - 4, sy + 3, 8, 1);
        }
    },

    renderMood(ctx, cx, cy) {
        const W = Engine.W, H = Engine.H;
        switch (this.env) {
            case 'day':
                ctx.fillStyle = 'rgba(255, 220, 120, 0.07)'; ctx.fillRect(0, 0, W, H);
                break;
            case 'dusk':
                ctx.fillStyle = 'rgba(180, 110, 70, 0.18)'; ctx.fillRect(0, 0, W, H);
                this.vignette(ctx, 0.28, '8,6,16');
                break;
            case 'night':
                ctx.fillStyle = 'rgba(16, 22, 48, 0.42)'; ctx.fillRect(0, 0, W, H);
                this.vignette(ctx, 0.4, '4,6,16');
                // drifting fireflies (only when staged)
                for (const g of this.glints || []) {
                    const a = 0.35 + 0.45 * Math.abs(Math.sin(g.ph));
                    const sx = Math.floor(g.x - cx + Math.sin(g.ph) * 4), sy = Math.floor(g.y - cy + Math.cos(g.ph * 0.7) * 3);
                    ctx.fillStyle = `rgba(210, 235, 130, ${a})`;
                    ctx.fillRect(sx, sy, 1.5, 1.5);
                    ctx.fillStyle = `rgba(210, 235, 130, ${a * 0.25})`;
                    ctx.fillRect(sx - 2, sy - 2, 5, 5);
                }
                break;
            case 'festival':
                ctx.fillStyle = 'rgba(10, 8, 26, 0.5)'; ctx.fillRect(0, 0, W, H);
                this.vignette(ctx, 0.45, '2,2,10');
                for (const l of this.lanterns) {
                    const sx = Math.floor(l.x - cx), sy = Math.floor(l.y - cy);
                    ctx.fillStyle = 'rgba(255, 150, 60, 0.22)';
                    ctx.beginPath(); ctx.arc(sx, sy, 4, 0, 6.28); ctx.fill();
                    ctx.fillStyle = '#ffcf7a';
                    ctx.fillRect(sx - 1.5, sy - 2, 3, 4);
                    ctx.fillStyle = '#ff8a3a';
                    ctx.fillRect(sx - 1, sy - 1, 2, 2);
                }
                break;
            case 'cold':
                ctx.fillStyle = 'rgba(46, 58, 96, 0.34)'; ctx.fillRect(0, 0, W, H);
                this.vignette(ctx, 0.4, '10,16,34');
                break;
        }
    },

    vignette(ctx, strength, rgb) {
        const W = Engine.W, H = Engine.H;
        const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(1, `rgba(${rgb},${strength})`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    },

    // ---- mini-game renders (unchanged visuals) ---------------------------
    renderBoatGame(ctx) {
        const W = Engine.W, H = Engine.H;
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#42506e'); g.addColorStop(0.6, '#5a4a52'); g.addColorStop(1, '#2a3a3a');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(30,50,70,0.55)';
        ctx.fillRect(0, H * 0.72, W, H * 0.28);

        Engine.drawTextCentered(ctx, Engine.locale === 'vi' ? 'GẤP THUYỀN GIẤY' : 'FOLD THE PAPER BOAT', 20, '#ffe6a8', 10, 800);

        const total = this.boatSteps.length;
        const stage = this.boatStep;
        let cx = W / 2, cy = H * 0.5;
        if (this.boatShake > 0) cx += Math.sin(Engine.frameCount * 0.9) * this.boatShake * 10;
        this.drawPaperStage(ctx, cx, cy, stage, total);

        const dotY = H * 0.68, gap = 9, startX = W / 2 - (total - 1) * gap / 2;
        for (let i = 0; i < total; i++) {
            ctx.fillStyle = i < this.boatStep ? '#ffd24a' : 'rgba(255,255,255,0.25)';
            ctx.beginPath(); ctx.arc(startX + i * gap, dotY, 2, 0, Math.PI * 2); ctx.fill();
        }

        const step = this.boatSteps[this.boatStep];
        if (step) {
            const label = Engine.locale === 'vi' ? step.vi : step.en;
            const chipY = H - 30, chipS = 16;
            ctx.fillStyle = 'rgba(18,14,9,0.9)';
            Engine.roundRect(ctx, W / 2 - chipS / 2, chipY, chipS, chipS, 4); ctx.fill();
            ctx.strokeStyle = '#ffd24a'; ctx.lineWidth = 0.8;
            Engine.roundRect(ctx, W / 2 - chipS / 2, chipY, chipS, chipS, 4); ctx.stroke();
            ctx.fillStyle = '#ffe6a8'; ctx.font = Engine.font(11, 800);
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(step.arrow, W / 2, chipY + chipS / 2 + 0.5);
            ctx.textBaseline = 'alphabetic';
            Engine.drawTextCentered(ctx, label, H - 8, '#f1e9d8', 8, 600);
        }
    },

    drawPaperStage(ctx, cx, cy, stage, total) {
        ctx.save();
        ctx.translate(cx, cy);
        const paper = '#f4efe2', shade = '#d8d0bd', edge = 'rgba(120,110,90,0.6)';
        ctx.strokeStyle = edge; ctx.lineWidth = 0.7; ctx.lineJoin = 'round';
        if (stage <= 0) {
            ctx.fillStyle = paper; ctx.fillRect(-26, -18, 52, 36);
            ctx.strokeRect(-26, -18, 52, 36);
            ctx.strokeStyle = shade; ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, 18); ctx.stroke();
        } else if (stage === 1) {
            ctx.fillStyle = paper; ctx.fillRect(-26, -9, 52, 18);
            ctx.strokeRect(-26, -9, 52, 18);
            ctx.fillStyle = shade; ctx.fillRect(-26, -9, 52, 3);
        } else if (stage === 2) {
            ctx.fillStyle = paper;
            ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(26, 12); ctx.lineTo(-26, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = shade; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, 12); ctx.stroke();
        } else if (stage === 3) {
            ctx.fillStyle = paper;
            ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(24, 6); ctx.lineTo(-24, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.fillStyle = shade;
            ctx.beginPath(); ctx.moveTo(-26, 6); ctx.lineTo(26, 6); ctx.lineTo(20, 12); ctx.lineTo(-20, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
        } else {
            const bob = Math.sin(Engine.frameCount * 0.06) * 1.2;
            ctx.translate(0, bob);
            ctx.fillStyle = paper;
            ctx.beginPath();
            ctx.moveTo(-28, 2); ctx.lineTo(28, 2); ctx.lineTo(18, 16); ctx.lineTo(-18, 16); ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.strokeStyle = shade; ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, 16); ctx.stroke();
            ctx.fillStyle = paper; ctx.strokeStyle = edge;
            ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(24, 1); ctx.lineTo(0, 1); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(-24, 1); ctx.lineTo(0, 1); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.globalAlpha = 0.18; ctx.fillStyle = '#cfe2ee';
            ctx.beginPath(); ctx.moveTo(-18, 18); ctx.lineTo(18, 18); ctx.lineTo(12, 26); ctx.lineTo(-12, 26); ctx.closePath(); ctx.fill();
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    },

    renderFireflyGame(ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, Engine.H);
        grad.addColorStop(0, '#050510'); grad.addColorStop(0.5, '#0a0a1a'); grad.addColorStop(1, '#0a1a0a');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, Engine.W, Engine.H);
        for (let i = 0; i < 20; i++) {
            const sx = (i * 37 + 13) % Engine.W;
            const sy = (i * 23 + 7) % (Engine.H * 0.4);
            const br = 0.3 + 0.7 * Math.abs(Math.sin(Engine.frameCount * 0.02 + i));
            ctx.fillStyle = `rgba(255, 255, 220, ${br})`;
            ctx.fillRect(sx, sy, 1, 1);
        }
        ctx.fillStyle = '#0a1a0a';
        ctx.fillRect(0, Engine.H * 0.75, Engine.W, Engine.H * 0.25);

        for (const f of this.fireflies) {
            if (f.caught) continue;
            const glow = f.brightness;
            ctx.fillStyle = `rgba(200, 230, 100, ${glow})`;
            ctx.fillRect(Math.floor(f.x) - 1, Math.floor(f.y) - 1, 3, 3);
            ctx.fillStyle = `rgba(200, 230, 100, ${glow * 0.2})`;
            ctx.fillRect(Math.floor(f.x) - 3, Math.floor(f.y) - 3, 7, 7);
        }

        ctx.fillStyle = '#e8e0c0';
        ctx.font = '8px monospace';
        ctx.fillText(`🫙 ${this.caughtFireflies} / 5`, 10, 16);
        const hint = Engine.locale === 'vi' ? 'Click vào đom đóm để bắt (hoặc nhấn SPACE)' : 'Click fireflies to catch (or press SPACE)';
        Engine.drawTextCentered(ctx, hint, Engine.H - 10, '#808090', 6);
    },
};
