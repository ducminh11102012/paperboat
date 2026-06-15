// Paper Boats — Sổ Tay (Notebook / investigation journal). Press N.
// A persistent journal the player fills in by playing: clues (manh mối) the
// player pieces together, and people (người trong làng) they meet. Mirrors the
// MapScreen overlay: freezes the world, intercepts input, crisp UI layer.
const Notebook = {
    active: false,
    t: 0,
    closing: false,
    tab: 0,             // 0 = clues, 1 = people
    hasNew: false,      // pulse the hint when a new entry was just added
    flashTimer: 0,      // "+ Ghi vào sổ tay" toast timer
    flashText: null,

    // Discovered entries (ids, in order found)
    clues: [],
    people: [],

    // ---- Definitions -------------------------------------------------------
    // key === true means this clue is a "main" lead that gates Hồi III → IV.
    CLUE_DEFS: {
        thu_long_time:  { vi: "Thu nói nó đã ở làng này “lâu hơn mày tưởng”.", en: "Thu said she's been here \u201clonger than you'd think.\u201d" },
        thu_no_eat:     { vi: "Thu chẳng bao giờ ăn — lúc nào cũng bảo “no rồi”.", en: "Thu never eats — always says she's \u201cfull.\u201d" },
        ba_noi_pause:   { vi: "Bà khựng lại khi nghe hai chữ “áo hoa”.", en: "Grandma froze at the words \u201cfloral shirt.\u201d" },
        firefly_souls:  { vi: "Người ta đồn đom đóm là hồn trẻ con chết sớm.", en: "Fireflies are said to be the souls of children who died young." },
        thu_cold_hands: { vi: "Tay Thu lạnh ngắt — lạnh hơn cả nước ao.", en: "Thu's hands are ice cold — colder than the pond water." },
        bap_cant_see:   { vi: "Thằng Bắp không hề nhìn thấy Thu. “Chỗ này làm gì có ai.”", en: "Bap can't see Thu at all. \u201cNo one ever sits here.\u201d" },
        thu_vanish_ram: { vi: "Rằm tháng Bảy Thu biến mất, hôm sau bảo thấy “lạnh”.", en: "Thu vanished on Ghost Festival night, later said she felt \u201ccold.\u201d" },
        thu_wish:       { vi: "Dải vải dưới gốc đa: Thu ước được ở lại làng mãi mãi.", en: "Cloth under the banyan: Thu wished to stay in the village forever." },
        grave:          { vi: "Mộ sau bụi tre: NGUYỄN THỊ THU · 1984–1994. Mới mười tuổi.", en: "Grave behind the bamboo: NGUYEN THI THU · 1984\u20131994. Only ten.", main: true },
        death_record:   { vi: "Sổ cúng của bà: Thu mất tháng 8/1994, mùa nước lớn — cúng cùng các cháu khác.", en: "Grandma's memorial book: Thu died Aug 1994, the great flood — honored with the other children.", main: true },
        ongtu_pulled:   { vi: "Ông Tư là người kéo Thu lên ở khúc dưới, mùa lũ 1994.", en: "Old Tu is the one who pulled Thu from the water downstream, flood of 1994.", main: true },
    },
    PEOPLE_DEFS: {
        thu:    { name: "Thu",     portrait: "thu_normal",  vi: "Con bé áo hoa ở bờ ao. Cộc, hay nói dối vặt, thuộc cái ao như lòng bàn tay.", en: "The girl in the floral shirt by the pond. Blunt, fibs a lot, knows the pond by heart." },
        ba_noi: { name: "Bà Nội",  portrait: "ba_noi_normal", vi: "Bà nội của Minh. Hiền, hay giấu chuyện cũ trong làng.", en: "Minh's grandmother. Gentle, keeps the village's old stories buried." },
        bap:    { name: "Bắp",     portrait: "",            vi: "Thằng nhóc trong làng, hay đi câu. Lạ ở chỗ — nó không thấy Thu bao giờ.", en: "A village boy who likes fishing. Strangely — he never sees Thu." },
        ong_tu: { name: "Ông Tư",  portrait: "ong_tu",      vi: "Ông lão hay ngồi câu ở khúc dưới. Tay run khi nhắc tới Thu.", en: "An old man who fishes downstream. His hands shake when Thu is mentioned." },
    },

    // ---- Public API (called from scenes) -----------------------------------
    addClue(id) {
        if (!this.CLUE_DEFS[id] || this.clues.includes(id)) return;
        this.clues.push(id);
        this.hasNew = true;
        this.flash(Engine.locale === 'vi' ? '+ Ghi vào Sổ Tay' : '+ Added to Notebook');
    },
    meetPerson(id) {
        if (!this.PEOPLE_DEFS[id] || this.people.includes(id)) return;
        this.people.push(id);
        this.hasNew = true;
        this.flash(Engine.locale === 'vi' ? '+ Người mới trong sổ' : '+ New person in notebook');
    },
    mainCluesFound() {
        return this.clues.filter(id => this.CLUE_DEFS[id] && this.CLUE_DEFS[id].main).length;
    },
    flash(text) { this.flashText = text; this.flashTimer = 2.6; },

    // ---- Overlay plumbing (mirrors MapScreen) ------------------------------
    canOpen() {
        const s = Engine.currentScene;
        if (!s || s.showHud === false) return false;
        if (typeof Dialogue !== 'undefined' && Dialogue.active) return false;
        if (typeof Hud !== 'undefined' && Hud.tutorial) return false;
        if (typeof MapScreen !== 'undefined' && MapScreen.active) return false;
        return true;
    },

    open() {
        if (!this.canOpen()) return;
        this.active = true; this.closing = false; this.t = 0; this.hasNew = false;
        if (typeof Player !== 'undefined' && Player.lock) Player.lock();
    },
    close() {
        if (!this.active) return;
        this.closing = true;
        if (typeof Player !== 'undefined' && Player.unlock) Player.unlock();
    },

    handleInput() {
        if (this.active) {
            if (Engine.justPressed('KeyN') || Engine.justPressed('Escape')) this.close();
            if (Engine.justPressed('ArrowLeft') || Engine.justPressed('KeyA')) this.tab = 0;
            if (Engine.justPressed('ArrowRight') || Engine.justPressed('KeyD')) this.tab = 1;
            if (Engine.justPressed('Tab')) this.tab = this.tab === 0 ? 1 : 0;
            // tab clicks
            if (Engine.mouseClicked) {
                const W = Engine.W;
                if (Engine.mouseY > 22 && Engine.mouseY < 34) {
                    this.tab = Engine.mouseX < W / 2 ? 0 : 1;
                }
            }
            Engine.keysJustPressed = {};
            Engine.mouseClicked = false;
        } else if (Engine.justPressed('KeyN')) {
            this.open();
        }
    },

    update(dt) {
        const speed = 4.5;
        if (this.active && !this.closing) this.t = Math.min(1, this.t + dt * speed);
        else if (this.closing) { this.t = Math.max(0, this.t - dt * speed); if (this.t <= 0) { this.active = false; this.closing = false; } }
        if (this.flashTimer > 0) this.flashTimer -= dt;
    },

    ease(x) { return 1 - Math.pow(1 - x, 3); },

    render(ctx) {
        // toast (drawn even when notebook closed)
        if (!this.active && this.flashTimer > 0) this.renderFlash(ctx);
        if (!this.active && this.t <= 0) return;
        this.update(Engine.dt);
        const W = Engine.W, H = Engine.H;
        const e = this.ease(this.t);
        const vi = Engine.locale === 'vi';

        ctx.fillStyle = `rgba(7,6,11,${0.86 * e})`;
        ctx.fillRect(0, 0, W, H);

        ctx.save();
        ctx.globalAlpha = e;
        const s = 0.985 + 0.015 * e;
        ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);

        // ---- Leather notebook board ----
        const M = 4;
        const bX = M, bY = M, bW = W - M * 2, bH = H - M * 2;
        ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 7; ctx.shadowOffsetY = 2;
        ctx.fillStyle = '#231a26';            // dark plum leather
        Engine.roundRect(ctx, bX, bY, bW, bH, 5); ctx.fill();
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        ctx.strokeStyle = 'rgba(214,178,95,0.7)'; ctx.lineWidth = 0.8;
        Engine.roundRect(ctx, bX + 0.7, bY + 0.7, bW - 1.4, bH - 1.4, 5); ctx.stroke();
        // stitched binding line on the left
        ctx.strokeStyle = 'rgba(214,178,95,0.25)'; ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(bX + 7, bY + 5); ctx.lineTo(bX + 7, bY + bH - 5); ctx.stroke();
        ctx.setLineDash([]);

        // ---- Header ----
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f3e3b6'; ctx.font = Engine.font(9, 800);
        ctx.fillText(vi ? 'SỔ TAY' : 'NOTEBOOK', W / 2, bY + 13);
        ctx.fillStyle = '#a89a7e'; ctx.font = Engine.font(5, 600);
        ctx.fillText(vi ? 'PAPER BOATS · HÀ NỘI 1996' : 'PAPER BOATS · HANOI 1996', W / 2, bY + 19);

        // ---- Tabs ----
        const tabY = 23, tabH = 11;
        const tabs = [
            { vi: 'MANH MỐI', en: 'CLUES', n: this.clues.length },
            { vi: 'NGƯỜI TRONG LÀNG', en: 'PEOPLE', n: this.people.length },
        ];
        const halfW = (bW - 14) / 2;
        for (let i = 0; i < 2; i++) {
            const tx = bX + 7 + i * halfW, tw = halfW;
            const sel = this.tab === i;
            ctx.fillStyle = sel ? 'rgba(255,210,90,0.16)' : 'rgba(0,0,0,0.18)';
            Engine.roundRect(ctx, tx + 1, tabY, tw - 2, tabH, 3); ctx.fill();
            if (sel) { ctx.strokeStyle = 'rgba(255,210,90,0.6)'; ctx.lineWidth = 0.5; Engine.roundRect(ctx, tx + 1, tabY, tw - 2, tabH, 3); ctx.stroke(); }
            ctx.fillStyle = sel ? '#ffe9bd' : '#9b917e';
            ctx.font = Engine.font(6, 800); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText((vi ? tabs[i].vi : tabs[i].en) + '  (' + tabs[i].n + ')', tx + tw / 2, tabY + tabH / 2 + 0.3);
        }
        ctx.textBaseline = 'alphabetic';

        // ---- Content area ----
        const cX = bX + 11, cY = tabY + tabH + 5, cW = bW - 22;
        if (this.tab === 0) this.renderClues(ctx, cX, cY, cW, vi);
        else this.renderPeople(ctx, cX, cY, cW, vi);

        ctx.restore();

        // ---- close hint ----
        ctx.globalAlpha = e;
        this.pill(ctx, vi ? 'Đóng sổ' : 'Close', 'N / ESC');
        ctx.globalAlpha = 1;
    },

    renderClues(ctx, x, y, w, vi) {
        if (this.clues.length === 0) {
            ctx.fillStyle = '#8a8170'; ctx.font = Engine.font(7, 400); ctx.textAlign = 'left';
            Engine.drawText(ctx, vi ? 'Chưa có manh mối nào. Cứ chơi, quan sát, hỏi chuyện — sổ sẽ tự ghi lại.'
                                    : 'No clues yet. Keep playing, observe, ask around — this fills in itself.', x, y + 6, w, '#8a8170', 7, 10, 400);
            return;
        }
        let cy = y + 2;
        ctx.textAlign = 'left';
        for (let i = 0; i < this.clues.length; i++) {
            const def = this.CLUE_DEFS[this.clues[i]];
            if (!def) continue;
            const isMain = !!def.main;
            // bullet
            ctx.fillStyle = isMain ? '#ffd24a' : '#6f9bd0';
            ctx.beginPath(); ctx.arc(x + 2, cy + 2.5, isMain ? 2 : 1.5, 0, Math.PI * 2); ctx.fill();
            if (isMain) { ctx.strokeStyle = 'rgba(255,230,168,0.7)'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.arc(x + 2, cy + 2.5, 3, 0, Math.PI * 2); ctx.stroke(); }
            const txt = vi ? def.vi : def.en;
            const endY = Engine.drawText(ctx, txt, x + 9, cy + 4.5, w - 11, isMain ? '#f3e3b6' : '#d8cdb6', 6.6, 8.6, isMain ? 600 : 400);
            cy = endY + 2.5;
        }
    },

    renderPeople(ctx, x, y, w, vi) {
        if (this.people.length === 0) {
            ctx.fillStyle = '#8a8170'; ctx.font = Engine.font(7, 400); ctx.textAlign = 'left';
            Engine.drawText(ctx, vi ? 'Chưa gặp ai. Đi quanh làng và bắt chuyện.' : 'No one met yet. Wander the village and talk.', x, y + 6, w, '#8a8170', 7, 10, 400);
            return;
        }
        let cy = y;
        for (let i = 0; i < this.people.length; i++) {
            const def = this.PEOPLE_DEFS[this.people[i]];
            if (!def) continue;
            const ps = 22;
            // portrait frame
            ctx.fillStyle = '#0e0b08';
            Engine.roundRect(ctx, x, cy, ps, ps, 3); ctx.fill();
            const artPrt = (typeof Assets !== 'undefined' && def.portrait) ? Assets.getPortrait(def.portrait) : null;
            if (artPrt) {
                ctx.save(); Engine.roundRect(ctx, x + 1, cy + 1, ps - 2, ps - 2, 2.5); ctx.clip();
                ctx.imageSmoothingEnabled = true; ctx.drawImage(artPrt, x + 1, cy + 1, ps - 2, ps - 2); ctx.imageSmoothingEnabled = false; ctx.restore();
            } else {
                ctx.fillStyle = '#2a2330'; Engine.roundRect(ctx, x + 1, cy + 1, ps - 2, ps - 2, 2.5); ctx.fill();
                ctx.fillStyle = '#6b6072'; ctx.font = Engine.font(11, 800); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('?', x + ps / 2, cy + ps / 2 + 0.5); ctx.textBaseline = 'alphabetic';
            }
            ctx.strokeStyle = 'rgba(214,178,95,0.7)'; ctx.lineWidth = 0.5; Engine.roundRect(ctx, x, cy, ps, ps, 3); ctx.stroke();
            // name + desc
            ctx.textAlign = 'left';
            ctx.fillStyle = '#ffd24a'; ctx.font = Engine.font(7.5, 800);
            ctx.fillText(def.name, x + ps + 5, cy + 7);
            Engine.drawText(ctx, vi ? def.vi : def.en, x + ps + 5, cy + 15, w - ps - 7, '#d8cdb6', 6.4, 8, 400);
            cy += ps + 5;
        }
    },

    pill(ctx, label, keys) {
        const W = Engine.W, H = Engine.H;
        ctx.font = Engine.font(7, 700);
        const tw = ctx.measureText(label).width;
        const keyW = 22, bw = tw + keyW + 16;
        const bx = (W - bw) / 2, by = H - 13, bh = 11;
        ctx.fillStyle = 'rgba(18,14,9,0.92)'; Engine.roundRect(ctx, bx, by, bw, bh, 4.5); ctx.fill();
        ctx.strokeStyle = 'rgba(214,178,95,0.4)'; ctx.lineWidth = 0.5; Engine.roundRect(ctx, bx + 0.3, by + 0.3, bw - 0.6, bh - 0.6, 4.5); ctx.stroke();
        ctx.fillStyle = '#ffe6a8'; Engine.roundRect(ctx, bx + 4, by + 2.6, keyW - 2, bh - 5.2, 2); ctx.fill();
        ctx.fillStyle = '#3a2a08'; ctx.font = Engine.font(5.2, 800); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(keys, bx + 4 + (keyW - 2) / 2, by + bh / 2 + 0.3);
        ctx.fillStyle = '#f0e6d2'; ctx.font = Engine.font(7, 700); ctx.textAlign = 'left';
        ctx.fillText(label, bx + keyW + 8, by + bh / 2 + 0.3);
        ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    },

    renderFlash(ctx) {
        const a = Math.min(1, this.flashTimer / 0.4) * Math.min(1, (2.6 - this.flashTimer) / 0.3 + 1);
        const W = Engine.W;
        ctx.globalAlpha = Math.max(0, Math.min(1, a));
        ctx.font = Engine.font(7, 700);
        const tw = ctx.measureText(this.flashText).width;
        const bw = tw + 18, bx = (W - bw) / 2, by = 30, bh = 12;
        ctx.fillStyle = 'rgba(30,22,12,0.92)'; Engine.roundRect(ctx, bx, by, bw, bh, 4); ctx.fill();
        ctx.strokeStyle = 'rgba(255,210,90,0.6)'; ctx.lineWidth = 0.5; Engine.roundRect(ctx, bx, by, bw, bh, 4); ctx.stroke();
        ctx.fillStyle = '#ffe6a8'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(this.flashText, W / 2, by + bh / 2 + 0.3);
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.globalAlpha = 1;
    },

    // Persistent "N Sổ tay" hint on gameplay scenes (stacked under the Map hint)
    renderButtonHint(ctx) {
        if (this.active) return;
        if (!this.canOpen()) return;
        const W = Engine.W;
        const vi = Engine.locale === 'vi';
        const txt = vi ? 'Sổ tay' : 'Notes';
        ctx.font = Engine.font(7, 600);
        const tw = ctx.measureText(txt).width;
        const keyW = 9, bw = tw + keyW + 12;
        const bx = W - bw - 6, by = 21, bh = 13;   // sits just below the Map (M) hint
        ctx.fillStyle = 'rgba(18,16,26,0.6)'; Engine.roundRect(ctx, bx, by, bw, bh, 4); ctx.fill();
        ctx.fillStyle = this.hasNew ? '#ffd24a' : '#ffe6a8';
        Engine.roundRect(ctx, bx + 4, by + 3, keyW, bh - 6, 2); ctx.fill();
        ctx.fillStyle = '#3a2a08'; ctx.font = Engine.font(6.5, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('N', bx + 4 + keyW / 2, by + bh / 2 + 0.5);
        ctx.fillStyle = '#e8dcc0'; ctx.font = Engine.font(7, 600); ctx.textAlign = 'left';
        ctx.fillText(txt, bx + keyW + 7, by + bh / 2 + 0.5);
        // "new" dot
        if (this.hasNew) { ctx.fillStyle = '#ff5a5a'; ctx.beginPath(); ctx.arc(bx + bw - 2.5, by + 2.5, 1.6, 0, Math.PI * 2); ctx.fill(); }
        ctx.textBaseline = 'alphabetic';
    },
};
