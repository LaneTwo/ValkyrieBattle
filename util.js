Util = function () {
    this.addButton = function (btnImage, xx, yy, cb, game, scope, param) {
        var button = game.add.sprite(xx, yy, btnImage).setInteractive();
        //button.setScale(0.5, 0.5);

        button.inputEnabled = true;
        button.on('pointerdown', (event) =>{
            cb(event, scope, param);
        });
        //button.events.onInputDown.add(f, scope);
        return button;
    }
}