// Paper Boats — Dialogue System (crisp hi-res rendering)
const Dialogue = {
    active: false,
    queue: [],
    currentIndex: 0,
    displayedText: '',
    fullText: '',
    charIndex: 0,
    charTimer: 0,
    charSpeed: 0.022,
    speaker: '',
    portrait: '',
    onComplete: null,
    choiceData: null,
    selectedChoice: 0,
    blipTimer: 0,
    waitingForInput: false,

    // layout
    boxH: 50,
    get boxY() { return Engine.H - this.boxH - 6; },

    start(dialogueKey, onComplete) {
        const data = Engine.getDialogue(dialogueKey);
        if (!data || data.length === 0) { if (onComplete) onComplete(); return; }
        this.queue = data; this.currentIndex = 0; this.active = true;
        this.choiceData = null; this.onComplete = onComplete;
        this.showLine(this.queue[0]);
    },

    startRaw(lines, onComplete) {
        if (!lines || lines.length === 0) { if (onComplete) onComplete(); return; }
        this.queue = lines; this.currentIndex = 0; this.active = true;
        this.choiceData = null; this.onComplete = onComplete;
        this.showLine(this.queue[0]);
    },

    showChoice(choiceKey, onSelect) {
        const data = Engine.getDialogue(choiceKey);
        if (!data || !data.options) { if (onSelect) onSelect(null); return; }
        this.active = true; this.choiceData = data; this.selectedChoice = 0;
        this.waitingForInput = true; this.displayedText = ''; this.fullText = '';
        this.speaker = ''; this.portrait = '';
        this.onComplete = (choice) => { this.choiceData = null; if (onSelect) onSelect(choice); };
    },

    showLine(line) {
        this.speaker = line.speaker || '';
        this.portrait = line.portrait || '';
        this.fullText = line.text || '';
        this.displayedText = ''; this.charIndex = 0; this.charTimer = 0;
        this.blipTimer = 0; this.waitingForInput = false;
    },

    choiceLayout() {
        const n = this.choiceData.options.length;
        const rowH = 16;
        const boxH = 14 + n * rowH;
        const boxY = Engine.H - boxH - 6;
        return { n, rowH, boxH, boxY, bx: 8, bw: Engine.W - 16 };
    },

    update(dt) {
        if (!this.active) return;

        if (this.choiceData) {
            if (Engine.justPressed('ArrowUp') || Engine.justPressed('KeyW'))
                this.selectedChoice = Math.max(0, this.selectedChoice - 1);
            if (Engine.justPressed('ArrowDown') || Engine.justPressed('KeyS'))
                this.selectedChoice = Math.min(this.choiceData.options.length - 1, this.selectedChoice + 1);
            const L = this.choiceLayout();
            if (Engine.mouseClicked) {
                for (let i = 0; i < L.n; i++) {
                    const cy = L.boxY + 8 + i * L.rowH;
                    if (Engine.mouseY >= cy && Engine.mouseY < cy + L.rowH) {
                        this.selectedChoice = i;
                        if (this.onComplete) this.onComplete(this.choiceData.options[i]);
                        return;
                    }
                }
            }
            if (Engine.justPressed('Space') || Engine.justPressed('Enter') || Engine.justPressed('KeyZ')) {
                const choice = this.choiceData.options[this.selectedChoice];
                if (this.onComplete) this.onComplete(choice);
            }
            return;
        }

        if (this.charIndex < this.fullText.length) {
            this.charTimer += dt;
            while (this.charTimer >= this.charSpeed && this.charIndex < this.fullText.length) {
                this.charTimer -= this.charSpeed;
                this.charIndex++;
                this.displayedText = this.fullText.substring(0, this.charIndex);
                this.blipTimer += this.charSpeed;
                if (this.blipTimer >= 0.05 && this.fullText[this.charIndex - 1] !== ' ') {
                    if (typeof Audio !== 'undefined' && Audio.playBlip) Audio.playBlip(this.speaker);
                    this.blipTimer = 0;
                }
            }
            if (Engine.anyInteract()) {
                this.displayedText = this.fullText;
                this.charIndex = this.fullText.length;
            }
        } else if (!this.waitingForInput) {
            this.waitingForInput = true;
        } else if (Engine.anyInteract()) {
            this.currentIndex++;
            if (this.currentIndex >= this.queue.length) {
                this.active = false;
                if (this.onComplete) this.onComplete();
            } else {
                this.showLine(this.queue[this.currentIndex]);
            }
        }
    },

    panel(ctx, x, y, w, h) {
        // drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        Engine.roundRect(ctx, x + 1.5, y + 2, w, h, 7); ctx.fill();
        // body
        ctx.fillStyle = 'rgba(20,17,28,0.93)';
        Engine.roundRect(ctx, x, y, w, h, 7); ctx.fill();
        // gold border
        ctx.strokeStyle = 'rgba(212,180,131,0.85)'; ctx.lineWidth = 0.8;
        Engine.roundRect(ctx, x + 0.4, y + 0.4, w - 0.8, h - 0.8, 7); ctx.stroke();
    },

    render(ctx) {
        if (!this.active) return;
        const W = Engine.W;

        if (this.choiceData) {
            const L = this.choiceLayout();
            this.panel(ctx, L.bx, L.boxY, L.bw, L.boxH);
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            for (let i = 0; i < L.n; i++) {
                const cy = L.boxY + 8 + i * L.rowH;
                const sel = i === this.selectedChoice;
                if (sel) {
                    ctx.fillStyle = 'rgba(255,210,90,0.16)';
                    Engine.roundRect(ctx, L.bx + 5, cy, L.bw - 10, L.rowH - 2, 4); ctx.fill();
                    ctx.fillStyle = '#ffd24a'; ctx.font = Engine.font(9, 700);
                    ctx.fillText('▸', L.bx + 12, cy + L.rowH / 2);
                    ctx.fillStyle = '#ffe9bd'; ctx.font = Engine.font(9, 600);
                } else {
                    ctx.fillStyle = '#b6aea0'; ctx.font = Engine.font(9, 400);
                }
                ctx.fillText(this.choiceData.options[i].text, L.bx + 22, cy + L.rowH / 2);
            }
            ctx.textBaseline = 'alphabetic';
            return;
        }

        const boxH = this.boxH, boxY = this.boxY;
        const hasPortrait = this.portrait && this.portrait.length > 0;
        const pad = 12;
        const portraitSize = 40;
        const textX = hasPortrait ? 8 + portraitSize + 12 : pad + 4;
        const textW = W - textX - pad;

        this.panel(ctx, 6, boxY, W - 12, boxH);

        if (hasPortrait) {
            const artPrt = (typeof Assets !== 'undefined') ? Assets.getPortrait(this.portrait) : null;
            const fx = 10, fy = boxY + (boxH - portraitSize) / 2;
            ctx.fillStyle = '#0e0b08';
            Engine.roundRect(ctx, fx - 1.5, fy - 1.5, portraitSize + 3, portraitSize + 3, 4); ctx.fill();
            if (artPrt) {
                ctx.save();
                Engine.roundRect(ctx, fx, fy, portraitSize, portraitSize, 3); ctx.clip();
                ctx.imageSmoothingEnabled = true;
                ctx.drawImage(artPrt, fx, fy, portraitSize, portraitSize);
                ctx.imageSmoothingEnabled = false;
                ctx.restore();
            } else {
                const prt = Sprites.getPortrait(this.portrait);
                if (prt) ctx.drawImage(prt, fx, fy, portraitSize, portraitSize);
            }
            ctx.strokeStyle = 'rgba(212,180,131,0.85)'; ctx.lineWidth = 0.8;
            Engine.roundRect(ctx, fx, fy, portraitSize, portraitSize, 3); ctx.stroke();
        }

        let ty = boxY + 13;
        if (this.speaker) {
            ctx.fillStyle = '#ffd24a';
            ctx.font = Engine.font(9, 700);
            ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
            ctx.fillText(this.speaker, textX, ty);
            ty += 13;
        } else {
            ty = boxY + 16;
        }
        Engine.drawText(ctx, this.displayedText, textX, ty, textW, '#f1e9d8', 9, 12, 400);

        if (this.waitingForInput) {
            const blink = Math.sin(Engine.frameCount * 0.1) > 0;
            if (blink) {
                ctx.fillStyle = '#ffd24a';
                ctx.font = Engine.font(8, 700);
                ctx.fillText('▼', W - 18, boxY + boxH - 7);
            }
        }
    },
};
