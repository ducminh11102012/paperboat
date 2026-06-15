// Paper Boats — VỤ LINH HỒN #1: Ông Lái Đò (Upgrade v4, Tầng 1)
// A self-contained spirit case. Minh's Nhãn Âm has just awakened; at the old
// ferry dock he glimpses a ferryman who rows the river each night carrying no
// one. Loop: discover (Nhãn Âm) → investigate (3 clues) → understand (talk) →
// mercy action (rowing mini-game) → farewell → resolve (Codex + mystery layer).
// Echoes Thu's theme: waiting for someone who never comes back.
const FerrymanCaseScene = {
    phase: 'title_card',
    timer: 0,
    map: null,
    cameraX: 0,
    cameraY: 0,
    npcs: [],
    ferryman: null,
    witness: null,
    hotspots: [],
    cluesFound: 0,
    metWitness: false,
    sawGhost: false,        // has seen the ferryman under Nhãn Âm at least once
    understood: false,      // talked to ghost & learned his binding
    // rowing mini-game state
    rowProgress: 0,
    rowLast: null,
    rowWobble: 0,
    rowSplash: 0,

    init() {
        this.phase = 'title_card';
        this.timer = 0;
        this.cluesFound = 0;
        this.metWitness = false;
        this.sawGhost = false;
        this.understood = false;
        this.rowProgress = 0; this.rowLast = null; this.rowWobble = 0; this.rowSplash = 0;
        this.createMap();
        this.createNPCs();
        if (typeof NightVision !== 'undefined') { NightVision.unlock(); NightVision.reset(); }
        Player.reset(12 * 16 + 8, 2 * 16 + 8);
        Audio.playMusic('doubt');
    },

    createMap() {
        const T = TileMap.TILES;
        const W = 26, H = 18;
        this.mapW = W; this.mapH = H;
        this.map = [];
        for (let r = 0; r < H; r++) {
            this.map[r] = [];
            for (let c = 0; c < W; c++) {
                let tile = T.GRASS;
                // dirt path down the middle to the dock
                if (c >= 11 && c <= 13 && r >= 1 && r <= 12) tile = T.DIRT;
                // river fills the bottom
                if (r >= 13) tile = T.WATER;
                // wooden dock (bridge) reaching into the river
                if (c === 12 && r >= 12 && r <= 16) tile = T.BRIDGE;
                // banyan grove top-left + shrine
                if (r >= 1 && r <= 3 && c >= 2 && c <= 4) tile = T.BANYAN;
                if (r === 4 && c === 3) tile = T.SHRINE;
                // scattered trees
                if (r === 6 && c === 18) tile = T.TREE;
                if (r === 9 && c === 5) tile = T.TREE;
                if (r === 3 && c === 20) tile = T.TREE;
                if (r === 10 && c === 21) tile = T.TREE;
                // a notch post (stone) for the ferry tally clue
                if (r === 11 && c === 15) tile = T.STONE;
                // borders (top + sides above the water)
                if (r === 0) tile = T.BAMBOO;
                if ((c === 0 || c === 25) && r <= 12) tile = T.BAMBOO;
                this.map[r][c] = tile;
            }
        }
    },

    createNPCs() {
        // Ferryman ghost — stands at the end of the dock, over the water
        this.ferryman = new NPC('Ông lái đò', 'lai_do', 12 * 16 + 8, 16 * 16, 'down', true);
        this.ferryman.alpha = 0; // hidden until seen under Nhãn Âm
        // Living witness — an old woman who remembers him, by the path
        this.witness = new NPC('Bà cụ', 'ba_noi', 7 * 16, 6 * 16, 'right');
        this.npcs = [this.witness, this.ferryman];

        this.hotspots = [
            new Hotspot(10 * 16, 12 * 16, 16, 16, 'oar', ''),       // old oar by the dock
            new Hotspot(15 * 16, 12 * 16, 16, 16, 'tally', ''),     // notch tally post
            new Hotspot(6 * 16, 12 * 16, 16, 16, 'offering', ''),   // wilted offering at the bank
        ];
    },

    update(dt) {
        this.timer += dt;
        if (typeof NightVision !== 'undefined') NightVision.update(dt);

        switch (this.phase) {
            case 'title_card':
                if (this.timer > 2.6 || Engine.anyInteract()) {
                    this.phase = 'intro';
                    Player.lock();
                    const vi = Engine.locale === 'vi';
                    Dialogue.startRaw([
                        { speaker: 'Minh', text: vi ? 'Từ đêm gặp Thu… mắt tao khác rồi. Tao thấy được những thứ làng cố ngoảnh đi.' : "Since the night I met Thu… my eyes are different. I see what the village turns away from.", portrait: 'minh' },
                        { speaker: '', text: vi ? '(Giữ V để mở Nhãn Âm — nhìn thấy người khuất.)' : '(Hold V for Spirit Sight — to see the dead.)', portrait: '' },
                        { speaker: 'Minh', text: vi ? 'Bến đò cũ. Có ai đó… cứ chèo qua chèo lại, mà thuyền thì trống không.' : "The old ferry dock. Someone… rows back and forth, but the boat is empty.", portrait: 'minh' },
                    ], () => {
                        Player.unlock();
                        this.phase = 'explore';
                        Engine.setObjective('Giữ V (Nhãn Âm) tìm hồn · tìm 3 manh mối', 'Hold V (Spirit Sight) · find 3 clues');
                        if (Hud && Hud.showAreaToast) Hud.showAreaToast('Bến đò cũ', 'The old ferry dock');
                    });
                }
                break;

            case 'explore': {
                Player.update(dt, (x, y) => TileMap.checkCollision(this.map, x, y));
                Dialogue.update(dt);
                this.npcs.forEach(n => n.update(dt));
                // ferryman visibility tracks Nhãn Âm
                const f = (typeof NightVision !== 'undefined') ? NightVision.factor : 0;
                this.ferryman.alpha = 0.08 + 0.85 * f;
                if (f > 0.6 && !this.sawGhost) {
                    this.sawGhost = true;
                    if (Codex) Codex.add('ma_da');
                    if (Hud && Hud.showAreaToast) Hud.showAreaToast('Có một hồn nơi bến nước…', 'A soul haunts the dock…');
                }
                this.cameraX = Math.max(0, Math.min(Player.x - Engine.W / 2, this.mapW * 16 - Engine.W));
                this.cameraY = Math.max(0, Math.min(Player.y - Engine.H / 2, this.mapH * 16 - Engine.H));
                if (!Dialogue.active) this.checkInteractions();
                // guidance
                if (this.cluesFound >= 3 && this.sawGhost && !this.understood) {
                    Engine.setObjective('Lại gần ông lái đò (Nhãn Âm) để hiểu', 'Approach the ferryman under Spirit Sight', { x: 12 * 16, y: 16 * 16 });
                }
                break;
            }

            case 'dialogue':
                Dialogue.update(dt);
                this.npcs.forEach(n => n.update(dt));
                break;

            case 'mercy_row':
                this.updateRowing(dt);
                Dialogue.update(dt);
                break;

            case 'farewell':
                Dialogue.update(dt);
                this.npcs.forEach(n => n.update(dt));
                // fade the ferryman out as he is laid to rest
                this.ferryman.alpha = Math.max(0, this.ferryman.alpha - dt * 0.5);
                break;
        }
    },

    checkInteractions() {
        // clue hotspots
        const clueData = {
            oar:      { clue: 'lai_do_oar',     vi: 'Mái chèo cũ dựng bên bến — nhẵn thín vì bao đêm chèo không nghỉ.', en: 'An old oar by the dock — worn smooth from countless tireless nights.', speaker: 'Minh', line_vi: 'Mái chèo còn ướt… như vừa có người chèo xong.', line_en: "The oar is still wet… as if someone just finished rowing." },
            tally:    { clue: 'lai_do_tally',   vi: 'Cọc khắc vạch đếm khách qua đò. Vạch cuối cùng dừng ở mùa lũ 1994.', en: 'A post notched once per passenger ferried. The last notch stops at the flood of 1994.', speaker: 'Minh', line_vi: 'Đếm khách qua sông… rồi dừng hẳn. Mùa lũ chín tư.', line_en: 'A count of passengers… stopping dead. The flood of \u201994.' },
            offering: { clue: 'lai_do_offering', vi: 'Mâm cúng héo bên bờ — không ai thay đồ cúng cho ông đã lâu lắm.', en: 'A wilted offering tray at the bank — no one has tended it in a very long time.', speaker: 'Minh', line_vi: 'Mâm cúng khô cong. Người ta quên ông rồi.', line_en: "The offerings are dried out. People have forgotten him." },
        };
        for (const hs of this.hotspots) {
            if (hs.triggered) continue;
            if (hs.containsPoint(Player.x, Player.y) && (Engine.justPressed('Space') || Engine.justPressed('KeyZ'))) {
                hs.triggered = true;
                this.cluesFound++;
                const d = clueData[hs.id];
                if (Notebook) Notebook.addClue(d.clue);
                this.phase = 'dialogue'; Player.lock();
                Dialogue.startRaw([{ speaker: d.speaker, text: Engine.locale === 'vi' ? d.line_vi : d.line_en, portrait: 'minh' }],
                    () => { Player.unlock(); this.phase = 'explore'; });
                return;
            }
        }

        // living witness
        if (!this.metWitness && this.witness.distTo(Player.x, Player.y) < 24 && (Engine.justPressed('Space') || Engine.justPressed('KeyZ'))) {
            this.metWitness = true;
            if (Codex) Codex.add('co_hon');
            this.phase = 'dialogue'; Player.lock();
            const vi = Engine.locale === 'vi';
            Dialogue.startRaw([
                { speaker: 'Bà cụ', text: vi ? 'Cháu cũng thấy ông ấy à? Lạ thật. Cả làng quên ông lái đò lâu rồi.' : "You see him too, child? Strange. The whole village forgot the ferryman long ago.", portrait: 'ba_noi_normal' },
                { speaker: 'Bà cụ', text: vi ? 'Đêm lũ chín tư, ông chèo đi chèo lại cứu người. Chuyến cuối… ông bảo còn một người chưa qua kịp.' : "The flood night of \u201994, he rowed back and forth saving people. The last trip… he said one soul never made it across.", portrait: 'ba_noi_normal' },
                { speaker: 'Bà cụ', text: vi ? 'Rồi cả ông lẫn người ấy đều không về. Giờ đêm đêm ông vẫn chèo — chờ chở nốt người cuối.' : "Then neither he nor that soul ever came back. Now he still rows each night — waiting to ferry that last one across.", portrait: 'ba_noi_normal' },
            ], () => { Player.unlock(); this.phase = 'explore'; });
            return;
        }

        // the ferryman himself
        if (this.ferryman.distTo(Player.x, Player.y) < 26 && (Engine.justPressed('Space') || Engine.justPressed('KeyZ'))) {
            const vi = Engine.locale === 'vi';
            const ready = this.cluesFound >= 3 && this.sawGhost;
            this.phase = 'dialogue'; Player.lock();
            if (!ready) {
                Dialogue.startRaw([{ speaker: '???', text: vi ? '…Chưa tới giờ. Sông còn tối lắm. Cháu cứ đi xem quanh bến đã.' : "…Not yet. The river is still dark. Go, look around the dock first.", portrait: this.sawGhost ? 'lai_do' : '' }],
                    () => { Player.unlock(); this.phase = 'explore'; });
                return;
            }
            this.understood = true;
            if (Notebook) Notebook.addClue('lai_do_echo');
            Dialogue.startRaw([
                { speaker: 'Ông lái đò', text: vi ? 'Cháu thấy ta. Lâu lắm rồi mới có người chịu nhìn.' : "You see me. It's been so long since anyone would look.", portrait: 'lai_do' },
                { speaker: 'Ông lái đò', text: vi ? 'Đêm lũ ấy ta chèo mãi. Còn một đứa nhỏ kẹt bên kia bờ… ta quay lại thì nước đã cuốn mất.' : "That flood night I rowed and rowed. One child was stranded on the far bank… by the time I turned back, the water had taken her.", portrait: 'lai_do' },
                { speaker: 'Ông lái đò', text: vi ? 'Ta không dám đi. Sao đi được khi còn một người ta chưa chở qua?' : "I cannot leave. How can I, with one soul I never carried across?", portrait: 'lai_do' },
                { speaker: 'Minh', text: vi ? '…Để cháu chèo cùng ông. Mình chở nốt chuyến ấy.' : "…Let me row with you. We'll finish that last crossing.", portrait: 'minh' },
            ], () => { this.startRowing(); });
            return;
        }
    },

    // ---- Mercy action: row the last soul across ---------------------------
    startRowing() {
        this.phase = 'mercy_row';
        this.rowProgress = 0; this.rowLast = null; this.rowWobble = 0; this.rowSplash = 0;
        Player.lock();
    },

    updateRowing(dt) {
        if (Dialogue.active) { return; }
        if (this.rowWobble > 0) this.rowWobble -= dt;
        if (this.rowSplash > 0) this.rowSplash -= dt;
        let side = null;
        if (Engine.justPressed('ArrowLeft') || Engine.justPressed('KeyA')) side = 'L';
        if (Engine.justPressed('ArrowRight') || Engine.justPressed('KeyD')) side = 'R';
        if (side) {
            if (this.rowLast === null || side !== this.rowLast) {
                this.rowProgress = Math.min(1, this.rowProgress + 0.052);
                this.rowLast = side;
                this.rowSplash = 0.28;
                if (typeof Audio !== 'undefined') Audio.playSFX('water');
                if (this.rowProgress >= 1) { this.finishRowing(); }
            } else {
                this.rowWobble = 0.25; // same side twice — boat wobbles, no progress
            }
        }
    },

    finishRowing() {
        const vi = Engine.locale === 'vi';
        this.phase = 'farewell';
        Audio.playMusic('farewell');
        Dialogue.startRaw([
            { speaker: 'Ông lái đò', text: vi ? 'Tới bờ rồi… Con bé qua được rồi. Cảm ơn cháu.' : "We've reached the bank… She's across now. Thank you, child.", portrait: 'lai_do' },
            { speaker: 'Ông lái đò', text: vi ? 'Ai cũng cần một người chở mình qua khúc tối. Cháu nhớ lấy.' : "Everyone needs someone to row them through the dark stretch. Remember that.", portrait: 'lai_do' },
            { speaker: '', text: vi ? '(Ông lái đò tan vào sương sông, nhẹ như buông được một gánh nặng mang bao năm.)' : '(The ferryman dissolves into the river mist, light as a weight finally set down.)', portrait: '' },
            { speaker: 'Minh', text: vi ? 'Ông cũng chờ một người không về… giống bà chờ Thu.' : "He waited for someone who never came back… just like Grandma waits for Thu.", portrait: 'minh' },
        ], () => {
            if (SpiritCases) SpiritCases.resolve('lai_do');
            if (typeof Engine.keepMemory === 'function') Engine.keepMemory('mem_ferryman');
            Engine.setFlag('case_lai_do_done');
            Engine.clearObjective();
            Engine.fadeToScene(Chapter3Scene);
        });
    },

    // ===== Render =====
    render(ctx) {
        if (this.phase === 'title_card') {
            ctx.fillStyle = '#0a0a0f'; ctx.fillRect(0, 0, Engine.W, Engine.H);
            ctx.globalAlpha = Math.min(1, this.timer * 0.8);
            Engine.drawTextCentered(ctx, Engine.locale === 'vi' ? 'VỤ · ÔNG LÁI ĐÒ' : 'CASE · THE FERRYMAN', Engine.H / 2 - 6, '#9fc4ff', 10, 800);
            Engine.drawTextCentered(ctx, Engine.locale === 'vi' ? 'Bến đò cũ — đêm chưa ngủ' : 'The old ferry dock — a sleepless night', Engine.H / 2 + 8, '#7488a0', 7, 500);
            ctx.globalAlpha = 1;
            return;
        }
        if (this.phase === 'mercy_row') { this.renderRowing(ctx); Dialogue.render(ctx); return; }

        TileMap.renderMap(ctx, this.map, this.cameraX, this.cameraY, 3);

        // unfound clue hotspots glow a little (clearer under Nhãn Âm)
        const f = (typeof NightVision !== 'undefined') ? NightVision.factor : 0;
        this.hotspots.forEach(hs => { if (!hs.triggered && (f > 0.2 || this.phase === 'explore')) hs.render(ctx, this.cameraX, this.cameraY); });

        // entities sorted by y; ferryman drawn with current alpha
        const ents = [];
        if (this.witness.visible) ents.push(this.witness);
        if (this.ferryman.alpha > 0.02) ents.push(this.ferryman);
        ents.push({ y: Player.y, render: (c, cx, cy) => Player.render(c, cx, cy) });
        ents.sort((a, b) => a.y - b.y);
        ents.forEach(e => e.render(ctx, this.cameraX, this.cameraY));

        // dusk/night tint
        ctx.fillStyle = 'rgba(20, 30, 55, 0.18)'; ctx.fillRect(0, 0, Engine.W, Engine.H);
        // Nhãn Âm overlay
        if (typeof NightVision !== 'undefined') NightVision.renderOverlay(ctx);

        // interaction hints
        if (this.phase === 'explore' && !Dialogue.active) {
            let hint = false;
            for (const hs of this.hotspots) if (!hs.triggered && hs.containsPoint(Player.x, Player.y)) hint = true;
            if (!this.metWitness && this.witness.distTo(Player.x, Player.y) < 24) hint = true;
            if (this.ferryman.alpha > 0.3 && this.ferryman.distTo(Player.x, Player.y) < 26) hint = true;
            if (hint) Engine.drawTextCentered(ctx, Engine.locale === 'vi' ? 'Nhấn SPACE' : 'Press SPACE', 12, '#ffd700', 7, 700);
        }

        if (typeof NightVision !== 'undefined' && this.phase !== 'farewell') NightVision.renderHint(ctx);
        Dialogue.render(ctx);
    },

    renderRowing(ctx) {
        const W = Engine.W, H = Engine.H, vi = Engine.locale === 'vi';
        // dusk river
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#3a4a72'); g.addColorStop(0.5, '#2a3a5a'); g.addColorStop(1, '#16263f');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        // far bank (goal) + near bank
        ctx.fillStyle = '#243a30'; ctx.fillRect(0, 0, W, 22);
        ctx.fillStyle = '#1c2c24'; ctx.fillRect(0, H - 18, W, 18);
        // ripples
        for (let i = 0; i < 6; i++) {
            const ry = 40 + i * 18 + Math.sin(Engine.frameCount * 0.04 + i) * 2;
            ctx.strokeStyle = 'rgba(180,210,255,0.10)'; ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(W, ry); ctx.stroke();
        }
        Engine.drawTextCentered(ctx, vi ? 'CHỞ NỐT CHUYẾN CUỐI' : 'THE LAST CROSSING', 14, '#dce9ff', 9, 800);

        // boat travels bottom → top as progress grows
        const by = (H - 30) - this.rowProgress * (H - 60);
        const wob = (this.rowWobble > 0 ? Math.sin(Engine.frameCount * 0.8) * 2 : 0);
        const bx = W / 2 + wob;
        // reflection
        ctx.fillStyle = 'rgba(120,150,200,0.12)'; ctx.beginPath(); ctx.ellipse(bx, by + 10, 22, 4, 0, 0, Math.PI * 2); ctx.fill();
        // boat hull
        ctx.fillStyle = '#6a4a30'; ctx.beginPath();
        ctx.moveTo(bx - 22, by); ctx.quadraticCurveTo(bx, by + 9, bx + 22, by); ctx.lineTo(bx + 16, by - 3); ctx.lineTo(bx - 16, by - 3); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#3a2818'; ctx.lineWidth = 0.8; ctx.stroke();
        // the soul being ferried (faint child) + the ferryman
        ctx.globalAlpha = 0.7; ctx.fillStyle = '#bcd4ff'; ctx.beginPath(); ctx.arc(bx - 6, by - 8, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.85; ctx.fillStyle = '#8fa8c8'; ctx.beginPath(); ctx.arc(bx + 7, by - 9, 3.6, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        // oar splash
        if (this.rowSplash > 0) {
            const sideX = this.rowLast === 'L' ? bx - 24 : bx + 24;
            ctx.fillStyle = `rgba(200,225,255,${this.rowSplash * 2})`;
            ctx.beginPath(); ctx.arc(sideX, by + 2, 3, 0, Math.PI * 2); ctx.fill();
        }

        // progress bar
        const pbW = 180, pbX = (W - pbW) / 2, pbY = H - 26;
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; Engine.roundRect(ctx, pbX - 2, pbY - 2, pbW + 4, 8, 3); ctx.fill();
        ctx.fillStyle = '#9fc4ff'; Engine.roundRect(ctx, pbX, pbY, pbW * this.rowProgress, 4, 2); ctx.fill();
        Engine.drawTextCentered(ctx, vi ? '← → luân phiên để chèo qua bờ' : '← → alternate to row across', H - 11, '#cfe0ff', 7, 600);
    },
};
