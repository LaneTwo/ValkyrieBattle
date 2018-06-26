var SceneHelp = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function SceneHelp ()
    {
        Phaser.Scene.call(this, { key: 'help' });
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


        this.add.text(100, 100, '中学时代课堂上的打飞机游戏，利用星云区块链智能合约实现游戏撮合及反作弊功能，快和小伙伴重温一下吧。', { font: '16px Simsun', fill: '#ffffff' });

        var helpText = [
            '游戏规则：',
            '  1.创建游戏，在棋盘上拖动飞机布局，拖动飞机过程中按空格来旋转飞机，然后等待别人来挑战',
            '  2.游戏列表中会列出所有可以进行挑战的游戏，点击挑战后，布局己方飞机，然后申请挑战',
            '  3.被挑战方会看到挑战申请，接受挑战后即可开始游戏，双方轮流点击对方棋盘进行攻击',
            '  4.轮到对方走时对方棋盘变灰不可用，轮到己方走时，对方棋盘变为可用状态，点击棋盘的空位进行攻击，',
            '    对方更新状态后会显示在棋盘上，X：击中飞机头，x：击中飞机，O：未击中飞机',
            '  5.当轮到己方走时，如有确定赢的把握，可申请结束游戏，在敌方棋盘上拖动飞机，确定敌方飞机位置后即可提交',
            '  6.对方收到终局申请后，如果位置无误则自动投降，如果位置错误，则提交飞机布局，由星云链的智能合约裁判',
            '  7.星云链的智能合约会确认双方飞机布局数据及每一步的数据是否准确，并根据最终结果判胜负',
            '  8.如有一方作弊提交错误数据，星云链的智能合约会检测出并自动判作弊方负',
            '  9.游戏开始后玩家必须在2分钟内走每一步，如果一方超时，另一方自动提出超时申请，区块链自动判超时方负',
            '',
            '注意事项：',
            '  *. 由于是纯区块链游戏，每一步都需要上链操作，弹出交易窗口时，请点confirm确认交易',
            '  *. 有时网络拥堵时，确认时间可能会稍长，请耐心等待',
            '  *. 未来会推出改进版，类似状态通道的方式，仅将部分时刻将数据上链，在利用区块链防作弊的前提下改善游戏验'
        ];

        for(var i = 0; i < helpText.length; i++){
            this.add.text(100, 150 + i * 30, helpText[i], { font: '16px Simsun', fill: '#ffffff' });
        }
        
    },
    update: function ()
    {
        
    }
});