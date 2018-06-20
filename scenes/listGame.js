var SceneListGame = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function SceneListGame ()
    {
        Phaser.Scene.call(this, { key: 'listGame' });

        this.wallet = new WalletWrapper();
        this.util = new Util();
    },

    preload: function ()
    {
        this.load.image('btnMatch', 'images/match.png');
    },
    create: function ()
    {
        var SELF = this;

        this.wallet.getUnmatchedGame(games =>{
            if(games.length == 0){
                this.add.text(200, 300, 'There is no games openning for match, you can create one to wait for others.', { font: '32px Courier', fill: '#ffffff' });
            }else{
                for(var i = 0; i < games.length; i++){
                    var player = games[i].players[0];
                    if(!player){
                        player = games[i].playerAddress[0];
                    }
                    var offsetY = 100 + i * 50;
                    this.util.addButton('btnMatch', 150, offsetY, function(event, scope, gameId){ 
                        console.log("To match game:" + gameId);

                        scope.scene.start('createGame', {matchGame: true, gameId: gameId});
                    }, this, this, games[i].gameId);
                    this.add.text(200, offsetY, i + '. ' + player, { font: '16px Courier', fill: '#ffffff' });

                }
            }

        })

    },
    update: function ()
    {
        
    }
});