// Paper Boats — Title Screen & Language Select
const TitleScene = {
    phase: 'title', // 'title', 'language'
    selectedLang: 0,
    starTimer: 0,
    stars: [],
    boatY: 0,
    boatTimer: 0,
    titleAlpha: 0,
    waterOffset: 0,

    init() {
        this.phase = 'title';
        this.titleAlpha = 0;
        this.stars = [];
        for (let i = 0; i < 30; i++) {
            this.stars.push({
                x: Math.random() * Engine.W,
                y: Math.random() * Engine.H * 0.5,
                brightness: Math.random(),
                speed: 0.5 + Math.random() * 1.5,
            });
        }
        Audio.init();
    },

    update(dt) {
        this.titleAlpha = Math.min(1, this.titleAlpha + dt * 0.5);
        this.boatTimer += dt;
        this.boatY = Math.sin(this.boatTimer * 1.5) * 2;
        this.waterOffset += dt * 8;

        this.stars.forEach(s => {
            s.brightness = 0.3 + 0.7 * Math.abs(Math.sin(Engine.frameCount * 0.02 * s.speed));
        });

        if (this.phase === 'title') {
            if (Engine.anyInteract()) {
                Audio.resume();
                this.phase = 'language';
                this.selectedLang = 0;
            }
        } else if (this.phase === 'language') {
            if (Engine.justPressed('ArrowUp') || Engine.justPressed('KeyW')) {
                this.selectedLang = 0;
            }
            if (Engine.justPressed('ArrowDown') || Engine.justPressed('KeyS')) {
                this.selectedLang = 1;
            }

            // Mouse selection
            if (Engine.mouseClicked) {
                if (Engine.mouseY >= 95 && Engine.mouseY < 109) {
                    this.selectedLang = 0;
                    this.selectLanguage();
                } else if (Engine.mouseY >= 109 && Engine.mouseY < 123) {
                    this.selectedLang = 1;
                    this.selectLanguage();
                }
            }

            if (Engine.justPressed('Space') || Engine.justPressed('Enter')) {
                this.selectLanguage();
            }
        }
    },

    selectLanguage() {
        Engine.locale = this.selectedLang === 0 ? 'vi' : 'en';
        Audio.playMusic('village_day');
        Engine.fadeToScene(Chapter1Scene);
    },

    render(ctx) {
        const bgArt = (typeof Assets !== 'undefined') ? Assets.get('bg_title') : null;
        if (bgArt) {
            // High-quality painted background
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(bgArt, 0, 0, Engine.W, Engine.H);
            ctx.imageSmoothingEnabled = false;
            // Subtle twinkling stars on top
            this.stars.forEach(s => {
                if (s.y < Engine.H * 0.45) {
                    ctx.fillStyle = `rgba(255, 255, 230, ${s.brightness * 0.5 * this.titleAlpha})`;
                    ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
                }
            });
            // Darken slightly for text legibility
            ctx.fillStyle = 'rgba(8, 8, 24, 0.15)';
            ctx.fillRect(0, 0, Engine.W, Engine.H);
            ctx.fillStyle = 'rgba(8, 8, 24, 0.35)';
            ctx.fillRect(0, 20, Engine.W, 48);
        } else {
        // Night sky gradient (procedural fallback)
        const grad = ctx.createLinearGradient(0, 0, 0, Engine.H);
        grad.addColorStop(0, '#0a0a20');
        grad.addColorStop(0.4, '#1a1a3a');
        grad.addColorStop(0.6, '#2a2a4a');
        grad.addColorStop(1, '#1a2040');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, Engine.W, Engine.H);

        // Stars
        this.stars.forEach(s => {
            ctx.fillStyle = `rgba(255, 255, 220, ${s.brightness * this.titleAlpha})`;
            ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
        });

        // Water
        const waterY = Engine.H * 0.6;
        ctx.fillStyle = '#1a2a40';
        ctx.fillRect(0, waterY, Engine.W, Engine.H - waterY);

        // Water ripples
        for (let x = 0; x < Engine.W; x += 8) {
            const ripple = Math.sin((x + this.waterOffset) * 0.1) * 1;
            ctx.fillStyle = 'rgba(60, 100, 140, 0.3)';
            ctx.fillRect(x, waterY + ripple, 6, 1);
        }

        // Paper boat
        const boatX = Engine.W / 2 - 8;
        const boatBaseY = waterY - 4 + this.boatY;
        ctx.fillStyle = '#e8e0d0';
        // Hull
        ctx.beginPath();
        ctx.moveTo(boatX, boatBaseY + 4);
        ctx.lineTo(boatX + 4, boatBaseY + 8);
        ctx.lineTo(boatX + 12, boatBaseY + 8);
        ctx.lineTo(boatX + 16, boatBaseY + 4);
        ctx.lineTo(boatX + 14, boatBaseY + 6);
        ctx.lineTo(boatX + 2, boatBaseY + 6);
        ctx.closePath();
        ctx.fill();
        // Sail
        ctx.beginPath();
        ctx.moveTo(boatX + 8, boatBaseY);
        ctx.lineTo(boatX + 8, boatBaseY + 5);
        ctx.lineTo(boatX + 13, boatBaseY + 3);
        ctx.closePath();
        ctx.fill();
        }

        // Title
        ctx.globalAlpha = this.titleAlpha;
        ctx.fillStyle = '#e8d8c0';
        ctx.font = 'bold 16px monospace';
        const titleText = 'Paper Boats';
        const tw = ctx.measureText(titleText).width;
        ctx.fillText(titleText, Math.floor((Engine.W - tw) / 2), 40);

        // Subtitle
        ctx.fillStyle = '#a0a0b0';
        ctx.font = '8px monospace';
        const subText = 'Thuyền Giấy';
        const sw = ctx.measureText(subText).width;
        ctx.fillText(subText, Math.floor((Engine.W - sw) / 2), 54);

        if (this.phase === 'title') {
            // Blink prompt
            if (Math.sin(Engine.frameCount * 0.06) > 0) {
                ctx.fillStyle = '#a0a0b0';
                ctx.font = '7px monospace';
                const pt = Engine.t('press_space');
                const pw = ctx.measureText(pt).width;
                ctx.fillText(pt, Math.floor((Engine.W - pw) / 2), Engine.H - 20);
            }
        } else if (this.phase === 'language') {
            // Language selection
            ctx.fillStyle = '#a0a0b0';
            ctx.font = '8px monospace';
            const clText = Engine.locale === 'vi' ? 'Chọn ngôn ngữ / Choose language' : 'Choose language / Chọn ngôn ngữ';
            const clW = ctx.measureText(clText).width;
            ctx.fillText(clText, Math.floor((Engine.W - clW) / 2), 85);

            const langs = ['Tiếng Việt', 'English'];
            langs.forEach((lang, i) => {
                const ly = 100 + i * 14;
                if (i === this.selectedLang) {
                    ctx.fillStyle = '#ffd700';
                    ctx.font = '8px monospace';
                    const lt = '▸ ' + lang;
                    const lw = ctx.measureText(lt).width;
                    ctx.fillText(lt, Math.floor((Engine.W - lw) / 2), ly);
                } else {
                    ctx.fillStyle = '#808090';
                    ctx.font = '8px monospace';
                    const lt = '  ' + lang;
                    const lw = ctx.measureText(lt).width;
                    ctx.fillText(lt, Math.floor((Engine.W - lw) / 2), ly);
                }
            });
        }

        ctx.globalAlpha = 1;
    },
};
