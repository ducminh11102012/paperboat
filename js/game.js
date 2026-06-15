// Paper Boats — Main Game Entry Point
(function () {
    Sprites.initAll();

    if (typeof Assets !== 'undefined') {
        Assets.init(() => console.log('Paper Boats: assets loaded'));
    }

    Engine.init();
    Engine.setScene(TitleScene);

    // hide boot splash once fonts (or a short timeout) are ready
    const hideBoot = () => {
        const b = document.getElementById('boot');
        if (b) { b.style.opacity = '0'; setTimeout(() => b.remove(), 600); }
    };
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => setTimeout(hideBoot, 150));
    }
    setTimeout(hideBoot, 1800);

    console.log('Paper Boats initialized — Arrows/WASD move, SPACE/Z interact');
})();
