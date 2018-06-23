var SceneHome = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function SceneHome ()
    {
        Phaser.Scene.call(this, { key: 'home' });
        this.util = new Util();
        this.wallet = new WalletWrapper();
    },

    preload: function ()
    {
        //this.load.image('face', 'assets/pics/bw-face.png');
        this.load.image('btnCreateGamge', 'images/createGame.png');
        this.load.image('btnListGamge', 'images/listGame.png');
        this.load.image('btnMatchGamge', 'images/matchGame.png');
        this.load.image('btnLeaderboard', 'images/leaderboard.png');
        this.load.image('btnSetName', 'images/setname.png');
        this.load.image('btnMatch', 'images/match.png');
    },

    create: function ()
    {
        var SELF = this;
        this.util.addButton('btnCreateGamge', 512, 200, function(event, scope){ 
            scope.scene.start('createGame');
        }, this, this);
        this.util.addButton('btnListGamge', 512, 260, function(event, scope){ 
            scope.scene.start('listGame');
        }, this, this);
        this.util.addButton('btnLeaderboard', 512, 320, function(event, scope){ 
            scope.scene.start('leaderboard');
        }, this, this);
        this.util.addButton('btnSetName', 512, 380, function(event, scope){ 
            var playerName = prompt("Please enter your name", "player");
            SELF.wallet.setName(playerName);
        }, this, this);
        
    },
    update: function (time, delta)
    {
        
    }
});