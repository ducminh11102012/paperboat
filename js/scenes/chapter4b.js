// Paper Boats — Chapter 4B: Tạm Biệt
const Chapter4BScene = {
    phase: 'title_card',
    timer: 0,
    thuAlpha: 0.88,
    fadeTimer: 0,
    fading: false,
    lanterns: [],
    cinematicZoom: 1,
    cinematicDim: 0,

    init() {
        this.phase = 'title_card';
        this.timer = 0;
        this.thuAlpha = 0.88;
        this.fadeTimer = 0;
        this.fading = false;
        this.cinematicZoom = 1;
        this.cinematicDim = 0;
        this.lanterns = [];
        for (let i = 0; i < 20; i++) {
            this.lanterns.push({
                x: Math.random() * Engine.W,
                y: Engine.H * 0.3 + Math.random() * Engine.H * 0.4,
                color: ['#e84040', '#e8a040', '#e8d040', '#e84080'][Math.floor(Math.random() * 4)],
                size: 3 + Math.random() * 3,
                sway: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random(),
                baseY: 0,
                rising: false,
            });
            this.lanterns[i].baseY = this.lanterns[i].y;
        }
        Audio.playMusic('farewell');
    },

    update(dt) {
        this.timer += dt;

        // Update lanterns
        this.lanterns.forEach(l => {
            l.sway += dt * l.speed;
            l.x += Math.sin(l.sway) * 0.2;
            if (l.rising) {
                l.y -= dt * 8;
                if (l.y < -10) { l.y = Engine.H + 10; l.rising = false; }
            }
        });

        switch (this.phase) {
            case 'title_card':
                if (this.timer > 2.5 || Engine.anyInteract()) {
                    this.phase = 'never_had';
                    this.timer = 0;
                    this.startNeverHad();
                }
                break;

            case 'never_had':
            case 'ask_grandma':
            case 'festival_gate':
            case 'ongtu_sorry':
            case 'farewell':
            case 'thu_fade':
                Dialogue.update(dt);
                if (this.phase === 'farewell' || this.phase === 'thu_fade') {
                    this.cinematicZoom = Math.min(1.6, this.cinematicZoom + dt * 0.15);
                }
                break;
        }

        // Thu fade effect
        if (this.fading) {
            this.fadeTimer += dt;
            if (this.fadeTimer < 2) {
                this.thuAlpha = 0.88 - (0.28 * this.fadeTimer / 2);
            } else if (this.fadeTimer < 5) {
                this.thuAlpha = 0.6 - (0.3 * (this.fadeTimer - 2) / 3);
            } else if (this.fadeTimer < 8) {
                this.thuAlpha = 0.3 - (0.3 * (this.fadeTimer - 5) / 3);
            } else {
                this.thuAlpha = 0;
            }
            // Lanterns rise during fade
            if (this.fadeTimer > 3) {
                this.lanterns.forEach(l => { l.rising = true; });
            }
        }
    },

    startNeverHad() {
        Dialogue.startRaw(Engine.getDialogue('ch4b_never_had'), () => {
            this.phase = 'ask_grandma';
            Dialogue.startRaw(Engine.getDialogue('ch4b_ask_grandma'), () => {
                this.phase = 'festival_gate';
                Dialogue.startRaw(Engine.getDialogue('ch4b_festival_gate'), () => {
                    this.phase = 'ongtu_sorry';
                    Dialogue.startRaw(Engine.getDialogue('ch4b_ongtu_sorry'), () => {
                        this.phase = 'farewell';
                        this.cinematicZoom = 1;
                        Dialogue.startRaw(Engine.getDialogue('ch4b_farewell'), () => {
                            this.phase = 'thu_fade';
                            this.fading = true;
                            this.fadeTimer = 0;
                            // Wait for fade to complete then go to letter
                            setTimeout(() => {
                                Engine.setFlag('ch4b_complete');
                                Engine.fadeToScene(LetterScene);
                            }, 9000);
                        });
                    });
                });
            });
        });
    },

    render(ctx) {
        if (this.phase === 'title_card') {
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, Engine.W, Engine.H);
            ctx.globalAlpha = Math.min(1, this.timer * 0.8);
            Engine.drawTextCentered(ctx, Engine.t('chapter_4b_title'), Engine.H / 2, '#e8c080', 10);
            ctx.globalAlpha = 1;
            return;
        }

        // Apply cinematic zoom
        if (this.cinematicZoom > 1) {
            ctx.save();
            const cx = Engine.W / 2;
            const cy = Engine.H / 2;
            ctx.translate(cx, cy);
            ctx.scale(this.cinematicZoom, this.cinematicZoom);
            ctx.translate(-cx, -cy);
        }

        // Festival night scene
        this.renderFestival(ctx);

        if (this.cinematicZoom > 1) {
            ctx.restore();
        }

        // Vignette during cinematic
        if (this.cinematicDim > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.cinematicDim})`;
            ctx.fillRect(0, 0, Engine.W, Engine.H);
        }

        Dialogue.render(ctx);
    },

    renderFestival(ctx) {
        // Night sky
        const grad = ctx.createLinearGradient(0, 0, 0, Engine.H);
        grad.addColorStop(0, '#0a0818');
        grad.addColorStop(0.3, '#1a1030');
        grad.addColorStop(0.7, '#2a1828');
        grad.addColorStop(1, '#1a2010');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, Engine.W, Engine.H);

        // Stars
        for (let i = 0; i < 25; i++) {
            const sx = (i * 41 + 17) % Engine.W;
            const sy = (i * 29 + 11) % (Engine.H * 0.3);
            const br = 0.3 + 0.4 * Math.abs(Math.sin(Engine.frameCount * 0.015 + i * 0.7));
            ctx.fillStyle = `rgba(255, 255, 230, ${br})`;
            ctx.fillRect(sx, sy, 1, 1);
        }

        // Temple ground
        ctx.fillStyle = '#2a2018';
        ctx.fillRect(0, Engine.H * 0.65, Engine.W, Engine.H * 0.35);

        // Stone floor
        ctx.fillStyle = '#3a3028';
        for (let x = 0; x < Engine.W; x += 16) {
            for (let y = Engine.H * 0.65; y < Engine.H; y += 12) {
                ctx.fillRect(x, y, 15, 11);
            }
        }

        // Temple pillars
        ctx.fillStyle = '#4a2020';
        ctx.fillRect(40, Engine.H * 0.3, 8, Engine.H * 0.4);
        ctx.fillRect(Engine.W - 48, Engine.H * 0.3, 8, Engine.H * 0.4);

        // Temple roof
        ctx.fillStyle = '#3a1818';
        ctx.fillRect(20, Engine.H * 0.25, Engine.W - 40, 12);
        ctx.fillStyle = '#4a2020';
        ctx.fillRect(30, Engine.H * 0.22, Engine.W - 60, 6);

        // Lanterns
        for (const l of this.lanterns) {
            const glow = 0.5 + 0.3 * Math.sin(Engine.frameCount * 0.04 + l.sway);
            // Glow
            ctx.fillStyle = l.color.replace(')', `, ${glow * 0.15})`).replace('rgb', 'rgba');
            ctx.fillRect(l.x - l.size * 2, l.y - l.size * 2, l.size * 4, l.size * 4);
            // Lantern body
            ctx.fillStyle = l.color;
            ctx.globalAlpha = glow;
            ctx.fillRect(Math.floor(l.x - l.size / 2), Math.floor(l.y - l.size / 2), Math.floor(l.size), Math.floor(l.size * 1.3));
            ctx.globalAlpha = 1;
        }

        // Characters in center (if not faded)
        if (this.phase !== 'thu_fade' || this.thuAlpha > 0) {
            // Thu
            ctx.globalAlpha = this.thuAlpha;
            const thuFrame = Sprites.getFrame('thu', 'idle_down', 0);
            if (thuFrame) {
                ctx.drawImage(thuFrame, Engine.W / 2 - 16, Engine.H * 0.55);
            }
            ctx.globalAlpha = 1;
        }

        // Minh
        const minhFrame = Sprites.getFrame('minh', 'idle_down', 0);
        if (minhFrame) {
            ctx.drawImage(minhFrame, Engine.W / 2 + 4, Engine.H * 0.55);
        }

        // During Thu's fade - increasing lantern brightness
        if (this.fading && this.fadeTimer > 2) {
            const brightness = Math.min(0.15, (this.fadeTimer - 2) * 0.025);
            ctx.fillStyle = `rgba(230, 200, 100, ${brightness})`;
            ctx.fillRect(0, 0, Engine.W, Engine.H);
        }

        // After Thu disappears - text "no text, no explanation, only music and lanterns"
        if (this.fading && this.thuAlpha <= 0) {
            // Just lanterns and darkness
            ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.5, (this.fadeTimer - 8) * 0.1)})`;
            ctx.fillRect(0, 0, Engine.W, Engine.H);
        }
    },
};
