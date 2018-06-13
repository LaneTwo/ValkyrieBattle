var Plane = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function Plane (scene, x, y)
    {
        Phaser.GameObjects.Image.call(this, scene);

        this.setTexture('plane');
        this.setPosition(x, y);
        this.setScale(0.3);
    }

});