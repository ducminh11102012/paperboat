// Paper Boats — Core Engine
const Engine = {
    canvas: null,
    ctx: null,
    W: 320,
    H: 180,
    scale: 3,
    keys: {},
    keysJustPressed: {},
    mouseX: 0,
    mouseY: 0,
    mouseClicked: false,
    mouseDown: false,
    scenes: [],
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
    transitionDir: 'in', // 'in' = fading to black, 'out' = fading from black

    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Keyboard
        window.addEventListener('keydown', e => {
            if (!this.keys[e.code]) this.keysJustPressed[e.code] = true;
            this.keys[e.code] = true;
            e.preventDefault();
        });
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });

        // Mouse/Touch
        this.canvas.addEventListener('click', e => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = Math.floor((e.clientX - rect.left) / (rect.width / this.W));
            this.mouseY = Math.floor((e.clientY - rect.top) / (rect.height / this.H));
            this.mouseClicked = true;
        });
        this.canvas.addEventListener('mousemove', e => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = Math.floor((e.clientX - rect.left) / (rect.width / this.W));
            this.mouseY = Math.floor((e.clientY - rect.top) / (rect.height / this.H));
        });

        // Touch support
        this.canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const t = e.touches[0];
            this.mouseX = Math.floor((t.clientX - rect.left) / (rect.width / this.W));
            this.mouseY = Math.floor((t.clientY - rect.top) / (rect.height / this.H));
            this.mouseClicked = true;
            this.mouseDown = true;
        });
        this.canvas.addEventListener('touchend', e => {
            this.mouseDown = false;
        });

        this.lastTime = performance.now();
        this.loop();
    },

    resize() {
        const maxW = window.innerWidth;
        const maxH = window.innerHeight;
        const ratio = this.W / this.H;
        let w, h;
        if (maxW / maxH > ratio) {
            h = maxH;
            w = h * ratio;
        } else {
            w = maxW;
            h = w / ratio;
        }
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.ctx.imageSmoothingEnabled = false;
    },

    loop() {
        const now = performance.now();
        this.dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;
        this.frameCount++;

        // Update
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(this.dt);
        }

        // Render
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.W, this.H);
        if (this.currentScene && this.currentScene.render) {
            this.currentScene.render(this.ctx);
        }

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
                if (this.transitionAlpha <= 0) {
                    this.transitioning = false;
                }
            }
            this.ctx.fillStyle = `rgba(0,0,0,${this.transitionAlpha})`;
            this.ctx.fillRect(0, 0, this.W, this.H);
        }

        // Clear per-frame input
        this.keysJustPressed = {};
        this.mouseClicked = false;

        requestAnimationFrame(() => this.loop());
    },

    setScene(scene) {
        this.currentScene = scene;
        if (scene.init) scene.init();
    },

    fadeToScene(scene) {
        this.transitioning = true;
        this.transitionDir = 'in';
        this.transitionAlpha = 0;
        this.transitionCallback = () => {
            this.setScene(scene);
        };
    },

    t(key) {
        return STRINGS[this.locale]?.[key] || STRINGS.vi[key] || key;
    },

    getDialogue(key) {
        return DIALOGUES[this.locale]?.[key] || DIALOGUES.vi[key] || [];
    },

    setFlag(key, val = true) {
        this.flags[key] = val;
    },

    getFlag(key) {
        return this.flags[key] || false;
    },

    keepMemory(memId) {
        if (!this.getFlag(memId)) {
            this.setFlag(memId);
            this.memoriesKept++;
        }
    },

    justPressed(code) {
        return this.keysJustPressed[code];
    },

    anyInteract() {
        return this.justPressed('Space') || this.justPressed('Enter') || this.justPressed('KeyZ') || this.mouseClicked;
    },

    // Draw text with word wrap
    drawText(ctx, text, x, y, maxWidth, color = '#fff', size = 8, lineHeight = 10) {
        ctx.fillStyle = color;
        ctx.font = `${size}px monospace`;
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

    drawTextCentered(ctx, text, y, color = '#fff', size = 8) {
        ctx.fillStyle = color;
        ctx.font = `${size}px monospace`;
        const w = ctx.measureText(text).width;
        ctx.fillText(text, Math.floor((this.W - w) / 2), y);
    },
};
