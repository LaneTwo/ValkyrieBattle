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
        this.load.image('btnMatch', 'images/matchplayer.png');
        this.load.image('btnCancel', 'images/cancelmygame.png');
        this.load.image('btnMainmenu', 'images/mainmenu.png');
    },
    create: function ()
    {
        var SELF = this;

        this.util.addButton('btnMainmenu', 80, 30, function(event, scope){ 
            scope.scene.start('home');
        }, this, this);
        
        this.wallet.getUnmatchedGame(games =>{
            if(games.length == 0){
                this.add.text(100, 300, '这里空空如也，去创建一个游戏吧.', { font: '16px Courier', fill: '#ffffff' });
            }else{
                this.add.text(200, 70, '玩家', { font: '16px Courier', fill: '#ffffff' });
                this.add.text(600, 70, '创建时间', { font: '16px Courier', fill: '#ffffff' });

                for(var i = 0; i < games.length; i++){
                    var player = games[i].players[0];
                    if(!player){
                        player = games[i].playerAddress[0];
                    }
                    var offsetY = 100 + i * 50;
                    if(games[i].playerAddress[0] !== CurrentUserAddress){
                        this.util.addButton('btnMatch', 140, offsetY, function(event, scope, gameId){ 
                            console.log("To match game:" + gameId);
    
                            scope.scene.start('createGame', {matchGame: true, gameId: gameId});
                        }, this, this, games[i].gameId);
                    }else{
                        SELF.cancelBtn = this.util.addButton('btnCancel', 140, offsetY, function(event, scope, gameId){ 
                            console.log("To cancel game:" + gameId);
                            SELF.cancelBtn.destroy();
                            SELF.cancelBtn = null;
    
                            SELF.wallet.cancelGame(gameId);
                        }, this, this, games[i].gameId);                        
                    }
                    this.add.text(200, offsetY, player, { font: '16px Courier', fill: '#ffffff' });
                    var createDate = new Date(games[i].created * 1000);
                    this.add.text(600, offsetY, createDate.toLocaleString(), { font: '16px Courier', fill: '#ffffff' });

                }
            }

        })

    },
    update: function ()
    {
        
    }
});