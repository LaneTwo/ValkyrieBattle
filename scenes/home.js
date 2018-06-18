var SceneHome = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function SceneHome ()
    {
        Phaser.Scene.call(this, { key: 'home' });
        this.util = new Util();
    },

    preload: function ()
    {
        //this.load.image('face', 'assets/pics/bw-face.png');
        this.load.image('btnCreateGamge', 'images/createGame.png');
    },

    create: function ()
    {
        this.util.addButton('btnCreateGamge', 512, 400, function(event, scope){ 
            scope.scene.start('createGame');
        }, this, this);
        
    },
    update: function (time, delta)
    {
        
    }
});