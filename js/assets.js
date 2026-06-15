// Paper Boats — Image Asset Loader (AI-generated pixel art + downloaded art)
const Assets = {
    images: {},
    loaded: 0,
    total: 0,
    ready: false,

    // Map of logical key -> file path
    manifest: {
        // Portraits (key matches dialogue "portrait" field)
        'portrait_minh': 'assets/art/portrait_minh_sm.png',
        'portrait_thu_normal': 'assets/art/portrait_thu_normal_sm.png',
        'portrait_thu_sad': 'assets/art/portrait_thu_sad_sm.png',
        'portrait_thu_real_smile': 'assets/art/portrait_thu_smile_sm.png',
        'portrait_ba_noi_normal': 'assets/art/portrait_ba_noi_sm.png',
        'portrait_ba_noi_crying': 'assets/art/portrait_ba_noi_crying_sm.png',
        'portrait_ong_tu': 'assets/art/portrait_ong_tu_sm.png',
        // Backgrounds
        'bg_title': 'assets/art/bg_title_sm.png',
        'bg_festival': 'assets/art/bg_festival_sm.png',
    },

    init(onReady) {
        const keys = Object.keys(this.manifest);
        this.total = keys.length;
        this.loaded = 0;
        if (this.total === 0) { this.ready = true; if (onReady) onReady(); return; }

        keys.forEach(key => {
            const img = new Image();
            img.onload = () => {
                this.loaded++;
                if (this.loaded >= this.total) {
                    this.ready = true;
                    if (onReady) onReady();
                }
            };
            img.onerror = () => {
                // Count as loaded even on error so the game still runs (procedural fallback)
                this.loaded++;
                this.images[key] = null;
                if (this.loaded >= this.total) {
                    this.ready = true;
                    if (onReady) onReady();
                }
            };
            img.src = this.manifest[key];
            this.images[key] = img;
        });
    },

    get(key) {
        const img = this.images[key];
        if (img && img.complete && img.naturalWidth > 0) return img;
        return null;
    },

    getPortrait(name) {
        return this.get('portrait_' + name);
    },
};
