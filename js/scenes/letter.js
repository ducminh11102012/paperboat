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
                    ctx.fillStyle = '#505060';
                    ctx.font = '7px monospace';
                    const waterText = Engine.locale === 'vi' ? '...tiếng nước chảy...' : '...the sound of flowing water...';
                    const ww = ctx.measureText(waterText).width;
                    ctx.fillText(waterText, (Engine.W - ww) / 2, Engine.H / 2);
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
                    ctx.fillStyle = '#a09080';
                    ctx.font = '8px monospace';
                    const endText = Engine.locale === 'vi' ? 'Cảm ơn bạn đã chơi.' : 'Thank you for playing.';
                    const ew = ctx.measureText(endText).width;
                    ctx.fillText(endText, (Engine.W - ew) / 2, Engine.H / 2);
                    ctx.globalAlpha = 1;
                }
                break;
        }
    },

    renderCredits(ctx) {
        ctx.font = '8px monospace';
        let y = this.scrollY;

        for (const line of this.creditLines) {
            if (y > -10 && y < Engine.H + 10) {
                if (line === 'Paper Boats') {
                    ctx.fillStyle = '#e8d8c0';
                    ctx.font = 'bold 12px monospace';
                } else if (line.startsWith('Memories')) {
                    ctx.fillStyle = '#ffd700';
                    ctx.font = '7px monospace';
                } else {
                    ctx.fillStyle = '#a0a0b0';
                    ctx.font = '8px monospace';
                }
                const w = ctx.measureText(line).width;
                ctx.fillText(line, (Engine.W - w) / 2, y);
            }
            y += 14;
        }
    },

    renderLetter(ctx) {
        // Paper texture background
        ctx.globalAlpha = this.paperAlpha || 1;

        // Old paper
        ctx.fillStyle = '#d8c8a0';
        const margin = 20;
        ctx.fillRect(margin, 6, Engine.W - margin * 2, Engine.H - 12);

        // Paper texture effect
        ctx.fillStyle = '#c8b890';
        for (let i = 0; i < 30; i++) {
            const px = margin + 5 + (i * 37) % (Engine.W - margin * 2 - 10);
            const py = 10 + (i * 23) % (Engine.H - 20);
            ctx.fillRect(px, py, 2, 1);
        }

        // Slight fold line
        ctx.fillStyle = '#c0b080';
        ctx.fillRect(margin, Engine.H / 2, Engine.W - margin * 2, 1);

        // Letter text
        ctx.font = '6px monospace';
        let y = 18 - this.scrollY;
        const textX = margin + 8;
        const maxW = Engine.W - margin * 2 - 16;

        for (let i = 0; i < this.letterLines.length; i++) {
            const line = this.letterLines[i];
            if (y > 8 && y < Engine.H - 16) {
                if (i === 0) {
                    // "Dear..." line
                    ctx.fillStyle = '#3a2a1a';
                    ctx.font = '7px monospace';
                } else if (line.startsWith('—')) {
                    ctx.fillStyle = '#4a3a2a';
                    ctx.font = 'bold 7px monospace';
                } else {
                    ctx.fillStyle = '#4a3a20';
                    ctx.font = '6px monospace';
                }

                if (line === '') {
                    y += 4;
                } else {
                    // Word wrap
                    y = Engine.drawText(ctx, line, textX, y, maxW, ctx.fillStyle, 6, 8);
                }
            } else {
                y += line === '' ? 4 : 8;
            }
        }

        // P/S
        if (this.showPS && this.psText) {
            y += 6;
            if (y > 8 && y < Engine.H - 16) {
                ctx.fillStyle = '#5a4a30';
                ctx.font = '6px monospace';
                Engine.drawText(ctx, this.psText, textX, y, maxW, '#5a4a30', 6, 8);
                y += 12;
            }
        }

        // Thanks line
        if (this.showPS && this.thanksText) {
            y += 2;
            if (y > 8 && y < Engine.H - 16) {
                ctx.fillStyle = '#6a5a30';
                ctx.font = '6px monospace';
                Engine.drawText(ctx, this.thanksText, textX, y, maxW, '#6a5a30', 6, 8);
            }
        }

        // Ink stains (a child's writing)
        ctx.fillStyle = 'rgba(50, 40, 30, 0.1)';
        ctx.fillRect(margin + 15, 30, 3, 2);
        ctx.fillRect(Engine.W - margin - 30, Engine.H - 40, 4, 3);

        ctx.globalAlpha = 1;
    },
};
