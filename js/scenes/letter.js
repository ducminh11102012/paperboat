// Paper Boats — Letter Scene (Post-Credits)
const LetterScene = {
    phase: 'black',
    timer: 0,
    scrollY: 0,
    letterLines: [],
    paperAlpha: 0,
    creditsShown: false,
    creditLines: [],
    showPS: false,
    psText: '',
    thanksText: '',

    init() {
        this.phase = 'black';
        this.timer = 0;
        this.scrollY = 0;
        this.paperAlpha = 0;
        this.creditsShown = false;
        this.showPS = false;
        Audio.stopMusic();

        // Build letter content
        const locale = Engine.locale;
        this.letterLines = Engine.getDialogue('letter') || [];

        // P/S based on memories
        if (Engine.getFlag('mem_boat')) {
            this.psText = Engine.getDialogue('letter_ps_boat');
        } else {
            this.psText = Engine.getDialogue('letter_ps_default');
        }

        // Thanks line if all memories
        if (Engine.memoriesKept >= 3) {
            this.thanksText = Engine.getDialogue('letter_thanks_all');
        } else {
            this.thanksText = '';
        }

        // Credits
        this.creditLines = [
            'Paper Boats',
            'Thuyền Giấy',
            '',
            'A story about a child afraid of being forgotten.',
            'Câu chuyện về một đứa trẻ sợ bị quên lãng.',
            '',
            'And a summer that kept her forever.',
            'Và một mùa hè đã giữ em lại mãi mãi.',
            '',
            '',
            `Memories kept: ${Engine.memoriesKept} / 4`,
            '',
            '',
            'Art & Tiles',
            'Tileset: Kenney.nl — Tiny Town (CC0)',
            'Backgrounds & portraits: AI painted',
            'Font: Be Vietnam Pro',
            '',
            'Cảm ơn Kenney.nl',
            '',
        ];
    },

    update(dt) {
        this.timer += dt;

        switch (this.phase) {
            case 'black':
                if (this.timer > 3) {
                    this.phase = 'credits';
                    this.timer = 0;
                    this.scrollY = Engine.H;
                    // Start farewell music after pause
                    setTimeout(() => Audio.playMusic('farewell'), 1000);
                }
                break;

            case 'credits':
                this.scrollY -= dt * 12;
                if (this.timer > 12 || Engine.anyInteract()) {
                    this.phase = 'letter_appear';
                    this.timer = 0;
                    this.paperAlpha = 0;
                }
                break;

            case 'letter_appear':
                this.paperAlpha = Math.min(1, this.timer * 0.5);
                if (this.timer > 2.5) {
                    this.phase = 'letter';
                    this.timer = 0;
                    this.scrollY = 0;
                }
                break;

            case 'letter':
                // Slow auto-scroll or manual scroll
                if (Engine.keys['ArrowDown'] || Engine.keys['KeyS']) {
                    this.scrollY += dt * 40;
                } else if (Engine.keys['ArrowUp'] || Engine.keys['KeyW']) {
                    this.scrollY = Math.max(0, this.scrollY - dt * 40);
                } else {
                    this.scrollY += dt * 10;
                }

                // Show P/S after scrolling enough
                const maxScroll = this.letterLines.length * 10 - 40;
                if (this.scrollY > maxScroll && !this.showPS) {
                    this.showPS = true;
                }

                // End
                if (this.scrollY > maxScroll + 80 && Engine.anyInteract()) {
                    this.phase = 'end';
                    this.timer = 0;
                }
                break;

            case 'end':
                // Return to title after a moment
                if (this.timer > 3 || Engine.anyInteract()) {
                    Audio.stopMusic();
                    Engine.fadeToScene(TitleScene);
                }
                break;
        }
    },

    render(ctx) {
        // Background
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, Engine.W, Engine.H);

        switch (this.phase) {
            case 'black':
                // Just darkness with fading text
                if (this.timer > 1) {
                    const a = Math.min(1, (this.timer - 1) * 0.5);
                    ctx.globalAlpha = a;
                    // Sound of water...
                    const waterText = Engine.locale === 'vi' ? '...tiếng nước chảy...' : '...the sound of flowing water...';
                    Engine.drawTextCentered(ctx, waterText, Engine.H / 2, '#707085', 8, 400);
                    ctx.globalAlpha = 1;
                }
                break;

            case 'credits':
                this.renderCredits(ctx);
                break;

            case 'letter_appear':
            case 'letter':
                this.renderLetter(ctx);
                break;

            case 'end':
                // Final fade
                this.renderLetter(ctx);
                ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, this.timer * 0.5)})`;
                ctx.fillRect(0, 0, Engine.W, Engine.H);

                if (this.timer > 1.5) {
                    ctx.globalAlpha = Math.min(1, (this.timer - 1.5) * 0.7);
                    const endText = Engine.locale === 'vi' ? 'Cảm ơn bạn đã chơi.' : 'Thank you for playing.';
                    Engine.drawTextCentered(ctx, endText, Engine.H / 2, '#c8b89a', 10, 600);
                    ctx.globalAlpha = 1;
                }
                break;
        }
    },

    renderCredits(ctx) {
        // soft starry dusk backdrop
        const g = ctx.createLinearGradient(0, 0, 0, Engine.H);
        g.addColorStop(0, '#0c1024'); g.addColorStop(1, '#161228');
        ctx.fillStyle = g; ctx.fillRect(0, 0, Engine.W, Engine.H);

        let y = this.scrollY;
        for (const line of this.creditLines) {
            if (y > -10 && y < Engine.H + 10 && line !== '') {
                let col = '#a7a7c0', sz = 8, wt = 400;
                if (line === 'Paper Boats') { col = '#f0e3c4'; sz = 13; wt = 700; }
                else if (line === 'Thuyền Giấy') { col = '#d8c8a0'; sz = 10; wt = 600; }
                else if (line.startsWith('Memories')) { col = '#ffd76a'; sz = 8; wt = 600; }
                else if (line === 'Art & Tiles') { col = '#8fb0d8'; sz = 8; wt = 600; }
                Engine.drawTextCentered(ctx, line, y, col, sz, wt);
            }
            y += 14;
        }
    },

    renderLetter(ctx) {
        // Painted dawn riverbank behind the letter
        const art = (typeof Assets !== 'undefined') ? Assets.get('bg_letter') : null;
        if (art) {
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(art, 0, 0, Engine.W, Engine.H);
            ctx.imageSmoothingEnabled = false;
            ctx.fillStyle = 'rgba(10,8,16,0.30)';
            ctx.fillRect(0, 0, Engine.W, Engine.H);
        } else {
            ctx.fillStyle = '#0a0a0f'; ctx.fillRect(0, 0, Engine.W, Engine.H);
        }

        ctx.globalAlpha = this.paperAlpha || 1;

        // Parchment sheet (centred, with soft shadow)
        const margin = 24;
        const px0 = margin, py0 = 8, pw = Engine.W - margin * 2, ph = Engine.H - 16;
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        Engine.roundRect(ctx, px0 + 2, py0 + 3, pw, ph, 4); ctx.fill();
        const pg = ctx.createLinearGradient(0, py0, 0, py0 + ph);
        pg.addColorStop(0, '#f2e7c9'); pg.addColorStop(1, '#e6d6ad');
        ctx.fillStyle = pg;
        Engine.roundRect(ctx, px0, py0, pw, ph, 4); ctx.fill();
        ctx.strokeStyle = 'rgba(150,120,80,0.5)'; ctx.lineWidth = 0.7;
        Engine.roundRect(ctx, px0 + 0.4, py0 + 0.4, pw - 0.8, ph - 0.8, 4); ctx.stroke();

        // subtle speckle texture
        ctx.fillStyle = 'rgba(180,150,100,0.25)';
        for (let i = 0; i < 26; i++) {
            const sx = px0 + 5 + (i * 53) % (pw - 10);
            const sy = py0 + 6 + (i * 29) % (ph - 12);
            ctx.fillRect(sx, sy, 1, 1);
        }

        // Letter text
        let y = 20 - this.scrollY;
        const textX = px0 + 12;
        const maxW = pw - 24;

        for (let i = 0; i < this.letterLines.length; i++) {
            const line = this.letterLines[i];
            if (y > 6 && y < Engine.H - 12) {
                let col = '#4a3a20', sz = 8, wt = 400;
                if (i === 0) { col = '#3a2a1a'; sz = 9; wt = 600; }
                else if (line.startsWith('—')) { col = '#4a3a2a'; sz = 8; wt = 600; }
                if (line === '') {
                    y += 5;
                } else {
                    y = Engine.drawText(ctx, line, textX, y, maxW, col, sz, sz + 3, wt);
                }
            } else {
                y += line === '' ? 5 : 11;
            }
        }

        // P/S
        if (this.showPS && this.psText) {
            y += 6;
            if (y > 8 && y < Engine.H - 16) {
                ctx.fillStyle = '#5a4a30';
                ctx.font = '6px monospace';
                Engine.drawText(ctx, this.psText, textX, y, maxW, '#5a4a30', 8, 11, 400);
                y += 12;
            }
        }

        // Thanks line
        if (this.showPS && this.thanksText) {
            y += 2;
            if (y > 8 && y < Engine.H - 16) {
                ctx.fillStyle = '#6a5a30';
                ctx.font = '6px monospace';
                Engine.drawText(ctx, this.thanksText, textX, y, maxW, '#6a5a30', 8, 11, 600);
            }
        }

        // Ink stains (a child's writing)
        ctx.fillStyle = 'rgba(50, 40, 30, 0.1)';
        ctx.fillRect(margin + 15, 30, 3, 2);
        ctx.fillRect(Engine.W - margin - 30, Engine.H - 40, 4, 3);

        ctx.globalAlpha = 1;
    },
};
