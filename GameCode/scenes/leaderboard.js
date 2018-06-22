var SceneLeaderboard = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function SceneLeaderboard ()
    {
        Phaser.Scene.call(this, { key: 'leaderboard' });

        this.wallet = new WalletWrapper();
    },

    preload: function ()
    {
        
    },
    create: function ()
    {
        this.wallet.getLeaderboard(results => {
            if(results.length == 0){
                this.add.text(200, 300, 'There is no games ended, you can create one to play with others.', { font: '32px Courier', fill: '#ffffff' });
            }else{
                var results = _.orderBy(results, ['win', 'loss'], ['desc', 'asc']);
                var offsetY = 50;
                this.add.text(200, offsetY, 'NO.', { font: '16px Courier', fill: '#ffffff' });
                this.add.text(250, offsetY, 'USER', { font: '16px Courier', fill: '#ffffff' });
                this.add.text(650, offsetY, 'WIN', { font: '16px Courier', fill: '#ffffff' });
                this.add.text(700, offsetY, 'LOSS', { font: '16px Courier', fill: '#ffffff' });
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