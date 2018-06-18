var SceneAcceptGame = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function SceneAcceptGame ()
    {
        Phaser.Scene.call(this, { key: 'acceptGame' });
    },

    preload: function ()
    {
        this.load.image('face', 'assets/pics/bw-face.png');
    },

    create: function ()
    {
    },
    update: function ()
    {
        
    }
});