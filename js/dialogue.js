// Paper Boats — Dialogue System
const Dialogue = {
    active: false,
    queue: [],
    currentIndex: 0,
    displayedText: '',
    fullText: '',
    charIndex: 0,
    charTimer: 0,
    charSpeed: 0.03, // seconds per character
    speaker: '',
    portrait: '',
    onComplete: null,
    choiceData: null,
    selectedChoice: 0,
    blipTimer: 0,
    waitingForInput: false,

    // Start a dialogue sequence
    start(dialogueKey, onComplete) {
        const data = Engine.getDialogue(dialogueKey);
        if (!data || data.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        this.queue = data;
        this.currentIndex = 0;
        this.active = true;
        this.choiceData = null;
        this.onComplete = onComplete;
        this.showLine(this.queue[0]);
    },

    // Start from raw dialogue array
    startRaw(lines, onComplete) {
        if (!lines || lines.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        this.queue = lines;
        this.currentIndex = 0;
        this.active = true;
        this.choiceData = null;
        this.onComplete = onComplete;
        this.showLine(this.queue[0]);
    },

    // Show a choice
    showChoice(choiceKey, onSelect) {
        const data = Engine.getDialogue(choiceKey);
        if (!data || !data.options) {
            if (onSelect) onSelect(null);
            return;
        }
        this.active = true;
        this.choiceData = data;
        this.selectedChoice = 0;
        this.waitingForInput = true;
        this.displayedText = '';
        this.fullText = '';
        this.speaker = '';
        this.portrait = '';
        this.onComplete = (choice) => {
            this.choiceData = null;
            if (onSelect) onSelect(choice);
        };
    },

    showLine(line) {
        this.speaker = line.speaker || '';
        this.portrait = line.portrait || '';
        this.fullText = line.text || '';
        this.displayedText = '';
        this.charIndex = 0;
        this.charTimer = 0;
        this.blipTimer = 0;
        this.waitingForInput = false;
    },

    update(dt) {
        if (!this.active) return;

        // Handle choice
        if (this.choiceData) {
            if (Engine.justPressed('ArrowUp') || Engine.justPressed('KeyW')) {
                this.selectedChoice = Math.max(0, this.selectedChoice - 1);
            }
            if (Engine.justPressed('ArrowDown') || Engine.justPressed('KeyS')) {
                this.selectedChoice = Math.min(this.choiceData.options.length - 1, this.selectedChoice + 1);
            }
            // Mouse selection
            const boxY = Engine.H - 50;
            if (Engine.mouseClicked) {
                for (let i = 0; i < this.choiceData.options.length; i++) {
                    const cy = boxY + 8 + i * 14;
                    if (Engine.mouseY >= cy - 4 && Engine.mouseY < cy + 10) {
                        this.selectedChoice = i;
                        const choice = this.choiceData.options[this.selectedChoice];
                        if (this.onComplete) this.onComplete(choice);
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

        // Typing effect
        if (this.charIndex < this.fullText.length) {
            this.charTimer += dt;
            while (this.charTimer >= this.charSpeed && this.charIndex < this.fullText.length) {
                this.charTimer -= this.charSpeed;
                this.charIndex++;
                this.displayedText = this.fullText.substring(0, this.charIndex);

                // Play blip
                this.blipTimer += this.charSpeed;
                if (this.blipTimer >= 0.06 && this.fullText[this.charIndex - 1] !== ' ') {
                    Audio.playBlip(this.speaker);
                    this.blipTimer = 0;
                }
            }

            // Click/space to skip typing
            if (Engine.anyInteract()) {
                this.displayedText = this.fullText;
                this.charIndex = this.fullText.length;
            }
        } else if (!this.waitingForInput) {
            this.waitingForInput = true;
        } else if (Engine.anyInteract()) {
            // Advance to next line
            this.currentIndex++;
            if (this.currentIndex >= this.queue.length) {
                this.active = false;
                if (this.onComplete) this.onComplete();
            } else {
                this.showLine(this.queue[this.currentIndex]);
            }
        }
    },

    render(ctx) {
        if (!this.active) return;

        // Handle choice rendering
        if (this.choiceData) {
            const boxH = 10 + this.choiceData.options.length * 14;
            const boxY = Engine.H - boxH - 8;

            // Box background
            ctx.fillStyle = 'rgba(10, 10, 20, 0.92)';
            ctx.fillRect(8, boxY, Engine.W - 16, boxH);
            ctx.strokeStyle = '#d4c9a8';
            ctx.lineWidth = 1;
            ctx.strokeRect(8.5, boxY + 0.5, Engine.W - 17, boxH - 1);

            // Options
            ctx.font = '8px monospace';
            for (let i = 0; i < this.choiceData.options.length; i++) {
                const cy = boxY + 10 + i * 14;
                if (i === this.selectedChoice) {
                    ctx.fillStyle = '#ffd700';
                    ctx.fillText('▸ ' + this.choiceData.options[i].text, 16, cy);
                } else {
                    ctx.fillStyle = '#a0a0b0';
                    ctx.fillText('  ' + this.choiceData.options[i].text, 16, cy);
                }
            }
            return;
        }

        // Dialogue box
        const boxH = 44;
        const boxY = Engine.H - boxH - 4;
        const portraitSize = 36;
        const hasPortrait = this.portrait && this.portrait.length > 0;
        const textX = hasPortrait ? 52 : 14;
        const textW = hasPortrait ? Engine.W - 64 : Engine.W - 28;

        // Box background
        ctx.fillStyle = 'rgba(10, 10, 20, 0.92)';
        ctx.fillRect(4, boxY, Engine.W - 8, boxH);
        ctx.strokeStyle = '#d4c9a8';
        ctx.lineWidth = 1;
        ctx.strokeRect(4.5, boxY + 0.5, Engine.W - 9, boxH - 1);

        // Portrait — prefer high-quality loaded art, fall back to procedural
        if (hasPortrait) {
            const artPrt = (typeof Assets !== 'undefined') ? Assets.getPortrait(this.portrait) : null;
            if (artPrt) {
                // Frame the portrait
                ctx.fillStyle = '#1a1410';
                ctx.fillRect(7, boxY + 3, portraitSize + 2, portraitSize + 2);
                ctx.imageSmoothingEnabled = true;
                ctx.drawImage(artPrt, 8, boxY + 4, portraitSize, portraitSize);
                ctx.imageSmoothingEnabled = false;
                ctx.strokeStyle = '#d4c9a8';
                ctx.lineWidth = 1;
                ctx.strokeRect(7.5, boxY + 3.5, portraitSize + 1, portraitSize + 1);
            } else {
                const prt = Sprites.getPortrait(this.portrait);
                if (prt) {
                    ctx.drawImage(prt, 8, boxY + 4, portraitSize, portraitSize);
                }
            }
        }

        // Speaker name
        if (this.speaker) {
            ctx.fillStyle = '#ffd700';
            ctx.font = '7px monospace';
            ctx.fillText(this.speaker, textX, boxY + 10);
        }

        // Text
        ctx.fillStyle = '#e8e0d0';
        ctx.font = '7px monospace';
        const textY = this.speaker ? boxY + 20 : boxY + 12;
        Engine.drawText(ctx, this.displayedText, textX, textY, textW, '#e8e0d0', 7, 9);

        // Continue indicator
        if (this.waitingForInput) {
            const blink = Math.sin(Engine.frameCount * 0.1) > 0;
            if (blink) {
                ctx.fillStyle = '#ffd700';
                ctx.fillText('▼', Engine.W - 16, boxY + boxH - 6);
            }
        }
    },
};
