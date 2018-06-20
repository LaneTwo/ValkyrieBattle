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
        this.load.image('btnListGamge', 'images/listGame.png');
        this.load.image('btnMatchGamge', 'images/matchGame.png');
        this.load.image('btnLeaderboard', 'images/leaderboard.png');
        this.load.image('btnMatch', 'images/match.png');
    },

    create: function ()
    {
        this.util.addButton('btnCreateGamge', 512, 400, function(event, scope){ 
            scope.scene.start('createGame');
        }, this, this);
        this.util.addButton('btnListGamge', 512, 400, function(event, scope){ 
            scope.scene.start('listGame');
        }, this, this);
        this.util.addButton('btnLeaderboard', 512, 400, function(event, scope){ 
            scope.scene.start('leaderboard');
        }, this, this);
        
    },
    update: function (time, delta)
    {
        
    }
});