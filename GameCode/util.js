Util = function () {
    this.addButton = function (btnImage, xx, yy, f, game, scope) {
        var button = game.add.sprite(xx, yy, btnImage).setInteractive();
        //button.setScale(0.5, 0.5);

        button.inputEnabled = true;
        button.on('pointerdown', (event) =>{
            f(event, scope);
        });
        //button.events.onInputDown.add(f, scope);
        return button;
    }
}