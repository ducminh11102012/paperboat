// Paper Boats — Chapter 4A: Sự Thật
const Chapter4AScene = {
    phase: 'title_card',
    timer: 0,
    cinematicZoom: 1,
    cinematicDim: 0,

    init() {
        this.phase = 'title_card';
        this.timer = 0;
        this.cinematicZoom = 1;
        this.cinematicDim = 0;
        Audio.stopMusic();
    },

    update(dt) {
        this.timer += dt;

        switch (this.phase) {
            case 'title_card':
                if (this.timer > 2.5 || Engine.anyInteract()) {
                    this.phase = 'truth';
                    this.timer = 0;
                    this.startTruth();
                }
                break;

            case 'truth':
            case 'truth_cine':
            case 'confront':
                Dialogue.update(dt);
                if (this.phase === 'truth_cine') {
                    this.cinematicZoom = Math.min(1.5, this.cinematicZoom + dt * 0.3);
                    this.cinematicDim = Math.min(0.3, this.cinematicDim + dt * 0.2);
                }
                break;
        }
    },

    startTruth() {
        Dialogue.startRaw(Engine.getDialogue('ch4a_truth'), () => {
            this.phase = 'truth_cine';
            this.cinematicZoom = 1;
            Dialogue.startRaw(Engine.getDialogue('ch4a_truth_cine'), () => {
                this.cinematicZoom = 1;
                this.cinematicDim = 0;
                this.phase = 'confront';
                this.startConfront();
            });
        });
    },

    startConfront() {
        Dialogue.startRaw(Engine.getDialogue('ch4a_confront'), () => {
            Engine.setFlag('ch4a_complete');
            Engine.fadeToScene(Chapter4BScene);
        });
    },

    render(ctx) {
        if (this.phase === 'title_card') {
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, Engine.W, Engine.H);
            ctx.globalAlpha = Math.min(1, this.timer * 0.8);
            Engine.drawTextCentered(ctx, Engine.t('chapter_4a_title'), Engine.H / 2, '#c0a080', 10);
            ctx.globalAlpha = 1;
            return;
        }

        // Indoor scene — grandmother's house
        if (this.phase === 'truth' || this.phase === 'truth_cine') {
            this.renderIndoor(ctx);
        } else {
            // Banyan tree scene for confrontation
            this.renderBanyanTree(ctx);
        }

        // Cinematic overlay
        if (this.cinematicDim > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.cinematicDim})`;
            ctx.fillRect(0, 0, Engine.W, Engine.H);
        }

        Dialogue.render(ctx);
    },

    renderIndoor(ctx) {
        // Warm dim interior
        ctx.fillStyle = '#2a2018';
        ctx.fillRect(0, 0, Engine.W, Engine.H);

        // Floor
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(0, Engine.H * 0.5, Engine.W, Engine.H * 0.5);

        // Wooden floor planks
        for (let x = 0; x < Engine.W; x += 20) {
            ctx.fillStyle = '#4a3a2a';
            ctx.fillRect(x, Engine.H * 0.5, 1, Engine.H * 0.5);
        }

        // Wall detail
        ctx.fillStyle = '#3a3020';
        ctx.fillRect(0, Engine.H * 0.48, Engine.W, 4);

        // Window with dim light
        ctx.fillStyle = '#4a5a6a';
        ctx.fillRect(Engine.W * 0.6, Engine.H * 0.15, 30, 25);
        ctx.fillStyle = '#5a6a7a';
        ctx.fillRect(Engine.W * 0.6 + 2, Engine.H * 0.15 + 2, 26, 21);

        // Oil lamp glow
        const flickerR = 40 + Math.sin(Engine.frameCount * 0.15) * 5;
        ctx.fillStyle = `rgba(200, 150, 60, 0.08)`;
        ctx.beginPath();
        ctx.arc(Engine.W * 0.3, Engine.H * 0.4, flickerR, 0, Math.PI * 2);
        ctx.fill();

        // Lamp
        ctx.fillStyle = '#c8a040';
        ctx.fillRect(Engine.W * 0.3 - 2, Engine.H * 0.38, 4, 6);
        ctx.fillStyle = '#e8c060';
        ctx.fillRect(Engine.W * 0.3 - 1, Engine.H * 0.36, 2, 3);
    },

    renderBanyanTree(ctx) {
        // Evening scene at banyan tree
        const grad = ctx.createLinearGradient(0, 0, 0, Engine.H);
        grad.addColorStop(0, '#2a1a2a');
        grad.addColorStop(0.4, '#3a2030');
        grad.addColorStop(1, '#1a2a1a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, Engine.W, Engine.H);

        // Ground
        ctx.fillStyle = '#2a3a1a';
        ctx.fillRect(0, Engine.H * 0.65, Engine.W, Engine.H * 0.35);

        // Banyan tree silhouette (large, central)
        ctx.fillStyle = '#1a1a10';
        // Trunk
        ctx.fillRect(Engine.W / 2 - 20, Engine.H * 0.3, 40, Engine.H * 0.5);
        // Canopy
        ctx.fillRect(Engine.W / 2 - 60, Engine.H * 0.1, 120, 40);
        ctx.fillRect(Engine.W / 2 - 50, Engine.H * 0.05, 100, 20);
        // Roots
        ctx.fillRect(Engine.W / 2 - 30, Engine.H * 0.7, 10, 20);
        ctx.fillRect(Engine.W / 2 + 20, Engine.H * 0.7, 10, 20);

        // Red cloth strips
        ctx.fillStyle = '#8a3030';
        ctx.fillRect(Engine.W / 2 - 15, Engine.H * 0.2, 1, 8);
        ctx.fillRect(Engine.W / 2 + 10, Engine.H * 0.18, 1, 10);

        // Thu's faint singing visual (floating text-like wisps)
        if (Math.sin(Engine.frameCount * 0.03) > 0.5) {
            ctx.fillStyle = 'rgba(150, 200, 220, 0.15)';
            ctx.fillRect(Engine.W / 2 - 5 + Math.sin(Engine.frameCount * 0.02) * 10, Engine.H * 0.5, 2, 2);
        }
    },
};
