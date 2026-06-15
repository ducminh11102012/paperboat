// Paper Boats — Core Engine (hi-res crisp rendering)
const Engine = {
    canvas: null,
    ctx: null,
    W: 320,            // virtual world width
    H: 180,            // virtual world height
    renderScale: 3,    // device px per virtual px (set in resize)
    FONT: 'Be Vietnam Pro, system-ui, sans-serif',
    keys: {},
    keysJustPressed: {},
    mouseX: 0,
    mouseY: 0,
    mouseClicked: false,
    mouseDown: false,
    currentScene: null,
    locale: 'vi',
    dt: 0,
    lastTime: 0,
    flags: {},
    memoriesKept: 0,
    frameCount: 0,
    transitioning: false,
    transitionAlpha: 0,
    transitionCallback: null,
    transitionDir: 'in',
    fontsReady: false,

    // HUD / guidance state (read by Hud module)
    objective: null,        // {vi, en}
    objectiveTarget: null,  // {x, y} in world coords (for directional arrow)
    cameraX: 0,
    cameraY: 0,

    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => { this.fontsReady = true; });
        }

        window.addEventListener('keydown', e => {
            if (!this.keys[e.code]) this.keysJustPressed[e.code] = true;
            this.keys[e.code] = true;
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
        });
        window.addEventListener('keyup', e => { this.keys[e.code] = false; });

        const toVirt = (clientX, clientY) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = (clientX - rect.left) / (rect.width / this.W);
            this.mouseY = (clientY - rect.top) / (rect.height / this.H);
        };
        this.canvas.addEventListener('click', e => { toVirt(e.clientX, e.clientY); this.mouseClicked = true; });
        this.canvas.addEventListener('mousemove', e => { toVirt(e.clientX, e.clientY); });
        this.canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            const t = e.touches[0]; toVirt(t.clientX, t.clientY);
            this.mouseClicked = true; this.mouseDown = true;
        }, { passive: false });
        this.canvas.addEventListener('touchend', () => { this.mouseDown = false; });

        this.lastTime = performance.now();
        this.loop();
    },

    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const maxW = window.innerWidth;
        const maxH = window.innerHeight;
        const ratio = this.W / this.H;
        let cssW, cssH;
        if (maxW / maxH > ratio) { cssH = maxH; cssW = cssH * ratio; }
        else { cssW = maxW; cssH = cssW / ratio; }
        // Native render scale (device pixels per virtual pixel) -> crisp text & vector art
        const scale = (cssH * dpr) / this.H;
        this.renderScale = scale;
        this.canvas.style.width = cssW + 'px';
        this.canvas.style.height = cssH + 'px';
        this.canvas.width = Math.round(this.W * scale);
        this.canvas.height = Math.round(this.H * scale);
        this.ctx.imageSmoothingEnabled = false;
    },

    loop() {
        const now = performance.now();
        this.dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;
        this.frameCount++;

        // Village map overlay intercepts input + freezes the world while open
        if (typeof MapScreen !== 'undefined') MapScreen.handleInput();
        const mapOpen = (typeof MapScreen !== 'undefined') && MapScreen.active;

        if (!mapOpen && this.currentScene && this.currentScene.update) {
            this.currentScene.update(this.dt);
        }

        const ctx = this.ctx;
        ctx.setTransform(this.renderScale, 0, 0, this.renderScale, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, this.W, this.H);

        if (this.currentScene && this.currentScene.render) {
            this.currentScene.render(ctx);
        }

        // Guidance HUD (drawn above world, below dialogue handled per-scene)
        if (typeof Hud !== 'undefined' && this.currentScene && this.currentScene.showHud !== false && !mapOpen) {
            Hud.render(ctx);
            if (typeof MapScreen !== 'undefined') MapScreen.renderButtonHint(ctx);
        }

        // Village map overlay (above everything except transitions)
        if (typeof MapScreen !== 'undefined') MapScreen.render(ctx);

        // Transition overlay
        if (this.transitioning) {
            if (this.transitionDir === 'in') {
                this.transitionAlpha = Math.min(1, this.transitionAlpha + this.dt * 2);
                if (this.transitionAlpha >= 1) {
                    this.transitionDir = 'out';
                    if (this.transitionCallback) this.transitionCallback();
                    this.transitionCallback = null;
                }
            } else {
                this.transitionAlpha = Math.max(0, this.transitionAlpha - this.dt * 2);
                if (this.transitionAlpha <= 0) this.transitioning = false;
            }
            ctx.fillStyle = `rgba(0,0,0,${this.transitionAlpha})`;
            ctx.fillRect(0, 0, this.W, this.H);
        }

        this.keysJustPressed = {};
        this.mouseClicked = false;
        requestAnimationFrame(() => this.loop());
    },

    setScene(scene) {
        this.objective = null;
        this.objectiveTarget = null;
        if (typeof Hud !== 'undefined') Hud.onSceneChange();
        this.currentScene = scene;
        if (scene.init) scene.init();
    },

    fadeToScene(scene) {
        this.transitioning = true;
        this.transitionDir = 'in';
        this.transitionAlpha = 0;
        this.transitionCallback = () => { this.setScene(scene); };
    },

    t(key) { return STRINGS[this.locale]?.[key] || STRINGS.vi[key] || key; },
    getDialogue(key) { return DIALOGUES[this.locale]?.[key] || DIALOGUES.vi[key] || []; },
    setFlag(key, val = true) { this.flags[key] = val; },
    getFlag(key) { return this.flags[key] || false; },
    keepMemory(memId) {
        if (!this.getFlag(memId)) { this.setFlag(memId); this.memoriesKept++; }
    },
    justPressed(code) { return this.keysJustPressed[code]; },
    anyInteract() {
        return this.justPressed('Space') || this.justPressed('Enter') || this.justPressed('KeyZ') || this.mouseClicked;
    },

    // ---- Guidance helpers ----
    setObjective(vi, en, target = null) {
        this.objective = { vi, en };
        this.objectiveTarget = target;
    },
    clearObjective() { this.objective = null; this.objectiveTarget = null; },

    // ---- Text helpers (crisp, Be Vietnam Pro) ----
    font(size, weight = 400) {
        return `${weight} ${size}px ${this.FONT}`;
    },

    drawText(ctx, text, x, y, maxWidth, color = '#fff', size = 9, lineHeight = 12, weight = 400) {
        ctx.fillStyle = color;
        ctx.font = this.font(size, weight);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        const words = text.split(' ');
        let line = '';
        let cy = y;
        for (const word of words) {
            const test = line + word + ' ';
            if (ctx.measureText(test).width > maxWidth && line.length > 0) {
                ctx.fillText(line.trim(), x, cy);
                line = word + ' ';
                cy += lineHeight;
            } else {
                line = test;
            }
        }
        if (line.trim()) ctx.fillText(line.trim(), x, cy);
        return cy + lineHeight;
    },

    drawTextCentered(ctx, text, y, color = '#fff', size = 9, weight = 600) {
        ctx.fillStyle = color;
        ctx.font = this.font(size, weight);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(text, this.W / 2, y);
        ctx.textAlign = 'left';
    },

    // Rounded rect helper
    roundRect(ctx, x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    },
};
