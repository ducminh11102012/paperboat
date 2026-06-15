// Paper Boats — Main Game Entry Point
(function() {
    // Initialize sprites
    Sprites.initAll();

    // Start game
    Engine.init();
    Engine.setScene(TitleScene);

    console.log('Paper Boats initialized');
    console.log('Use arrow keys or WASD to move, SPACE/Enter/Z to interact');
})();
