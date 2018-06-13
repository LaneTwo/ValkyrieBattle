var Plane = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function Plane (scene, x, y)
    {
        Phaser.GameObjects.Image.call(this, scene);

        this.setTexture('plane');
        this.setPosition(x, y);
        this.setScale(0.5);
    }

});

var config = {
    type: Phaser.AUTO,
    parent: 'tools',
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
    this.children.add(new Plane(this, 264, 250));
    this.children.add(new Plane(this, 464, 350));
    this.children.add(new Plane(this, 664, 450));
}
