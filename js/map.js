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

    render(ctx) {
        if (!this.active && this.t <= 0) return;
        this.update(Engine.dt);
        const W = Engine.W, H = Engine.H;
        const e = this.ease(this.t);

        // Dim + blur-ish backdrop over the frozen world
        ctx.fillStyle = `rgba(8,7,12,${0.82 * e})`;
        ctx.fillRect(0, 0, W, H);

        const img = (typeof Assets !== 'undefined') ? Assets.get('map_village') : null;

        // Layout: leave a thin strip at the bottom for the close hint
        const bottomStrip = 14;
        const availH = H - bottomStrip - 6;
        const topPad = 5;

        if (img) {
            const iw = img.naturalWidth, ih = img.naturalHeight;
            const scale = Math.min((W - 10) / iw, availH / ih);
            const dw = iw * scale * (0.96 + 0.04 * e);  // subtle pop-in
            const dh = ih * scale * (0.96 + 0.04 * e);
            const dx = (W - dw) / 2;
            const dy = topPad + (availH - dh) / 2;

            ctx.save();
            ctx.globalAlpha = e;
            // soft drop shadow for a weighty, framed feel
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 3;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, dx, dy, dw, dh);
            ctx.restore();
            ctx.imageSmoothingEnabled = false;
        } else {
            // Fallback if the image hasn't loaded yet
            ctx.globalAlpha = e;
            Engine.drawTextCentered(ctx, 'BẢN ĐỒ LÀNG', H / 2 - 4, '#e9dcc0', 14, 700);
            Engine.drawTextCentered(ctx, 'Đang tải bản đồ…', H / 2 + 10, '#b8ad97', 8, 400);
            ctx.globalAlpha = 1;
        }

        // Close hint pill (bottom-center)
        ctx.globalAlpha = e;
        const vi = Engine.locale === 'vi';
        const txt = vi ? 'Đóng bản đồ' : 'Close map';
        ctx.font = Engine.font(7.5, 600);
        const tw = ctx.measureText(txt).width;
        const keyW = 22; // "M / ESC"
        const bw = tw + keyW + 18;
        const bx = (W - bw) / 2, by = H - bottomStrip - 1, bh = 13;
        ctx.fillStyle = 'rgba(18,16,26,0.86)';
        Engine.roundRect(ctx, bx, by, bw, bh, 5); ctx.fill();
        ctx.strokeStyle = 'rgba(255,215,120,0.35)'; ctx.lineWidth = 0.5;
        Engine.roundRect(ctx, bx + 0.3, by + 0.3, bw - 0.6, bh - 0.6, 5); ctx.stroke();
        // key caps
        ctx.fillStyle = '#ffe6a8';
        Engine.roundRect(ctx, bx + 5, by + 3, keyW - 2, bh - 6, 2.2); ctx.fill();
        ctx.fillStyle = '#3a2a08'; ctx.font = Engine.font(6, 700);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('M / ESC', bx + 5 + (keyW - 2) / 2, by + bh / 2 + 0.5);
        ctx.fillStyle = '#f0e6d2'; ctx.font = Engine.font(7.5, 600);
        ctx.textAlign = 'left';
        ctx.fillText(txt, bx + keyW + 9, by + bh / 2 + 0.5);
        ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
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
