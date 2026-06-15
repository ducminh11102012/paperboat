// Paper Boats — Title Screen & Language Select
const TitleScene = {
    showHud: false,
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
                if (Engine.mouseY >= 98 && Engine.mouseY < 113) {
                    this.selectedLang = 0;
                    this.selectLanguage();
                } else if (Engine.mouseY >= 113 && Engine.mouseY < 129) {
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
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        // glow
        ctx.save();
        ctx.shadowColor = 'rgba(255,200,120,0.55)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#f3e6cf';
        ctx.font = Engine.font(30, 700);
        ctx.fillText('Paper Boats', Engine.W / 2, 44);
        ctx.restore();
        // subtitle
        ctx.fillStyle = '#e7c98f';
        ctx.font = Engine.font(13, 600);
        ctx.fillText('Thuyền Giấy', Engine.W / 2, 60);

        if (this.phase === 'title') {
            if (Math.sin(Engine.frameCount * 0.06) > -0.2) {
                ctx.fillStyle = 'rgba(245,235,215,0.85)';
                ctx.font = Engine.font(9, 600);
                ctx.fillText(Engine.t('press_space'), Engine.W / 2, Engine.H - 22);
            }
        } else if (this.phase === 'language') {
            ctx.fillStyle = '#d8cdb8';
            ctx.font = Engine.font(9, 600);
            ctx.fillText('Chọn ngôn ngữ · Choose language', Engine.W / 2, 86);
            const langs = ['Tiếng Việt', 'English'];
            langs.forEach((lang, i) => {
                const ly = 98 + i * 16, bw = 120, bx = (Engine.W - bw) / 2;
                const sel = i === this.selectedLang;
                if (sel) {
                    ctx.fillStyle = 'rgba(255,210,90,0.18)';
                    Engine.roundRect(ctx, bx, ly, bw, 14, 5); ctx.fill();
                    ctx.strokeStyle = 'rgba(255,210,90,0.6)'; ctx.lineWidth = 0.7;
                    Engine.roundRect(ctx, bx + 0.3, ly + 0.3, bw - 0.6, 13.4, 5); ctx.stroke();
                }
                ctx.fillStyle = sel ? '#ffe6a8' : '#9a92a4';
                ctx.font = Engine.font(9.5, sel ? 700 : 400);
                ctx.fillText(lang, Engine.W / 2, ly + 10);
            });
        }
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
    },
};
