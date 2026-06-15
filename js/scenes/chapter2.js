// Paper Boats — Chapter 2: Những Ngày Mùa Hè
const Chapter2Scene = {
    phase: 'title_card',
    timer: 0,
    titleAlpha: 0,
    subPhase: 0,
    map: null,
    cameraX: 0,
    cameraY: 0,
    npcs: [],
    thuNPC: null,
    // Firefly mini-game
    fireflies: [],
    caughtFireflies: 0,
    fireflyJar: [],

    init() {
        this.phase = 'title_card';
        this.timer = 0;
        this.titleAlpha = 0;
        this.subPhase = 0;
        this.caughtFireflies = 0;
        this.fireflies = [];
        this.createMap();
        Player.reset(8 * 16, 10 * 16);
        this.thuNPC = new NPC('Thu', 'thu', 12 * 16, 10 * 16, 'left', true);
        this.npcs = [this.thuNPC];
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

    update(dt) {
        this.timer += dt;

        switch (this.phase) {
            case 'title_card':
                this.titleAlpha = Math.min(1, this.timer * 0.8);
                if (this.timer > 2.5 || Engine.anyInteract()) {
                    this.phase = 'scene_fireflies';
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
                Dialogue.update(dt);
                this.npcs.forEach(n => n.update(dt));
                break;

            case 'minigame_fireflies':
                this.updateFireflyGame(dt);
                break;

            case 'explore_between':
                Player.update(dt, (x, y) => TileMap.checkCollision(this.map, x, y));
                Dialogue.update(dt);
                this.npcs.forEach(n => n.update(dt));
                this.cameraX = Player.x - Engine.W / 2;
                this.cameraY = Player.y - Engine.H / 2;
                this.cameraX = Math.max(0, Math.min(this.cameraX, 30 * 16 - Engine.W));
                this.cameraY = Math.max(0, Math.min(this.cameraY, 20 * 16 - Engine.H));

                if (!Dialogue.active && this.thuNPC.distTo(Player.x, Player.y) < 24) {
                    if (Engine.justPressed('Space') || Engine.justPressed('KeyZ')) {
                        this.advanceSubPhase();
                    }
                }
                break;
        }
    },

    startFirefliesScene() {
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

        // Update fireflies
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

        // Click to catch
        if (Engine.mouseClicked) {
            for (const f of this.fireflies) {
                if (f.caught) continue;
                if (Math.hypot(f.x - Engine.mouseX, f.y - Engine.mouseY) < 10) {
                    f.caught = true;
                    this.caughtFireflies++;
                    Audio.playSFX('firefly_catch');
                    break;
                }
            }
        }

        // Check if caught enough
        if (this.caughtFireflies >= 5) {
            Engine.keepMemory('mem_fireflies');
            this.phase = 'scene_fireflies';
            Dialogue.startRaw(Engine.getDialogue('ch2_fireflies_end'), () => {
                this.startBoatsScene();
            });
        }

        // Also allow space to auto-catch (accessibility)
        if (Engine.justPressed('Space')) {
            for (const f of this.fireflies) {
                if (!f.caught) {
                    f.caught = true;
                    this.caughtFireflies++;
                    Audio.playSFX('firefly_catch');
                    break;
                }
            }
        }
    },

    startBoatsScene() {
        this.phase = 'scene_boats';
        Dialogue.startRaw(Engine.getDialogue('ch2_boats'), () => {
            Dialogue.showChoice('ch2_boats_choice', (choice) => {
                if (choice.memory) Engine.keepMemory(choice.memory);
                Dialogue.startRaw(Engine.getDialogue(choice.next), () => {
                    this.startJealousyScene();
                });
            });
        });
    },

    startJealousyScene() {
        this.phase = 'scene_jealousy';
        Dialogue.startRaw(Engine.getDialogue('ch2_jealousy'), () => {
            Dialogue.startRaw(Engine.getDialogue('ch2_jealousy_after'), () => {
                this.startSongScene();
            });
        });
    },

    startSongScene() {
        this.phase = 'scene_song';
        Dialogue.startRaw(Engine.getDialogue('ch2_song_intro'), () => {
            Dialogue.showChoice('ch2_song_choice', (choice) => {
                if (choice.memory) Engine.keepMemory(choice.memory);
                Dialogue.startRaw(Engine.getDialogue(choice.next), () => {
                    this.startWishScene();
                });
            });
        });
    },

    startWishScene() {
        this.phase = 'scene_wish';
        Dialogue.startRaw(Engine.getDialogue('ch2_wish'), () => {
            this.startGhostFestival();
        });
    },

    startGhostFestival() {
        this.phase = 'scene_ghost';
        Audio.stopMusic();
        Dialogue.startRaw(Engine.getDialogue('ch2_ghost_festival'), () => {
            // 2-second silence pause
            setTimeout(() => {
                Audio.playMusic('village_day');
                Dialogue.startRaw(Engine.getDialogue('ch2_ghost_festival_after'), () => {
                    this.startSilenceScene();
                });
            }, 2000);
        });
    },

    startSilenceScene() {
        this.phase = 'scene_silence';
        Dialogue.startRaw(Engine.getDialogue('ch2_silence'), () => {
            Engine.setFlag('ch2_complete');
            Engine.fadeToScene(Chapter3Scene);
        });
    },

    advanceSubPhase() {
        // Used for explore-between phases (not used in this flow)
    },

    render(ctx) {
        if (this.phase === 'title_card') {
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, Engine.W, Engine.H);
            ctx.globalAlpha = Math.min(1, this.timer * 0.8);
            Engine.drawTextCentered(ctx, Engine.t('chapter_2_title'), Engine.H / 2, '#e8d8c0', 10);
            ctx.globalAlpha = 1;
            return;
        }

        if (this.phase === 'minigame_fireflies') {
            this.renderFireflyGame(ctx);
            return;
        }

        // Render scene background based on current scene
        this.renderSceneBG(ctx);

        // Render NPCs
        this.npcs.forEach(n => n.render(ctx, this.cameraX, this.cameraY));

        if (this.phase === 'explore_between') {
            TileMap.renderMap(ctx, this.map, this.cameraX, this.cameraY, 2);
            this.npcs.forEach(n => n.render(ctx, this.cameraX, this.cameraY));
            Player.render(ctx, this.cameraX, this.cameraY);
        }

        // Warm overlay (happiest chapter)
        ctx.fillStyle = 'rgba(200, 160, 50, 0.06)';
        ctx.fillRect(0, 0, Engine.W, Engine.H);

        Dialogue.render(ctx);
    },

    renderSceneBG(ctx) {
        // Different backgrounds for different scenes
        if (this.phase === 'scene_ghost') {
            // Dark night for ghost festival
            const grad = ctx.createLinearGradient(0, 0, 0, Engine.H);
            grad.addColorStop(0, '#08080f');
            grad.addColorStop(1, '#0a0a18');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, Engine.W, Engine.H);

            // Dim incense glow
            ctx.fillStyle = 'rgba(200, 100, 30, 0.05)';
            ctx.fillRect(Engine.W / 2 - 20, Engine.H / 2 - 10, 40, 20);
            return;
        }

        // Default: warm village scene
        const grad = ctx.createLinearGradient(0, 0, 0, Engine.H);
        if (this.phase.includes('silence')) {
            grad.addColorStop(0, '#2a2840');
            grad.addColorStop(1, '#1a2030');
        } else {
            grad.addColorStop(0, '#4a6a8a');
            grad.addColorStop(1, '#3a5a3a');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, Engine.W, Engine.H);

        // Ground
        ctx.fillStyle = '#3a5a2a';
        ctx.fillRect(0, Engine.H * 0.6, Engine.W, Engine.H * 0.4);

        // Pond/river
        ctx.fillStyle = '#3a6a8a';
        const waterY = Engine.H * 0.7;
        ctx.fillRect(20, waterY, Engine.W - 40, 30);
        // Ripples
        for (let x = 25; x < Engine.W - 40; x += 12) {
            const ry = Math.sin((Engine.frameCount + x) * 0.06);
            ctx.fillStyle = 'rgba(80, 130, 170, 0.4)';
            ctx.fillRect(x, waterY + 8 + ry, 8, 1);
        }

        // Trees in background
        ctx.fillStyle = '#2a4a2a';
        ctx.fillRect(10, Engine.H * 0.45, 20, 30);
        ctx.fillRect(60, Engine.H * 0.42, 25, 35);
        ctx.fillRect(240, Engine.H * 0.44, 22, 32);
        ctx.fillRect(280, Engine.H * 0.46, 18, 28);

        // Canopy
        ctx.fillStyle = '#3a6a2a';
        ctx.fillRect(5, Engine.H * 0.38, 30, 12);
        ctx.fillRect(55, Engine.H * 0.35, 35, 12);
    },

    renderFireflyGame(ctx) {
        // Dark night background
        const grad = ctx.createLinearGradient(0, 0, 0, Engine.H);
        grad.addColorStop(0, '#050510');
        grad.addColorStop(0.5, '#0a0a1a');
        grad.addColorStop(1, '#0a1a0a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, Engine.W, Engine.H);

        // Stars
        for (let i = 0; i < 20; i++) {
            const sx = (i * 37 + 13) % Engine.W;
            const sy = (i * 23 + 7) % (Engine.H * 0.4);
            const br = 0.3 + 0.7 * Math.abs(Math.sin(Engine.frameCount * 0.02 + i));
            ctx.fillStyle = `rgba(255, 255, 220, ${br})`;
            ctx.fillRect(sx, sy, 1, 1);
        }

        // Ground silhouette
        ctx.fillStyle = '#0a1a0a';
        ctx.fillRect(0, Engine.H * 0.75, Engine.W, Engine.H * 0.25);

        // Tree silhouettes
        ctx.fillStyle = '#0a150a';
        ctx.fillRect(20, Engine.H * 0.5, 15, Engine.H * 0.3);
        ctx.fillRect(280, Engine.H * 0.48, 18, Engine.H * 0.3);

        // Fireflies
        for (const f of this.fireflies) {
            if (f.caught) continue;
            const glow = f.brightness;
            ctx.fillStyle = `rgba(200, 230, 100, ${glow})`;
            ctx.fillRect(Math.floor(f.x) - 1, Math.floor(f.y) - 1, 3, 3);
            // Glow
            ctx.fillStyle = `rgba(200, 230, 100, ${glow * 0.2})`;
            ctx.fillRect(Math.floor(f.x) - 3, Math.floor(f.y) - 3, 7, 7);
        }

        // Jar count
        ctx.fillStyle = '#e8e0c0';
        ctx.font = '8px monospace';
        ctx.fillText(`🫙 ${this.caughtFireflies} / 5`, 10, 16);

        // Instructions
        ctx.fillStyle = '#808090';
        ctx.font = '6px monospace';
        const hint = Engine.locale === 'vi' ? 'Click vào đom đóm để bắt (hoặc nhấn SPACE)' : 'Click fireflies to catch (or press SPACE)';
        Engine.drawTextCentered(ctx, hint, Engine.H - 10, '#808090', 6);
    },
};
