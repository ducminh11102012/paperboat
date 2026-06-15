# Paper Boats v2 — Major Art & UX Upgrade

## User complaints (Tran Mai Huong)
1. Assets thiếu / xấu — dùng NHIỀU asset online (CC0) nhất có thể
2. Muốn đẹp + đồ sộ như Zelda (env giàu chi tiết, lighting, props)
3. Làng quá nhỏ — mở rộng, nhiều khu vực
4. Nhà xấu — thiết kế lại
5. Thiếu hint/hướng dẫn — objective marker, arrow, tooltip, tutorial
6. Ưu tiên asset ONLINE (CC0) thay vì procedural
7. Game mờ, CHỮ mờ — fix scaling + crisp font

## Build plan
- [ ] Engine: 3-layer compositor (bg hi-res smooth / world pixelated / ui hi-res crisp), devicePixelRatio aware
- [ ] Font: Be Vietnam Pro (full VN diacritics, crisp) — fixes blur
- [ ] HUD module (hi-res): objective banner, directional arrow to goal, interaction prompt + bobbing "!", area-name toast, opening tutorial card
- [ ] Dialogue: render crisp on ui layer, portrait frame, typewriter
- [ ] World art upgrade: richer tiles, prettier houses (roofs/windows), water reflections, trees/lanterns/props, lighting/vignette/bloom overlay
- [ ] Bigger maps + more areas/houses
- [ ] Real CC0 assets: try Kenney/OpenGameArt download → props/decor + Credits screen; fallback AI tileset
- [ ] More AI painted backgrounds for cutscenes/areas
- [ ] Test crisp + hints on live URL, push, verify
