// Paper Boats — Kenney Tiny Town (CC0) tile atlas helper
const Tileset = {
    atlas: null,
    ready: false,
    T: 16,          // tile size in atlas
    GAP: 1,         // spacing between tiles
    COLS: 12,

    // Named tile indices (from kenney tiny_town atlas)
    NAMED: {
        GRASS: 0, GRASS2: 1, GRASS_FLOWER: 2,
        TREE_PINE: 4, BUSH: 5, TREE_GREEN: 6, TREE_GREEN2: 19,
        TREE_ORANGE: 9, TREE_ORANGE2: 21, MUSHROOM: 29,
        PATH_C: 25, PATH_TL: 12, PATH_T: 13, PATH_TR: 14,
        PATH_L: 24, PATH_R: 26, PATH_BL: 36, PATH_B: 37, PATH_BR: 38,
        SAND: 40,
        ROOF_GREY_L: 48, ROOF_GREY_M: 49, ROOF_GREY_R: 50,
        ROOF_GREY_PEAK: 63,
        ROOF_RED_L: 52, ROOF_RED_M: 53, ROOF_RED_R: 54,
        ROOF_RED_PEAK: 68,
        EAVE_GREY_L: 60, EAVE_GREY_M: 61, EAVE_GREY_R: 62,
        EAVE_RED_L: 64, EAVE_RED_M: 65, EAVE_RED_R: 66,
        WALL: 73, WALL_DOOR: 86, WALL_WINDOW: 87, WALL_DOOR2: 84, WALL_WINDOW2: 85,
        STONE_TOP_L: 96, STONE_TOP_M: 97, STONE_TOP_R: 98,
        STONE_MID: 109, STONE_BASE: 121, STONE_GATE: 112, STONE_DOOR: 125,
        FENCE_H: 58, FENCE_V: 59, FENCE_COR: 56, RAIL: 80,
        PLANK_L: 45, PLANK_R: 46, PLANK_M: 70,
        WELL: 69, SIGN: 83, BARREL: 106, BUCKET: 107, CHEST: 131,
        PERSON: 104,
    },

    init(img) {
        this.atlas = img;
        this.ready = !!(img && img.complete && img.naturalWidth > 0);
    },

    // Draw atlas tile `idx` at virtual (dx,dy) with size `size` (default 16)
    draw(ctx, idx, dx, dy, size = 16) {
        if (!this.atlas) return false;
        if (!(this.atlas.complete && this.atlas.naturalWidth > 0)) return false;
        const col = idx % this.COLS;
        const row = Math.floor(idx / this.COLS);
        const sx = col * (this.T + this.GAP);
        const sy = row * (this.T + this.GAP);
        const prev = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.atlas, sx, sy, this.T, this.T,
            Math.round(dx), Math.round(dy), size, size);
        ctx.imageSmoothingEnabled = prev;
        return true;
    },

    available() {
        return this.atlas && this.atlas.complete && this.atlas.naturalWidth > 0;
    },
};
