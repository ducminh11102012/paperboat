// Paper Boats — HUD / Guidance system (hi-res, crisp)
const Hud = {
    areaToast: null,        // {text, t}
    prompt: null,           // {text, target:{x,y}}
    tutorial: null,         // {lines, t} when active

    L() { return Engine.locale; },

    onSceneChange() {
        this.areaToast = null;
        this.prompt = null;
    },

    showAreaToast(vi, en) {
        this.areaToast = { vi, en, t: 0 };
    },

    // Scene calls each frame while player can interact with something
    setPrompt(vi, en, target = null) {
        this.prompt = { vi, en, target };
    },

    showTutorial() {
        if (Engine.getFlag('tutorial_done')) return;
        this.tutorial = { t: 0 };
        if (Player && Player.lock) Player.lock();
    },

    cam() {
        const s = Engine.currentScene || {};
        return { x: s.cameraX || 0, y: s.cameraY || 0 };
    },

    update(dt) {
        if (this.areaToast) {
            this.areaToast.t += dt;
            if (this.areaToast.t > 3.4) this.areaToast = null;
        }
        if (this.tutorial) {
            this.tutorial.t += dt;
            if (this.tutorial.t > 0.4 && Engine.anyInteract()) {
                this.tutorial = null;
                Engine.setFlag('tutorial_done');
                if (Player && Player.unlock) Player.unlock();
            }
        }
    },

    render(ctx) {
        this.update(Engine.dt);
        const W = Engine.W, H = Engine.H;

        // ---- Objective banner (top-left) ----
        if (Engine.objective && !(this.tutorial)) {
            const txt = Engine.objective[this.L()] || Engine.objective.vi;
            ctx.font = Engine.font(8, 600);
            const tw = ctx.measureText(txt).width;
            const padX = 7, iconW = 11;
            const bw = Math.min(W - 12, tw + padX * 2 + iconW + 4);
            const bx = 6, by = 6, bh = 16;
            ctx.fillStyle = 'rgba(18,16,26,0.78)';
            Engine.roundRect(ctx, bx, by, bw, bh, 5); ctx.fill();
            ctx.strokeStyle = 'rgba(255,215,120,0.5)'; ctx.lineWidth = 0.6;
            Engine.roundRect(ctx, bx + 0.3, by + 0.3, bw - 0.6, bh - 0.6, 5); ctx.stroke();
            // target diamond icon (pulsing)
            const pulse = 0.6 + 0.4 * Math.sin(Engine.frameCount * 0.08);
            ctx.fillStyle = `rgba(255,210,90,${pulse})`;
            const dcx = bx + padX + 2, dcy = by + bh / 2;
            ctx.save(); ctx.translate(dcx, dcy); ctx.rotate(Math.PI / 4);
            ctx.fillRect(-2.6, -2.6, 5.2, 5.2); ctx.restore();
            ctx.fillStyle = '#ffe6a8';
            ctx.font = Engine.font(8, 600);
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText(txt, bx + padX + iconW, by + bh / 2 + 0.5);
            ctx.textBaseline = 'alphabetic';
        }

        // ---- Directional arrow toward objective target ----
        if (Engine.objectiveTarget && !this.tutorial && !(Dialogue && Dialogue.active)) {
            const cam = this.cam();
            const px = (Player ? Player.x : W / 2) - cam.x;
            const py = (Player ? Player.y : H / 2) - cam.y;
            const tx = Engine.objectiveTarget.x - cam.x;
            const ty = Engine.objectiveTarget.y - cam.y;
            const dist = Math.hypot(tx - px, ty - py);
            if (dist > 34) {
                const ang = Math.atan2(ty - py, tx - px);
                const rad = 22;
                const ax = px + Math.cos(ang) * rad;
                const ay = py - 12 + Math.sin(ang) * rad;
                const bob = Math.sin(Engine.frameCount * 0.12) * 1.2;
                ctx.save();
                ctx.translate(ax + Math.cos(ang) * bob, ay + Math.sin(ang) * bob);
                ctx.rotate(ang);
                ctx.fillStyle = 'rgba(255,210,90,0.92)';
                ctx.beginPath();
                ctx.moveTo(5, 0); ctx.lineTo(-3, -3.4); ctx.lineTo(-1, 0); ctx.lineTo(-3, 3.4);
                ctx.closePath(); ctx.fill();
                ctx.strokeStyle = 'rgba(90,60,10,0.6)'; ctx.lineWidth = 0.5; ctx.stroke();
                ctx.restore();
            }
        }

        // ---- Interaction prompt + bobbing marker ----
        if (this.prompt && !(Dialogue && Dialogue.active) && !this.tutorial) {
            // bobbing "!" over target
            if (this.prompt.target) {
                const cam = this.cam();
                const mx = this.prompt.target.x - cam.x;
                const my = this.prompt.target.y - cam.y;
                const bob = Math.sin(Engine.frameCount * 0.16) * 1.6;
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath(); ctx.ellipse(mx, my - 22 + 10, 3.5, 1.4, 0, 0, 7); ctx.fill();
                // speech-pop circle
                ctx.fillStyle = '#ffd24a';
                ctx.beginPath(); ctx.arc(mx, my - 28 + bob, 4.2, 0, 7); ctx.fill();
                ctx.fillStyle = '#3a2a08';
                ctx.font = Engine.font(7, 700);
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('!', mx, my - 28 + bob + 0.5);
                ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
            }
            // prompt pill bottom-center
            const txt = (this.prompt[this.L()] || this.prompt.vi);
            // size the key cap to actually fit the word "SPACE" (was clipping to "PAC")
            ctx.font = Engine.font(6.5, 700);
            const keyInner = ctx.measureText('SPACE').width + 7;
            const keyW = keyInner + 2;
            ctx.font = Engine.font(8, 600);
            const tw = ctx.measureText(txt).width;
            const bw = keyW + 10 + tw + 16;
            const bx = (W - bw) / 2, by = H - 30, bh = 15;
            ctx.fillStyle = 'rgba(18,16,26,0.82)';
            Engine.roundRect(ctx, bx, by, bw, bh, 6); ctx.fill();
            // key cap
            ctx.fillStyle = '#ffe6a8';
            Engine.roundRect(ctx, bx + 5, by + 3.5, keyInner, bh - 7, 2.5); ctx.fill();
            ctx.fillStyle = '#3a2a08'; ctx.font = Engine.font(6.5, 700);
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('SPACE', bx + 5 + keyInner / 2, by + bh / 2 + 0.5);
            ctx.fillStyle = '#f0e6d2'; ctx.font = Engine.font(8, 600);
            ctx.textAlign = 'left';
            ctx.fillText(txt, bx + 5 + keyInner + 8, by + bh / 2 + 0.5);
            ctx.textBaseline = 'alphabetic';
        }
        this.prompt = null; // must be re-set each frame

        // ---- Area name toast (centered top) ----
        if (this.areaToast) {
            const a = this.areaToast;
            let alpha = 1;
            if (a.t < 0.4) alpha = a.t / 0.4;
            else if (a.t > 2.6) alpha = Math.max(0, 1 - (a.t - 2.6) / 0.8);
            const txt = a[this.L()] || a.vi;
            ctx.globalAlpha = alpha;
            ctx.font = Engine.font(13, 700);
            ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
            // backing
            const tw = ctx.measureText(txt).width;
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            Engine.roundRect(ctx, W / 2 - tw / 2 - 10, 30, tw + 20, 22, 6); ctx.fill();
            ctx.fillStyle = '#f3e8cf';
            ctx.fillText(txt, W / 2, 45);
            // underline flourish
            ctx.strokeStyle = 'rgba(255,215,120,0.7)'; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(W / 2 - tw / 2, 49); ctx.lineTo(W / 2 + tw / 2, 49); ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.textAlign = 'left';
        }

        // ---- Opening tutorial overlay ----
        if (this.tutorial) {
            ctx.fillStyle = 'rgba(6,6,12,0.82)';
            ctx.fillRect(0, 0, W, H);
            const vi = this.L() === 'vi';
            const title = vi ? 'Cách chơi' : 'How to play';
            const lines = vi ? [
                ['▲▼◀▶ / WASD', 'Di chuyển'],
                ['SPACE / Z', 'Nói chuyện · Tương tác'],
                ['M', 'Mở bản đồ làng'],
                ['Mũi tên vàng', 'Chỉ tới mục tiêu tiếp theo'],
                ['Dấu !', 'Có thể tương tác ở đây'],
            ] : [
                ['▲▼◀▶ / WASD', 'Move'],
                ['SPACE / Z', 'Talk · Interact'],
                ['M', 'Open village map'],
                ['Yellow arrow', 'Points to your next goal'],
                ['The ! mark', 'Something to interact with'],
            ];
            const bw = 210, bh = 132, bx = (W - bw) / 2, by = (H - bh) / 2;
            ctx.fillStyle = 'rgba(24,20,32,0.95)';
            Engine.roundRect(ctx, bx, by, bw, bh, 8); ctx.fill();
            ctx.strokeStyle = 'rgba(255,215,120,0.5)'; ctx.lineWidth = 0.8;
            Engine.roundRect(ctx, bx + 0.4, by + 0.4, bw - 0.8, bh - 0.8, 8); ctx.stroke();
            ctx.fillStyle = '#ffe6a8'; ctx.font = Engine.font(13, 700);
            ctx.textAlign = 'center'; ctx.fillText(title, W / 2, by + 20);
            ctx.textAlign = 'left';
            let yy = by + 38;
            for (const [k, d] of lines) {
                ctx.fillStyle = '#ffd24a'; ctx.font = Engine.font(8.5, 700);
                ctx.fillText(k, bx + 16, yy);
                ctx.fillStyle = '#e8e0d0'; ctx.font = Engine.font(8.5, 400);
                ctx.fillText(d, bx + 96, yy);
                yy += 16;
            }
            const blink = Math.sin(Engine.frameCount * 0.1) > -0.3;
            if (blink) {
                ctx.fillStyle = '#bdb4a4'; ctx.font = Engine.font(8, 600);
                ctx.textAlign = 'center';
                ctx.fillText(vi ? 'Nhấn SPACE để bắt đầu' : 'Press SPACE to begin', W / 2, by + bh - 10);
                ctx.textAlign = 'left';
            }
        }
    },
};
