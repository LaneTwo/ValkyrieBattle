var SceneLeaderboard = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function SceneLeaderboard ()
    {
        Phaser.Scene.call(this, { key: 'leaderboard' });

        this.wallet = new WalletWrapper();
        this.util = new Util();
    },

    preload: function ()
    {
        this.load.image('btnMainmenu', 'images/mainmenu.png');
    },
    create: function ()
    {
        this.util.addButton('btnMainmenu', 80, 30, function(event, scope){ 
            scope.scene.start('home');
        }, this, this);

        this.wallet.getLeaderboard(results => {
            if(results.length == 0){
                this.add.text(100, 300, '还没有人玩这个游戏 :(，去创建一个或者挑战别人吧.', { font: '18px Courier', fill: '#ffffff' });
            }else{
                var results = _.orderBy(results, ['win', 'loss'], ['desc', 'asc']);
                var offsetY = 50;
                this.add.text(200, offsetY, '排名', { font: '16px Courier', fill: '#ffffff' });
                this.add.text(250, offsetY, '玩家', { font: '16px Courier', fill: '#ffffff' });
                this.add.text(650, offsetY, '输', { font: '16px Courier', fill: '#ffffff' });
                this.add.text(700, offsetY, '赢', { font: '16px Courier', fill: '#ffffff' });
                for(var i = 0; i < results.length; i++){
                    var result = results[i];                    
                    offsetY = 100 + i * 30;

                    this.add.text(200, offsetY, i + '. ', { font: '16px Courier', fill: '#ffffff' });
                    this.add.text(250, offsetY, result.name, { font: '16px Courier', fill: '#ffffff' });
                    this.add.text(650, offsetY, result.win, { font: '16px Courier', fill: '#ffffff' });
                    this.add.text(700, offsetY, result.loss, { font: '16px Courier', fill: '#ffffff' });

                }
            }
        });
    },
    update: function ()
    {
        
    }
});