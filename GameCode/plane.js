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

var config = {
    type: Phaser.AUTO,
    parent: 'tools',
    width: 100,
    height: 100,
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image("plane", "images/plane.jpeg");
}

function create ()
{
    this.children.add(new Plane(this, 50, 50));
}
