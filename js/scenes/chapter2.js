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

            case 'minigame_boat':
                this.updateBoatGame(dt);
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
            if (typeof Notebook !== 'undefined') Notebook.addClue('firefly_souls');
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
                if (choice.next === 'ch2_boats_teach') {
                    // Interactive fold: the player actually folds the boat with Thu
                    this.startBoatFold();
                } else {
                    Dialogue.startRaw(Engine.getDialogue(choice.next), () => {
                        this.startJealousyScene();
                    });
                }
            });
        });
    },

    // ---- Paper-boat folding mini-game ------------------------------------
    startBoatFold() {
        this.phase = 'minigame_boat';
        this.boatStep = 0;
        this.boatShake = 0;
        this.boatStageT = 1;     // ease-in of the current stage shape
        this.boatSteps = [
            { key: 'ArrowDown',  vi: 'Gập đôi tờ giấy xuống', en: 'Fold the sheet in half', arrow: '↓' },
            { key: 'ArrowRight', vi: 'Miết mép cho thật thẳng', en: 'Crease the edge flat',  arrow: '→' },
            { key: 'ArrowUp',    vi: 'Bẻ hai góc lên thành mũ', en: 'Bend the corners up',   arrow: '↑' },
            { key: 'ArrowLeft',  vi: 'Mở bụng thuyền ra',      en: 'Open out the hull',      arrow: '←' },
            { key: 'Space',      vi: 'Vuốt nhẹ cho thuyền nở',  en: 'Smooth it into shape',   arrow: '○' },
        ];
        if (typeof Audio !== 'undefined' && Audio.stopMusic) { /* keep music */ }
    },

    updateBoatGame(dt) {
        this.timer += dt;
        if (this.boatShake > 0) this.boatShake = Math.max(0, this.boatShake - dt);
        if (this.boatStageT < 1) this.boatStageT = Math.min(1, this.boatStageT + dt * 4);

        const step = this.boatSteps[this.boatStep];
        if (!step) return;
        // any of the matching inputs advances; wrong arrow = gentle shake (no fail)
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
                Dialogue.startRaw(Engine.getDialogue('ch2_boats_teach'), () => {
                    this.startJealousyScene();
                });
            }
        } else if (pressedAnyArrow) {
            this.boatShake = 0.25;
        }
    },

    startJealousyScene() {
        this.phase = 'scene_jealousy';
        Dialogue.startRaw(Engine.getDialogue('ch2_jealousy'), () => {
            if (typeof Notebook !== 'undefined') { Notebook.meetPerson('bap'); Notebook.addClue('bap_cant_see'); }
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
        if (typeof Notebook !== 'undefined') Notebook.addClue('thu_wish');
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
                if (typeof Notebook !== 'undefined') Notebook.addClue('thu_vanish_ram');
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
            // Minh's Nhãn Âm awakens after Thu's reveal → first other spirit (the
            // ferryman case) before the investigation chapter. Always shippable:
            // the ferryman scene fades on to Chapter 3 when finished.
            if (typeof NightVision !== 'undefined') NightVision.unlock();
            Engine.fadeToScene(typeof FerrymanCaseScene !== 'undefined' ? FerrymanCaseScene : Chapter3Scene);
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

        if (this.phase === 'minigame_boat') {
            this.renderBoatGame(ctx);
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

    drawPaintedBG(ctx, key, overlay) {
        const art = (typeof Assets !== 'undefined') ? Assets.get(key) : null;
        if (art) {
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(art, 0, 0, Engine.W, Engine.H);
            ctx.imageSmoothingEnabled = false;
            if (overlay) { ctx.fillStyle = overlay; ctx.fillRect(0, 0, Engine.W, Engine.H); }
            return true;
        }
        return false;
    },

    renderSceneBG(ctx) {
        if (this.phase === 'scene_ghost') {
            if (this.drawPaintedBG(ctx, 'bg_festival', 'rgba(10,8,24,0.45)')) return;
            const g0 = ctx.createLinearGradient(0, 0, 0, Engine.H);
            g0.addColorStop(0, '#08080f'); g0.addColorStop(1, '#0a0a18');
            ctx.fillStyle = g0; ctx.fillRect(0, 0, Engine.W, Engine.H);
            return;
        }

        const cold = this.phase.includes('silence');
        if (this.drawPaintedBG(ctx, 'bg_sky_dusk', cold ? 'rgba(40,50,90,0.35)' : null)) return;

        // Fallback gradient (if art not loaded)
        const grad = ctx.createLinearGradient(0, 0, 0, Engine.H);
        if (cold) { grad.addColorStop(0, '#2a2840'); grad.addColorStop(1, '#1a2030'); }
        else { grad.addColorStop(0, '#4a6a8a'); grad.addColorStop(1, '#3a5a3a'); }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, Engine.W, Engine.H);
        ctx.fillStyle = '#3a5a2a';
        ctx.fillRect(0, Engine.H * 0.6, Engine.W, Engine.H * 0.4);
    },

    renderBoatGame(ctx) {
        const W = Engine.W, H = Engine.H;
        // dusk riverside background
        if (!this.drawPaintedBG(ctx, 'bg_sky_dusk', 'rgba(20,16,30,0.25)')) {
            const g = ctx.createLinearGradient(0, 0, 0, H);
            g.addColorStop(0, '#42506e'); g.addColorStop(0.6, '#5a4a52'); g.addColorStop(1, '#2a3a3a');
            ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        }
        // water strip
        ctx.fillStyle = 'rgba(30,50,70,0.55)';
        ctx.fillRect(0, H * 0.72, W, H * 0.28);

        // header
        Engine.drawTextCentered(ctx, Engine.locale === 'vi' ? 'GẤP THUYỀN GIẤY' : 'FOLD THE PAPER BOAT', 20, '#ffe6a8', 10, 800);

        // paper / boat shape, with a little shake on a wrong press
        const total = this.boatSteps.length;
        const stage = this.boatStep;
        let cx = W / 2, cy = H * 0.5;
        if (this.boatShake > 0) cx += Math.sin(Engine.frameCount * 0.9) * this.boatShake * 10;
        this.drawPaperStage(ctx, cx, cy, stage, total);

        // progress dots
        const dotY = H * 0.68, gap = 9, startX = W / 2 - (total - 1) * gap / 2;
        for (let i = 0; i < total; i++) {
            ctx.fillStyle = i < this.boatStep ? '#ffd24a' : 'rgba(255,255,255,0.25)';
            ctx.beginPath(); ctx.arc(startX + i * gap, dotY, 2, 0, Math.PI * 2); ctx.fill();
        }

        // current instruction + big arrow key
        const step = this.boatSteps[this.boatStep];
        if (step) {
            const label = Engine.locale === 'vi' ? step.vi : step.en;
            // arrow chip
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

    // Draw the paper morphing flat sheet -> boat across stages 0..total
    drawPaperStage(ctx, cx, cy, stage, total) {
        ctx.save();
        ctx.translate(cx, cy);
        const paper = '#f4efe2', shade = '#d8d0bd', edge = 'rgba(120,110,90,0.6)';
        ctx.strokeStyle = edge; ctx.lineWidth = 0.7; ctx.lineJoin = 'round';
        const S = 1.0;
        if (stage <= 0) {
            // flat sheet
            ctx.fillStyle = paper; ctx.fillRect(-26, -18, 52, 36);
            ctx.strokeRect(-26, -18, 52, 36);
            ctx.strokeStyle = shade; ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, 18); ctx.stroke();
        } else if (stage === 1) {
            // folded in half
            ctx.fillStyle = paper; ctx.fillRect(-26, -9, 52, 18);
            ctx.strokeRect(-26, -9, 52, 18);
            ctx.fillStyle = shade; ctx.fillRect(-26, -9, 52, 3);
        } else if (stage === 2) {
            // triangle (hat base)
            ctx.fillStyle = paper;
            ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(26, 12); ctx.lineTo(-26, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = shade; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, 12); ctx.stroke();
        } else if (stage === 3) {
            // hat (triangle + brim)
            ctx.fillStyle = paper;
            ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(24, 6); ctx.lineTo(-24, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.fillStyle = shade;
            ctx.beginPath(); ctx.moveTo(-26, 6); ctx.lineTo(26, 6); ctx.lineTo(20, 12); ctx.lineTo(-20, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
        } else {
            // finished boat (hull + sail), gently bobbing
            const bob = Math.sin(Engine.frameCount * 0.06) * 1.2;
            ctx.translate(0, bob);
            ctx.fillStyle = paper;
            // hull
            ctx.beginPath();
            ctx.moveTo(-28, 2); ctx.lineTo(28, 2); ctx.lineTo(18, 16); ctx.lineTo(-18, 16); ctx.closePath();
            ctx.fill(); ctx.stroke();
            // mid fold
            ctx.strokeStyle = shade; ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, 16); ctx.stroke();
            // sail / prow
            ctx.fillStyle = paper; ctx.strokeStyle = edge;
            ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(24, 1); ctx.lineTo(0, 1); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(-24, 1); ctx.lineTo(0, 1); ctx.closePath(); ctx.fill(); ctx.stroke();
            // reflection on water
            ctx.globalAlpha = 0.18; ctx.fillStyle = '#cfe2ee';
            ctx.beginPath(); ctx.moveTo(-18, 18); ctx.lineTo(18, 18); ctx.lineTo(12, 26); ctx.lineTo(-12, 26); ctx.closePath(); ctx.fill();
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    },

    renderFireflyGame(ctx) {
        const painted = this.drawPaintedBG(ctx, 'bg_night_river', 'rgba(4,6,18,0.25)');
        if (!painted) {
            const grad = ctx.createLinearGradient(0, 0, 0, Engine.H);
            grad.addColorStop(0, '#050510'); grad.addColorStop(0.5, '#0a0a1a'); grad.addColorStop(1, '#0a1a0a');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, Engine.W, Engine.H);
            // Stars (fallback only)
            for (let i = 0; i < 20; i++) {
                const sx = (i * 37 + 13) % Engine.W;
                const sy = (i * 23 + 7) % (Engine.H * 0.4);
                const br = 0.3 + 0.7 * Math.abs(Math.sin(Engine.frameCount * 0.02 + i));
                ctx.fillStyle = `rgba(255, 255, 220, ${br})`;
                ctx.fillRect(sx, sy, 1, 1);
            }
            ctx.fillStyle = '#0a1a0a';
            ctx.fillRect(0, Engine.H * 0.75, Engine.W, Engine.H * 0.25);
        }

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
