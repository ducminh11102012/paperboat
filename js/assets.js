// Paper Boats — Image Asset Loader (Kenney CC0 tiles + AI painted art)
const Assets = {
    images: {},
    loaded: 0,
    total: 0,
    ready: false,

    manifest: {
        // Tileset atlas (Kenney Tiny Town, CC0)
        'tiles_tiny_town': 'assets/tiles/tiny_town.png',
        // Portraits (key matches dialogue "portrait" field)
        'portrait_minh': 'assets/art/portrait_minh_sm.png',
        'portrait_thu_normal': 'assets/art/portrait_thu_normal_sm.png',
        'portrait_thu_sad': 'assets/art/portrait_thu_sad_sm.png',
        'portrait_thu_real_smile': 'assets/art/portrait_thu_smile_sm.png',
        'portrait_ba_noi_normal': 'assets/art/portrait_ba_noi_sm.png',
        'portrait_ba_noi_crying': 'assets/art/portrait_ba_noi_crying_sm.png',
        'portrait_ong_tu': 'assets/art/portrait_ong_tu_sm.png',
        // Painted backgrounds (AI)
        'bg_title': 'assets/art/bg_title_sm.png',
        'bg_festival': 'assets/art/bg_festival_sm.png',
        'bg_sky_dusk': 'assets/art/bg_sky_dusk_sm.png',
        'bg_night_river': 'assets/art/bg_night_river_sm.png',
        'bg_letter': 'assets/art/bg_letter_sm.png',
        // Village map screen (press M) — hand-painted overview
        'map_village': 'assets/art/village_map.webp',
    },

    init(onReady) {
        const keys = Object.keys(this.manifest);
        this.total = keys.length;
        this.loaded = 0;
        if (this.total === 0) { this.ready = true; if (onReady) onReady(); return; }

        keys.forEach(key => {
            const img = new Image();
            const done = () => {
                this.loaded++;
                if (key === 'tiles_tiny_town' && typeof Tileset !== 'undefined') Tileset.init(img);
                if (this.loaded >= this.total) { this.ready = true; if (onReady) onReady(); }
            };
            img.onload = done;
            img.onerror = () => { this.images[key] = null; done(); };
            img.src = this.manifest[key];
            this.images[key] = img;
        });
    },

    get(key) {
        const img = this.images[key];
        if (img && img.complete && img.naturalWidth > 0) return img;
        return null;
    },

    getPortrait(name) { return this.get('portrait_' + name); },
};
