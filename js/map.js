// Paper Boats — Village Map screen (press M)
// Full-screen hand-painted "Bản Đồ Làng" overview, rendered crisp on the UI layer.
const MapScreen = {
    active: false,
    t: 0,            // open/close animation progress 0..1
    closing: false,

    // Only allow the map on real gameplay scenes (those that show the HUD),
    // and never while a dialogue box or the tutorial card is up.
    canOpen() {
        const s = Engine.currentScene;
        if (!s || s.showHud === false) return false;
        if (typeof Dialogue !== 'undefined' && Dialogue.active) return false;
        if (typeof Hud !== 'undefined' && Hud.tutorial) return false;
        return true;
    },

    open() {
        if (!this.canOpen()) return;
        this.active = true;
        this.closing = false;
        this.t = 0;
        if (typeof Player !== 'undefined' && Player.lock) Player.lock();
    },

    close() {
        if (!this.active) return;
        this.closing = true;
        if (typeof Player !== 'undefined' && Player.unlock) Player.unlock();
    },

    // Called by Engine each frame BEFORE the scene updates.
    handleInput() {
        if (this.active) {
            if (Engine.justPressed('KeyM') || Engine.justPressed('Escape')) this.close();
            // swallow interact presses so closing doesn't trigger world actions
            Engine.keysJustPressed = {};
            Engine.mouseClicked = false;
        } else if (Engine.justPressed('KeyM')) {
            this.open();
        }
    },

    update(dt) {
        const speed = 4.5;
        if (this.active && !this.closing) {
            this.t = Math.min(1, this.t + dt * speed);
        } else if (this.closing) {
            this.t = Math.max(0, this.t - dt * speed);
            if (this.t <= 0) { this.active = false; this.closing = false; }
        }
    },

    // ease out cubic
    ease(x) { return 1 - Math.pow(1 - x, 3); },

    // Numbered locations placed over the redrawn terrain (normalized 0..1).
    SPOTS: [
        { n: 1,  x: 0.065, y: 0.10, vi: 'Bến xe làng',  en: 'Bus stop' },
        { n: 2,  x: 0.105, y: 0.27, vi: 'Cổng làng',    en: 'Village gate' },
        { n: 3,  x: 0.335, y: 0.11, vi: 'Nhà bà nội',   en: "Grandma's house" },
        { n: 4,  x: 0.355, y: 0.43, vi: 'Sân đình',     en: 'Temple yard' },
        { n: 5,  x: 0.500, y: 0.34, vi: 'Đình làng',    en: 'Communal house' },
        { n: 6,  x: 0.730, y: 0.27, vi: 'Cây đa',       en: 'Banyan tree' },
        { n: 7,  x: 0.445, y: 0.62, vi: 'Giếng nước',   en: 'Old well' },
        { n: 8,  x: 0.110, y: 0.58, vi: 'Nhà ông Tư',   en: "Mr Tu's house" },
        { n: 9,  x: 0.585, y: 0.60, vi: 'Bãi thả diều', en: 'Kite field' },
        { n: 10, x: 0.905, y: 0.66, vi: 'Cánh đồng',    en: 'Rice fields' },
        { n: 11, x: 0.270, y: 0.84, vi: 'Bờ sông',      en: 'Riverbank' },
        { n: 12, x: 0.530, y: 0.87, vi: 'Bãi tắm sông', en: 'River beach' },
        { n: 13, x: 0.820, y: 0.85, vi: 'Nghĩa địa cũ', en: 'Old cemetery' },
    ],

    render(ctx) {
        if (!this.active && this.t <= 0) return;
        this.update(Engine.dt);
        const W = Engine.W, H = Engine.H;
        const e = this.ease(this.t);
        const vi = Engine.locale === 'vi';

        // Dim the frozen world behind the board
        ctx.fillStyle = `rgba(7,6,11,${0.86 * e})`;
        ctx.fillRect(0, 0, W, H);

        ctx.save();
        ctx.globalAlpha = e;
        // subtle pop-in
        const s = 0.985 + 0.015 * e;
        ctx.translate(W / 2, H / 2);
        ctx.scale(s, s);
        ctx.translate(-W / 2, -H / 2);

        // ---- Wooden board ----
        const M = 4;
        const bX = M, bY = M, bW = W - M * 2, bH = H - M * 2;
        ctx.shadowColor = 'rgba(0,0,0,0.55)';
        ctx.shadowBlur = 7; ctx.shadowOffsetY = 2;
        ctx.fillStyle = '#241a12';
        Engine.roundRect(ctx, bX, bY, bW, bH, 5); ctx.fill();
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        ctx.strokeStyle = 'rgba(214,178,95,0.75)'; ctx.lineWidth = 0.8;
        Engine.roundRect(ctx, bX + 0.7, bY + 0.7, bW - 1.4, bH - 1.4, 5); ctx.stroke();
        ctx.strokeStyle = 'rgba(214,178,95,0.18)'; ctx.lineWidth = 0.5;
        Engine.roundRect(ctx, bX + 2.4, bY + 2.4, bW - 4.8, bH - 4.8, 4); ctx.stroke();

        // ---- Left legend panel ----
        const pX = bX + 3, pY = bY + 3, pW = 80, pH = bH - 6;
        ctx.fillStyle = 'rgba(15,11,7,0.55)';
        Engine.roundRect(ctx, pX, pY, pW, pH, 3); ctx.fill();
        ctx.strokeStyle = 'rgba(214,178,95,0.22)'; ctx.lineWidth = 0.4;
        Engine.roundRect(ctx, pX + 0.3, pY + 0.3, pW - 0.6, pH - 0.6, 3); ctx.stroke();

        const cx = pX + pW / 2;
        // Title
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f3e3b6'; ctx.font = Engine.font(8.5, 800);
        ctx.fillText('PAPER BOATS', cx, pY + 12);
        // little boat glyph
        this.boatGlyph(ctx, cx, pY + 16.5, 7, '#d6b25f');
        ctx.fillStyle = '#e9dcc0'; ctx.font = Engine.font(6.5, 700);
        ctx.fillText(vi ? 'BẢN ĐỒ LÀNG' : 'VILLAGE MAP', cx, pY + 25);
        ctx.fillStyle = '#a89a7e'; ctx.font = Engine.font(4.6, 600);
        ctx.fillText('HÀ NỘI · 1996', cx, pY + 31);

        // divider
        ctx.strokeStyle = 'rgba(214,178,95,0.3)'; ctx.lineWidth = 0.4;
        ctx.beginPath(); ctx.moveTo(pX + 6, pY + 35.5); ctx.lineTo(pX + pW - 6, pY + 35.5); ctx.stroke();

        // CHÚ THÍCH header
        ctx.fillStyle = '#d6b25f'; ctx.font = Engine.font(5.2, 800);
        ctx.fillText(vi ? 'CHÚ THÍCH' : 'LEGEND', cx, pY + 41.5);

        // list 1..13
        const listTop = pY + 47;
        const step = (pH - (listTop - pY) - 4) / this.SPOTS.length;
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        for (let i = 0; i < this.SPOTS.length; i++) {
            const sp = this.SPOTS[i];
            const ry = listTop + step * i + step / 2;
            // chip
            const chW = 8.5, chH = 6.2, chX = pX + 5, chY = ry - chH / 2;
            ctx.fillStyle = '#2f6fb0';
            Engine.roundRect(ctx, chX, chY, chW, chH, 1.6); ctx.fill();
            ctx.strokeStyle = 'rgba(255,230,168,0.5)'; ctx.lineWidth = 0.35;
            Engine.roundRect(ctx, chX + 0.2, chY + 0.2, chW - 0.4, chH - 0.4, 1.4); ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.font = Engine.font(4.6, 800);
            ctx.textAlign = 'center';
            ctx.fillText(String(sp.n), chX + chW / 2, ry + 0.3);
            // label
            ctx.fillStyle = '#e3d8bf'; ctx.font = Engine.font(5, 600);
            ctx.textAlign = 'left';
            ctx.fillText(vi ? sp.vi : sp.en, chX + chW + 3, ry + 0.3);
        }
        ctx.textBaseline = 'alphabetic';

        // ---- Map area (clean redrawn terrain + code badges) ----
        const img = (typeof Assets !== 'undefined') ? Assets.get('map_village') : null;
        const mX = pX + pW + 4, mY = bY + 4;
        const mW = (bX + bW - 4) - mX, mH = bH - 8;

        // map frame
        ctx.fillStyle = '#1a130c';
        Engine.roundRect(ctx, mX - 1.5, mY - 1.5, mW + 3, mH + 3, 3); ctx.fill();

        if (img) {
            const iw = img.naturalWidth, ih = img.naturalHeight;
            const scale = Math.min(mW / iw, mH / ih);
            const dw = iw * scale, dh = ih * scale;
            const dx = mX + (mW - dw) / 2, dy = mY + (mH - dh) / 2;

            ctx.save();
            Engine.roundRect(ctx, dx, dy, dw, dh, 2.5); ctx.clip();
            ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, dx, dy, dw, dh);
            ctx.imageSmoothingEnabled = false;
            // gentle parchment warmth
            ctx.fillStyle = 'rgba(60,40,15,0.10)';
            ctx.fillRect(dx, dy, dw, dh);
            ctx.restore();

            ctx.strokeStyle = 'rgba(214,178,95,0.6)'; ctx.lineWidth = 0.6;
            Engine.roundRect(ctx, dx, dy, dw, dh, 2.5); ctx.stroke();

            // numbered badges
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            for (const sp of this.SPOTS) {
                const px = dx + sp.x * dw, py = dy + sp.y * dh;
                const r = 5.2;
                // pin shadow
                ctx.fillStyle = 'rgba(0,0,0,0.35)';
                ctx.beginPath(); ctx.ellipse(px, py + r * 0.9, r * 0.7, r * 0.28, 0, 0, Math.PI * 2); ctx.fill();
                // disc
                ctx.fillStyle = '#2f6fb0';
                ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#ffe6a8'; ctx.lineWidth = 0.8;
                ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.stroke();
                ctx.fillStyle = '#fff'; ctx.font = Engine.font(5.4, 800);
                ctx.fillText(String(sp.n), px, py + 0.4);
            }
            ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
        } else {
            ctx.globalAlpha = e;
            Engine.drawTextCentered(ctx, 'BẢN ĐỒ LÀNG', H / 2 - 4, '#e9dcc0', 12, 700);
            Engine.drawTextCentered(ctx, vi ? 'Đang tải bản đồ…' : 'Loading map…', H / 2 + 10, '#b8ad97', 7, 400);
        }

        ctx.restore();

        // ---- Close hint pill (bottom-center, over board) ----
        ctx.globalAlpha = e;
        const txt = vi ? 'Đóng bản đồ' : 'Close map';
        ctx.font = Engine.font(7, 700);
        const tw = ctx.measureText(txt).width;
        const keyW = 22;
        const bw2 = tw + keyW + 16;
        const bx2 = (W - bw2) / 2, by2 = H - 13, bh2 = 11;
        ctx.fillStyle = 'rgba(18,14,9,0.92)';
        Engine.roundRect(ctx, bx2, by2, bw2, bh2, 4.5); ctx.fill();
        ctx.strokeStyle = 'rgba(214,178,95,0.4)'; ctx.lineWidth = 0.5;
        Engine.roundRect(ctx, bx2 + 0.3, by2 + 0.3, bw2 - 0.6, bh2 - 0.6, 4.5); ctx.stroke();
        ctx.fillStyle = '#ffe6a8';
        Engine.roundRect(ctx, bx2 + 4, by2 + 2.6, keyW - 2, bh2 - 5.2, 2); ctx.fill();
        ctx.fillStyle = '#3a2a08'; ctx.font = Engine.font(5.6, 800);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('M / ESC', bx2 + 4 + (keyW - 2) / 2, by2 + bh2 / 2 + 0.3);
        ctx.fillStyle = '#f0e6d2'; ctx.font = Engine.font(7, 700);
        ctx.textAlign = 'left';
        ctx.fillText(txt, bx2 + keyW + 8, by2 + bh2 / 2 + 0.3);
        ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
    },

    // tiny paper-boat glyph
    boatGlyph(ctx, cx, cy, w, color) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(cx - w / 2, cy);
        ctx.lineTo(cx + w / 2, cy);
        ctx.lineTo(cx + w / 3.2, cy + w / 3.2);
        ctx.lineTo(cx - w / 3.2, cy + w / 3.2);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy - w / 2.6);
        ctx.lineTo(cx + w / 2.4, cy - 0.4);
        ctx.lineTo(cx, cy - 0.4);
        ctx.closePath(); ctx.fill();
        ctx.restore();
    },

    // Small persistent "M Bản đồ" hint drawn on gameplay scenes (discoverability)
    renderButtonHint(ctx) {
        if (this.active) return;
        if (!this.canOpen()) return;
        const W = Engine.W;
        const vi = Engine.locale === 'vi';
        const txt = vi ? 'Bản đồ' : 'Map';
        ctx.font = Engine.font(7, 600);
        const tw = ctx.measureText(txt).width;
        const keyW = 9;
        const bw = tw + keyW + 12;
        const bx = W - bw - 6, by = 6, bh = 13;
        ctx.fillStyle = 'rgba(18,16,26,0.6)';
        Engine.roundRect(ctx, bx, by, bw, bh, 4); ctx.fill();
        ctx.fillStyle = '#ffe6a8';
        Engine.roundRect(ctx, bx + 4, by + 3, keyW, bh - 6, 2); ctx.fill();
        ctx.fillStyle = '#3a2a08'; ctx.font = Engine.font(6.5, 700);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('M', bx + 4 + keyW / 2, by + bh / 2 + 0.5);
        ctx.fillStyle = '#e8dcc0'; ctx.font = Engine.font(7, 600);
        ctx.textAlign = 'left';
        ctx.fillText(txt, bx + keyW + 7, by + bh / 2 + 0.5);
        ctx.textBaseline = 'alphabetic';
    },
};
