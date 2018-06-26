const ACTION_EXPIRE_TIMEOUT = 120;
const GAME_BOARD_OFFSETY = 80;
const GRID_SIZE = 400;
const ACTION_BUTTON_OFFSETY = GAME_BOARD_OFFSETY + GRID_SIZE + 70;

var SceneCreateGame = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:
    function SceneCreateGame ()
    {
        Phaser.Scene.call(this, { key: 'createGame' });
        this.cursors;
        this.selectedPlane;

        this.timerText;
        this.timedEvent;

        this.createdGame = new Game();
        this.enemyGame = new Game();
        this.createdGame.init();
        this.enemyGame.init();
        this.util = new Util();
        this.wallet = new WalletWrapper();
        this.matchGame = false;
        this.matchGameId = -1; 
        this.gameState = "InitPlaneLayout";
        this.playStep = 0;
        this.playerIndex = 0;
        this.attackStateUpdated = false;
        this.timerTick = 0;
    },

    init: function(param){
        if(param.matchGame){
            this.matchGame = true;
            this.matchGameId = param.gameId;
        }else{
            this.matchGame = false;
        }
    },

    preload: function() {
        this.load.image("plane", "images/plane.png");
        this.load.image('btnCreateGamge', 'images/createGame.png');
        this.load.image('btnMatchGamge', 'images/matchGame.png');
        this.load.image('btnAccept', 'images/accept.png');
        this.load.image('btnDeny', 'images/deny.png');
        this.load.image('btnRequestEnd', 'images/requestend.png');
        this.load.image('btnEndGame', 'images/endgame.png');
        this.load.image('btnCancel', 'images/cancel.png');
        this.load.image('enemyplane', 'images/enemyplane.png');
        this.load.image('mask', 'images/mask.png');
        this.load.image('btnMainmenu', 'images/mainmenu.png');
    },
    
    create: function() {
        var SELF = this;

        this.add.text(250, 25, '自己飞机', { font: '16px Courier', fill: '#ffffff' });
        this.add.text(700, 25, '敌人飞机', { font: '16px Courier', fill: '#ffffff' });

        this.timerText = this.add.text(5, GAME_BOARD_OFFSETY, '倒计时: 15', { font: '16px Courier', fill: '#ffffff' });

        var mineGrid = drawGrid(400, 400, this.add.graphics({x: 100, y: GAME_BOARD_OFFSETY}));
        var enemyGrid = drawGrid(400, 400, this.add.graphics({x: 550, y: GAME_BOARD_OFFSETY}));

        SELF.boardMask = this.add.sprite(550 + 200, GAME_BOARD_OFFSETY + 200, 'mask');
        SELF.boardMask.visible = true;

        //  A drop zone
        // var zone = this.add.zone(290, 205, 400, 400).setDropZone();
        // zone.input.dropZone = true;
        var zone = this.add.zone(100, GAME_BOARD_OFFSETY, 1800, 1600).setDropZone();
        zone.input.dropZone = true;
        // var enemyZone = this.add.zone(630, 30, 400, 400).setDropZone();
        // enemyZone.input.dropZone = true;

        this.planes = [];
        this.enemyPlanes = [];
        this.planes.push(new PlaneSprite(this, 50, 70, 'plane').setInteractive());
        this.planes.push(new PlaneSprite(this, 50, 70, 'plane').setInteractive());
        this.planes.push(new PlaneSprite(this, 50, 70, 'plane').setInteractive());

        this.enemyPlanes.push(new PlaneSprite(this, 50, 70, 'enemyplane').setInteractive());
        this.enemyPlanes.push(new PlaneSprite(this, 50, 70, 'enemyplane').setInteractive());
        this.enemyPlanes.push(new PlaneSprite(this, 50, 70, 'enemyplane').setInteractive());
        
        this.enemyPlanes[0].plane.point = {x: 2, y:0};
        this.enemyPlanes[1].plane.point = {x: 7, y:0};
        this.enemyPlanes[2].plane.point = {x: 2, y:9};
        this.enemyPlanes[2].plane.orientation = PlaneOrientation.Bottom;

        this.enemyPlanes[0].visible = false;
        this.enemyPlanes[1].visible = false;
        this.enemyPlanes[2].visible = false;

        if(SELF.matchGame){
            SELF.matchGameBtn = this.util.addButton('btnMatchGamge', 300, ACTION_BUTTON_OFFSETY, function(event, scope){ 
                //scope.scene.start('createGame');
                console.log('match game');
                SELF.matchGameBtn.destroy();
                
                SELF.wallet.matchGame(SELF.matchGameId, SELF.orderPlanes(SELF.createdGame.planes), "1");
                SELF.monitorGameStateChange();
            }, this, this);

            //Initialize plane position
            this.planes[0].plane.point = {x: 2, y:0};
            this.planes[1].plane.point = {x: 7, y:0};
            this.planes[2].plane.point = {x: 2, y:9};
            this.planes[2].plane.orientation = PlaneOrientation.Bottom;


            //this.sys.game.time.events.repeat(Phaser.Timer.SECOND * 5, 10, function(){console.log("timer repeat")}, this);
        }else{
            var previousCreatedGame = SELF.wallet.loadCreatedGame();
            if(previousCreatedGame.gameId < 0){
                SELF.createGameBtn = this.util.addButton('btnCreateGamge', 300, ACTION_BUTTON_OFFSETY, function(event, scope){ 
                    //scope.scene.start('createGame');
                    console.log('create game');
                    SELF.createGameBtn.destroy();
                    
                    SELF.wallet.createNewGame(SELF.orderPlanes(SELF.createdGame.planes), "1", function(gameId){
                        SELF.createdGameId = gameId;
                        SELF.gameState = "WaitingForMatch";
                        SELF.monitorGameStateChange();
                    });
                }, this, this);
    
                //Initialize plane position
                this.planes[0].plane.point = {x: 2, y:0};
                this.planes[1].plane.point = {x: 7, y:0};
                this.planes[2].plane.point = {x: 2, y:9};
                this.planes[2].plane.orientation = PlaneOrientation.Bottom;
            }else{
                this.planes[0].plane = previousCreatedGame.planeLayout[0];
                this.planes[1].plane = previousCreatedGame.planeLayout[1];
                this.planes[2].plane = previousCreatedGame.planeLayout[2];

                SELF.createdGameId = previousCreatedGame.gameId;
                SELF.monitorGameStateChange();

            }
        }

        SELF.timedEvent = SELF.time.addEvent({ delay: 1000, callback: SELF.onEvent, callbackScope: SELF, loop: true });
        this.children.add(this.planes[0]);
        this.children.add(this.planes[1]);
        this.children.add(this.planes[2]);
        this.children.add(this.enemyPlanes[0]);
        this.children.add(this.enemyPlanes[1]);
        this.children.add(this.enemyPlanes[2]);

        this.updateGame(SELF.createdGame, SELF.planes);

        this.input.setDraggable(this.planes[0]);
        this.input.setDraggable(this.planes[1]);
        this.input.setDraggable(this.planes[2]);

        this.input.setDraggable(this.enemyPlanes[0]);
        this.input.setDraggable(this.enemyPlanes[1]);
        this.input.setDraggable(this.enemyPlanes[2]);

        this.updateGame(SELF.enemyGame, SELF.enemyPlanes);

        this.updatePlanDraggable();
        this.util.addButton('btnMainmenu', 80, 30, function(event, scope){ 
            scope.scene.start('home');
        }, this, this);


        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            
            gameObject.x = dragX;
            gameObject.y = dragY;
            gameObject.isDragging = true;
            
            SELF.selectedPlane = gameObject;

            console.log(gameObject);
        });

        this.input.on('dragend', function (pointer, gameObject, dropped) {
    
            if (!dropped) {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
            console.log(gameObject.x + "," + gameObject.y);
            var offsetX = gameObject.isEnemyPlane? 550: 100;
            gameObject.updateGridPosition(gameObject.x - offsetX, gameObject.y - GAME_BOARD_OFFSETY);

            // if(!SELF.createdGame.addPlane(gameObject.plane)){
            //     gameObject.x = gameObject.input.dragStartX;
            //     gameObject.y = gameObject.input.dragStartY;
            //     gameObject.plane.point.x = -1;
            //     gameObject.plane.point.y = -1;
            // }
            if(!SELF.requestingEndGame){
                SELF.updateGame(SELF.createdGame, SELF.planes);
            }else{
                SELF.updateGame(SELF.enemyGame, SELF.enemyPlanes);
                console.log(SELF.enemyGame.planes);
            }
            
            gameObject.isDragging = false;
            SELF.selectedPlane = null;
            SELF.cursors = SELF.input.keyboard.createCursorKeys();
        });

        this.input.on('pointerdown', function (pointer) {

            if(SELF.gameState === "GameInProgress"){
                if(SELF.playStep % 2 === SELF.playerIndex && !SELF.requestingEndGame){
                    var x = pointer.x;
                    var y = pointer.y;
        
                    // add enemy plane status
                    if ((x > 550 && x < 950) && ( y > GAME_BOARD_OFFSETY && y < (400 + GAME_BOARD_OFFSETY))) {
        
                        var xCell = parseInt((x - 550) / 40);
                        var yCell = parseInt((y - GAME_BOARD_OFFSETY) / 40);
                        console.log("x: " + xCell + ", y: " + yCell);
                        var gameId = SELF.matchGame? SELF.matchGameId : SELF.createdGameId;
                        
                        SELF.wallet.attack(gameId, xCell, yCell);
                        SELF.attackStateUpdated = false;
                        //var tx = (xCell * 40) + 565;
                        //var ty = (yCell * 40) + 40;
                        
                    }
                }                
            }

        }, this);

        this.input.keyboard.on('keydown_SPACE', function(event){
            if(SELF.selectedPlane && SELF.selectedPlane.isDragging){
                SELF.selectedPlane.setNextDirection();
            }
        });
    },

    orderPlanes(planes){
        return _.sortBy(planes, function(plane){
            return plane.point.x * 10 + plane.point.y;
        });
    },

    updatePlanDraggable(){
        for(var i = 0; i < this.planes.length; i++){
            this.planes[i].input.draggable = !this.requestingEndGame;
        } 

        for(var i = 0; i < this.enemyPlanes.length; i++){
            this.enemyPlanes[i].input.draggable = this.requestingEndGame;
        } 
    },

    monitorGameStateChange: function(){
        var SELF = this;

        for(var i = 0; i < this.planes.length; i++){
            this.planes[i].input.draggable = false;
        } 

        SELF.matchTimer = this.time.addEvent(
        { 
            delay: 3000,
            loop:true, 
            callback: function(){
                var gameId = SELF.matchGame? SELF.matchGameId : SELF.createdGameId;
                SELF.wallet.getGame(gameId, game =>{
                    if(game.state === "WaitingForMatch"){
                        if(!SELF.notificationText){
                            SELF.notificationText = SELF.add.text(150, GRID_SIZE + GAME_BOARD_OFFSETY + 20, '', { font: '16px Courier', fill: '#ffffff' });
                        }
                        SELF.notificationText.setText('请耐心等待其他玩家应战 :)');
                         
                    }else if(game.state === "WaitingForAccept"){
                        var timerTick = ACTION_EXPIRE_TIMEOUT + game.attemptToMatchTimestamp - InternetStandardTime;
                        if(timerTick <= 0){
                            timerTick = 0;
                        }
                        SELF.timerTick = timerTick;

                        if(SELF.gameState !== "WaitingForConfirm" &&
                            InternetStandardTime < (game.attemptToMatchTimestamp + ACTION_EXPIRE_TIMEOUT)){
                            SELF.gameState = game.state;
                            if(!SELF.matchGame){
                                SELF.waitingForMatch(game);
                            }
                        }
                        SELF.boardMask.visible = true;
                    }else if(game.state === "GameInProgress"){
                        var timerTick = ACTION_EXPIRE_TIMEOUT + game.lastMoveTimestamp - InternetStandardTime;
                        if(timerTick <= 0){
                            timerTick = 0;                            
                        }
                        SELF.timerTick = timerTick;

                        SELF.processOngoingGame(gameId, game);
                    }else if(game.state === "EndGameRequested"){
                        var timerTick = ACTION_EXPIRE_TIMEOUT + game.lastMoveTimestamp - InternetStandardTime;
                        if(timerTick <= 0){
                            timerTick = 0;                            
                        }
                        SELF.timerTick = timerTick;
                        SELF.boardMask.visible = true;
                        if(InternetStandardTime > (game.lastMoveTimestamp + ACTION_EXPIRE_TIMEOUT)){
                            if(SELF.gameState !== "WaitingConfirmForTimeout"){
                                SELF.wallet.updateTimeoutGameResult(game.gameId);
                                SELF.gameState = "WaitingConfirmForTimeout";
                            }                            
                        }else{
                            // TODO: draw enemy's result and ask user whether to accept result or challenge the result 
                            // TODO: get salt from localstorage
                            if(game.currentPlayer !== SELF.playerIndex){
                                if(SELF.gameState !== "WaitingConfirmForEndGame"){
                                    //SELF.gameState = game.state;
    
                                    SELF.gameState = "WaitingConfirmForEndGame";
    
                                    var ownPlaneLayout = SELF.orderPlanes(SELF.createdGame.planes);
    
                                    console.log('---------------------->Final compare');
                                    console.log(game.playerLayout[SELF.playerIndex]);
                                    console.log('<-----------------------');
                                    console.log(JSON.stringify(ownPlaneLayout));
                                    if(_.isEqual(game.playerLayout[SELF.playerIndex], JSON.stringify(ownPlaneLayout))){
                                        SELF.wallet.surrenderGame(game.gameId);
                                    }else{
                                        SELF.wallet.challengeEnemy(game.gameId, ownPlaneLayout, '1');
                                    }                                
                                }
                            }
                        }   
                    }else if(game.state === "GameEnded"){
                        SELF.boardMask.visible = true;
                        console.log("Game end");
                        SELF.gameState = game.state;

                        if(SELF.matchGame){
                            localStorage.setItem("challengeGameId", "");
                            localStorage.setItem("challengeGameLayout", "");
                            localStorage.setItem("challengeGameSalt", "");
                        }else{
                            localStorage.setItem("createdGameId", "");
                            localStorage.setItem("createdGameLayout", "");
                            localStorage.setItem("createdGameSalt", "");
                        }

                        SELF.matchTimer.destroy();

                        // TODO: show victory or loss message
                    }
                })
            }, 
            callbackScope: SELF
        });
    },

    processOngoingGame(gameId, game){
        var SELF = this;
        SELF.playerIndex = SELF.matchGame? 1 : 0;

        if(SELF.acceptGameBtn && SELF.acceptGameBtn.visible){
            SELF.acceptGameBtn.visible = false;
            SELF.denyGameBtn.visible = false;
        }
        if(game.state === "GameInProgress" && SELF.gameState !== "UpdatingResult"){

            if(SELF.gameState !== "GameInProgress" && SELF.gameState !== "UpdatingResult"){
                console.log("Game started");
                SELF.gameState = game.state;
                
                //TODO: notify user to move
            }

            if(!SELF.requestEndGameBtn){
                SELF.requestEndGameBtn = SELF.util.addButton('btnRequestEnd', 300, ACTION_BUTTON_OFFSETY, function(event, scope){ 
                    //scope.scene.start('createGame');
                    console.log('request end game');
                    SELF.requestEndGameBtn.visible = false;
                    //SELF.requestEndGameBtn = null;

                    if(!SELF.endGameBtn){
                        SELF.endGameBtn = SELF.util.addButton('btnEndGame', 220, ACTION_BUTTON_OFFSETY, function(event, scope){ 
                            //scope.scene.start('createGame');
                            console.log('request end game');
                            SELF.endGameBtn.visible = false;
                            SELF.cancelBtn.visible = false;
        
                            console.log('End game');
                            SELF.requestingEndGame = true;
                            SELF.updatePlanDraggable();
                            
                            var enemyPlaneLayout = SELF.enemyGame.planes;
                            console.log("================> enemy layout");
                            console.log(JSON.stringify(SELF.orderPlanes(enemyPlaneLayout)));
                            SELF.wallet.requestEndGame(game.gameId, SELF.orderPlanes(enemyPlaneLayout));
                        }, SELF, SELF);
                    }else{
                        SELF.endGameBtn.visible = true;
                    }

                    if(!SELF.cancelBtn){
                        SELF.cancelBtn = SELF.util.addButton('btnCancel', 420, ACTION_BUTTON_OFFSETY, function(event, scope){ 
                            //scope.scene.start('createGame');
                            console.log('cancel end game');
                            SELF.endGameBtn.visible = false;
                            SELF.cancelBtn.visible = false;
                            SELF.requestEndGameBtn.visible = true;
        
                            console.log('End game');
                            SELF.requestingEndGame = false;
                            SELF.updatePlanDraggable();
        
                        }, SELF, SELF);
                    }else{
                        SELF.cancelBtn.visible = true;
                    }

                    SELF.requestingEndGame = true;
                    SELF.updatePlanDraggable();

                }, SELF, SELF);
            }else{
                SELF.requestEndGameBtn.visible = !SELF.requestingEndGame;
            }

            if(InternetStandardTime > (game.lastMoveTimestamp + ACTION_EXPIRE_TIMEOUT)){                
                if(SELF.gameState !== "UpdatingResult"){
                    SELF.gameState = "UpdatingResult";
                    //SELF.matchTimer.destroy();
                    var gameId = SELF.matchGame? SELF.matchGameId: SELF.createdGameId;
                    SELF.wallet.updateTimeoutGameResult(gameId);
                }
            }

            SELF.boardMask.visible = SELF.playerIndex !== game.currentPlayer;
            if(game.attacks.length > SELF.playStep ){
                // new step, need to update attack result onchain
                SELF.playStep = game.attacks.length;

                var lastAttackStep = game.attacks[game.attacks.length - 1];
                if(lastAttackStep.player == SELF.playerIndex && lastAttackStep.state === -1){
                    var point = {
                        x: game.attacks[game.attacks.length - 1].x,
                        y: game.attacks[game.attacks.length - 1].y
                    }
                    var state = SELF.createdGame.shootAt(point);
                    SELF.wallet.updateAttackResult(gameId, state);
                }
            }else{
                if(game.attacks.length > 0){
                    var lastAttackStep = game.attacks[game.attacks.length - 1];
                    if(!SELF.attackStateUpdated && 
                        lastAttackStep.player === (1 - SELF.playerIndex) &&
                        lastAttackStep.state != -1){
                        SELF.attackStateUpdated = true;
                        
                        var tx = (lastAttackStep.x * 40) + 565;
                        var ty = (lastAttackStep.y * 40) + 10 + GAME_BOARD_OFFSETY;

                        var stateText = 'O';
                        if(lastAttackStep.state === 1){
                            stateText = 'x';
                        }else if(lastAttackStep.state === 2){
                            stateText = 'X';
                        }
                        
                        this.add.text(tx, ty, stateText, { font: '16px Courier', fill: '#ffffff' });                                              
                    }  
                }                              
            }                            
        }else if(game.state === "GameEnded"){
            SELF.matchTimer.destroy();

            //TODO: 
        }else{
            // Update timeout game result
            //var currentTime = Math.floor(Date.now() / 1000); 
            if(InternetStandardTime > (game.lastMoveTimestamp + ACTION_EXPIRE_TIMEOUT)){                
                if(SELF.gameState !== "UpdatingResult"){
                    SELF.gameState = "UpdatingResult";
                    //SELF.matchTimer.destroy();
                    var gameId = SELF.matchGame? SELF.matchGameId: SELF.createdGameId;
                    SELF.wallet.updateTimeoutGameResult(gameId);
                }
            }
        }        
    },
    waitingForMatch: function(game){
        var SELF = this;
        //var currentTime = Math.floor(Date.now() / 1000); 
        if((game.attemptToMatchTimestamp + ACTION_EXPIRE_TIMEOUT) > InternetStandardTime){

            //SELF.matchTimer.destroy();
            if(!SELF.acceptGameBtn){
                var player = SELF.matchGame? game.players[0] : game.players[1];

                if(!SELF.notificationText){
                    SELF.notificationText = SELF.add.text(150, GRID_SIZE + GAME_BOARD_OFFSETY + 20, '', { font: '16px Courier', fill: '#ffffff' });
                }
                SELF.notificationText.setText('是否接受玩家 "' + (player || game.playerAddress[1]) + '" 的挑战？');
                                
                SELF.acceptGameBtn = SELF.util.addButton('btnAccept', 200, ACTION_BUTTON_OFFSETY, function(event, scope){ 
                    //scope.scene.start('createGame');
                    console.log('accept game');

                    SELF.acceptGameBtn.visible = false;
                    SELF.denyGameBtn.visible = false;
                    SELF.notificationText.setText('');
    
                    SELF.gameState = "WaitingForConfirm";
                    SELF.wallet.acceptGame(SELF.createdGameId); 
                    //SELF.monitorGameStateChange();
                }, SELF, SELF);
    
                SELF.denyGameBtn = SELF.util.addButton('btnDeny', 400, ACTION_BUTTON_OFFSETY, function(event, scope){ 
                    //scope.scene.start('createGame');
                    console.log('deny game');
                    SELF.acceptGameBtn.visible = false;
                    SELF.denyGameBtn.visible = false;
                    //SELF.monitorGameStateChange();
    
                }, SELF, SELF);
            }else{
                SELF.acceptGameBtn.visible = true;
                SELF.denyGameBtn.visible = true;
            }

        }        
    },
    updateGame: function(game, planes){
        game.init();
        var originalPlanes = _.cloneDeep(game.planes);
        game.planes = [];
        game.numberOfPlanes = 0;

        if(!(game.addPlane(_.cloneDeep(planes[0].plane)) && 
            game.addPlane(_.cloneDeep(planes[1].plane)) && 
            game.addPlane(_.cloneDeep(planes[2].plane)))){
            game.planes = _.cloneDeep(originalPlanes);

            planes[0].plane = originalPlanes[0];
            planes[1].plane = originalPlanes[1];
            planes[2].plane = originalPlanes[2];
        }
    },
    update: function() {

        var SELF = this;

        if(this.selectedPlane){
            this.selectedPlane.setAngle(this.selectedPlane.getAngle());
        }

        for(var i = 0; i < this.planes.length; i++){
            if(this.planes[i].isDragging){
                continue;
            }
            var pos = this.planes[i].getDrawPosition();
            if(pos.x >= 0 && pos.y >= 0){
                this.planes[i].x = pos.x + 100;
                this.planes[i].y = pos.y + GAME_BOARD_OFFSETY;
            }
            this.planes[i].setAngle(this.planes[i].getAngle());
        }

        if(this.requestingEndGame){
            for(var i = 0; i < this.enemyPlanes.length; i++){
                if(this.enemyPlanes[i].isDragging){
                    continue;
                }
                var pos = this.enemyPlanes[i].getDrawPosition();
                if(pos.x >= 0 && pos.y >= 0){
                    this.enemyPlanes[i].x = pos.x + 550;
                    this.enemyPlanes[i].y = pos.y + GAME_BOARD_OFFSETY;
                }
                this.enemyPlanes[i].setAngle(this.enemyPlanes[i].getAngle());
                this.enemyPlanes[i].visible = true;
            }
        }else{
            for(var i = 0; i < this.enemyPlanes.length; i++){
                this.enemyPlanes[i].visible = false;
            }            
        }


    },

    onEvent: function () {
        this.timerText.setText('倒计时:' + this.timerTick);
    }

});
