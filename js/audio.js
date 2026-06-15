// Paper Boats — Audio Manager (Web Audio API)
const Audio = {
    ctx: null,
    enabled: false,
    masterVol: 0.3,
    musicGain: null,
    sfxGain: null,
    currentMusic: null,
    musicNodes: [],

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.15;
            this.musicGain.connect(this.ctx.destination);
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = this.masterVol;
            this.sfxGain.connect(this.ctx.destination);
            this.enabled = true;
        } catch (e) {
            console.log('Web Audio not available');
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    // Text blip for dialogue
    playBlip(speaker) {
        if (!this.enabled) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        let freq = 440;
        let type = 'square';
        let dur = 0.04;

        switch (speaker) {
            case 'Thu':
                freq = 520 + Math.random() * 60;
                type = 'sine';
                dur = 0.05;
                // Add slight reverb feel with delay
                break;
            case 'Minh':
                freq = 380 + Math.random() * 40;
                type = 'square';
                break;
            case 'Bà Nội':
            case 'Grandma':
                freq = 280 + Math.random() * 30;
                type = 'triangle';
                dur = 0.05;
                break;
            case 'Ông Tư':
            case 'Old Tu':
                freq = 220 + Math.random() * 20;
                type = 'triangle';
                dur = 0.06;
                break;
            default:
                freq = 350 + Math.random() * 50;
                type = 'sine';
                dur = 0.03;
                break;
        }

        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = 0.08;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.ctx.currentTime + dur);
    },

    // Simple ambient music using oscillators
    playMusic(trackName) {
        if (!this.enabled) return;
        this.stopMusic();
        this.resume();

        const tracks = {
            village_day: { notes: [262, 330, 392, 330, 349, 294, 262, 294], tempo: 0.5, type: 'sine', vol: 0.05 },
            summer_evening: { notes: [294, 349, 330, 262, 294, 330, 392, 349], tempo: 0.6, type: 'sine', vol: 0.04 },
            doubt: { notes: [262, 247, 220, 233, 262, 220, 196, 208], tempo: 0.7, type: 'triangle', vol: 0.04 },
            farewell: { notes: [330, 392, 440, 392, 349, 330, 294, 330], tempo: 0.8, type: 'sine', vol: 0.05 },
            silence: { notes: [], tempo: 1, type: 'sine', vol: 0 },
        };

        const track = tracks[trackName];
        if (!track || track.notes.length === 0) return;

        this.currentMusic = trackName;
        let noteIdx = 0;

        const playNote = () => {
            if (this.currentMusic !== trackName) return;
            if (!this.enabled) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = track.type;
            osc.frequency.value = track.notes[noteIdx % track.notes.length];

            gain.gain.value = track.vol;
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + track.tempo * 0.9);

            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.start();
            osc.stop(this.ctx.currentTime + track.tempo);

            noteIdx++;
            this.musicTimer = setTimeout(playNote, track.tempo * 1000);
        };

        playNote();
    },

    stopMusic() {
        this.currentMusic = null;
        if (this.musicTimer) {
            clearTimeout(this.musicTimer);
            this.musicTimer = null;
        }
    },

    // Water/nature ambient
    playSFX(name) {
        if (!this.enabled) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        switch (name) {
            case 'water':
                osc.type = 'sine';
                osc.frequency.value = 200 + Math.random() * 100;
                gain.gain.value = 0.02;
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.5);
                break;
            case 'firefly_catch':
                osc.type = 'sine';
                osc.frequency.value = 800;
                osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
                gain.gain.value = 0.06;
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.15);
                break;
            case 'page_turn':
                osc.type = 'sawtooth';
                osc.frequency.value = 2000;
                gain.gain.value = 0.02;
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.08);
                break;
        }

        osc.connect(gain);
        gain.connect(this.sfxGain);
    },
};
