// Paper Boats — Main Game Entry Point
(function() {
    // Initialize procedural sprites (fallback art)
    Sprites.initAll();

    // Begin loading high-quality image assets (async, non-blocking)
    if (typeof Assets !== 'undefined') {
        Assets.init(() => console.log('Paper Boats: art assets loaded'));
    }

    // Start game immediately (assets fade in as they load)
    Engine.init();
    Engine.setScene(TitleScene);

    console.log('Paper Boats initialized');
    console.log('Arrow keys / WASD to move, SPACE / Enter / Z to interact');
})();
