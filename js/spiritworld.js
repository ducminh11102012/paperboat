// Paper Boats — Spirit World systems (Upgrade v4)
// Three small global systems that turn the game into "Người Tiễn Đường":
//   SpiritCases   — registry of spirit cases (each a self-contained module)
//   MysteryTracker — counts resolved cases → unlocks layers of the 1994 flood mystery
//   Codex         — folk-belief encyclopedia, filled as the player learns customs
// Kept deliberately small & data-driven so each new Vụ just registers itself.

// ===== Spirit Case registry =====================================================
const SpiritCases = {
    // Definitions are registered by each case scene at load time.
    DEFS: {
        lai_do: {
            name: { vi: 'Ông lái đò', en: 'The Ferryman' },
            motif: { vi: 'Đêm đêm chèo đò qua sông mà chẳng chở ai.', en: 'Rows his boat across the river each night, carrying no one.' },
            bond:  { vi: 'Chờ chở nốt một người cuối mùa lũ 94 — người không bao giờ tới bến.',
                     en: 'Waiting to ferry one last soul from the flood of \u201994 — one who never reached the dock.' },
        },
    },
    resolved: [],   // ids of cases the player has laid to rest

    register(id, def) { if (!this.DEFS[id]) this.DEFS[id] = def; },
    isResolved(id) { return this.resolved.includes(id); },
    resolve(id) {
        if (this.resolved.includes(id)) return;
        this.resolved.push(id);
        if (typeof MysteryTracker !== 'undefined') MysteryTracker.onCaseResolved();
    },
    count() { return this.resolved.length; },
    total() { return Object.keys(this.DEFS).length; },
};

// ===== Mystery of the 1994 flood ================================================
// Revealed in layers, gated by how many spirits the player has laid to rest.
const MysteryTracker = {
    layer: 0,           // 0..4
    LAYERS: {
        1: { vi: 'Lũ 94: làng này chết nhiều bất thường so với mấy làng bên.',
             en: 'Flood \u201994: this village lost far more lives than the ones nearby.' },
        2: { vi: 'Con đê làng có một vết nứt — đã có người báo trước.',
             en: 'The village dyke had a crack — someone had warned them.' },
        3: { vi: 'Đêm đó nước được “nắn” để cứu ruộng làng khác. Lời cảnh báo bị bỏ ngoài tai.',
             en: 'That night the water was \u201csteered\u201d to spare another village\u2019s fields. The warning went unheeded.' },
        4: { vi: 'Cả làng ngoảnh đi khỏi người chết suốt bao năm — vì mặc cảm tội lỗi chung.',
             en: 'For years the village turned away from its dead — out of a shared, buried guilt.' },
    },
    // case count → highest layer unlocked
    gateFor(n) { if (n >= 6) return 4; if (n >= 4) return 3; if (n >= 2) return 2; if (n >= 1) return 1; return 0; },

    onCaseResolved() {
        const n = (typeof SpiritCases !== 'undefined') ? SpiritCases.count() : 0;
        const newLayer = this.gateFor(n);
        if (newLayer > this.layer) {
            this.layer = newLayer;
            if (typeof Notebook !== 'undefined' && Notebook.flash) {
                Notebook.flash(Engine.locale === 'vi' ? '✦ Hé lộ về trận lũ 94' : '\u2726 The flood of \u201994 deepens');
            }
        }
    },
    layerText(i) { const d = this.LAYERS[i]; return d ? (Engine.locale === 'vi' ? d.vi : d.en) : ''; },
};

// ===== Folk-belief Codex ========================================================
const Codex = {
    DEFS: {
        ma_da: { title: { vi: 'Ma da', en: 'Ma da (water wraith)' },
                 body: { vi: 'Hồn người chết đuối, quẩn dưới sông chờ “bắt” người thế mạng để được đầu thai. Dân làng kiêng tắm sông chỗ có người chết trôi.',
                         en: 'The spirit of the drowned, lingering underwater, said to pull others down to take its place so it can be reborn. Villagers avoid bathing where someone drowned.' } },
        co_hon: { title: { vi: 'Cô hồn — Rằm tháng Bảy', en: 'Wandering souls — Ghost Festival' },
                  body: { vi: 'Tháng Bảy âm, cửa âm phủ mở, hồn không nơi nương tựa về dương gian. Người ta cúng cháo, gạo muối, đốt vàng mã để hồn đỡ đói, đỡ tủi.',
                          en: 'In the 7th lunar month the gate of the underworld opens and homeless souls return. People offer rice gruel, salt, and burnt paper money so the spirits are neither hungry nor forgotten.' } },
    },
    entries: [],
    add(id) {
        if (!this.DEFS[id] || this.entries.includes(id)) return;
        this.entries.push(id);
        if (typeof Notebook !== 'undefined' && Notebook.flash) {
            Notebook.flash(Engine.locale === 'vi' ? '+ Ghi vào Codex dân gian' : '+ Added to the Folk Codex');
        }
    },
    has(id) { return this.entries.includes(id); },
};
