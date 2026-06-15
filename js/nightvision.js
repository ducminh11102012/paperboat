// Paper Boats — Nhãn Âm (Night Vision / spirit sight). Hold V.
// Minh's "ghost eye": hold V to see the dead the village turns away from —
// hidden spirit traces, drowned lights, faint figures. Scenes query
// NightVision.factor (0..1) to fade in their spirit layer, and call
// NightVision.update(dt) + NightVision.renderOverlay/renderHint.
const NightVision = {
    unlocked: false,    // becomes true once Minh's sight awakens (after Ch2)
    factor: 0,          // eased reveal strength 0..1
    _raw: 0,

    unlock() { this.unlocked = true; if (typeof Engine !== 'undefined') Engine.setFlag('nhan_am_unlocked'); },
    isHeld() {
        return this.unlocked && typeof Engine !== 'undefined' &&
               (Engine.keys['KeyV'] || Engine.keys['ShiftLeft'] || Engine.keys['ShiftRight']);
    },

    update(dt) {
        const target = this.isHeld() ? 1 : 0;
        const sp = 5.5;
        this._raw += (target - this._raw) * Math.min(1, dt * sp);
        // ease
        const x = this._raw;
        this.factor = x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
        if (this.factor < 0.002) this.factor = 0;
    },

    // Cold blue spirit vignette + faint drifting motes while sight is active
    renderOverlay(ctx) {
        if (this.factor <= 0) return;
        const W = Engine.W, H = Engine.H, f = this.factor;
        ctx.save();
        ctx.fillStyle = `rgba(18,30,52,${0.34 * f})`;
        ctx.fillRect(0, 0, W, H);
        // vignette
        const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.8);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(1, `rgba(4,8,16,${0.55 * f})`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        // drifting cold motes
        ctx.globalAlpha = f;
        for (let i = 0; i < 14; i++) {
            const t = Engine.frameCount * 0.012 + i * 1.7;
            const mx = (i * 53 + Math.sin(t) * 18) % W;
            const my = (i * 37 + (Engine.frameCount * 0.25 + i * 20)) % H;
            const a = 0.25 + 0.25 * Math.sin(t * 1.3);
            ctx.fillStyle = `rgba(150,200,255,${a})`;
            ctx.beginPath(); ctx.arc(mx, my, 0.7, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    },

    // Bottom-left prompt telling the player the sight is available
    renderHint(ctx) {
        if (!this.unlocked) return;
        const vi = Engine.locale === 'vi';
        const held = this.factor > 0.3;
        const txt = vi ? 'Nhãn Âm' : 'Spirit Sight';
        ctx.font = Engine.font(7, 600);
        const tw = ctx.measureText(txt).width;
        const keyW = 9, bw = tw + keyW + 12;
        const bx = 6, by = Engine.H - 17, bh = 13;
        ctx.fillStyle = held ? 'rgba(40,70,120,0.7)' : 'rgba(18,16,26,0.6)';
        Engine.roundRect(ctx, bx, by, bw, bh, 4); ctx.fill();
        ctx.fillStyle = held ? '#bfe0ff' : '#9fc4ff';
        Engine.roundRect(ctx, bx + 4, by + 3, keyW, bh - 6, 2); ctx.fill();
        ctx.fillStyle = '#0a1428'; ctx.font = Engine.font(6.5, 800); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('V', bx + 4 + keyW / 2, by + bh / 2 + 0.5);
        ctx.fillStyle = '#dce9ff'; ctx.font = Engine.font(7, 600); ctx.textAlign = 'left';
        ctx.fillText(txt, bx + keyW + 7, by + bh / 2 + 0.5);
        ctx.textBaseline = 'alphabetic';
    },

    reset() { this.factor = 0; this._raw = 0; },
};
