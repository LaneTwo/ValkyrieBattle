const ACTION_EXPIRE_TIMEOUT = 120;

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
        this.gameState = "WaitingForMatch";
        this.playStep = 0;
        this.playerIndex = 0;
        this.attackStateUpdated = false;
    },

    init: function(param){
        console.log('------------->');
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
    },
    
    create: function() {
        var SELF = this;

        this.add.text(250, 5, 'Mine Planes', { font: '16px Courier', fill: '#ffffff' });
        this.add.text(700, 5, 'Enemy Planes', { font: '16px Courier', fill: '#ffffff' });

        this.timerText = this.add.text(5, 30, '倒计时: 15', { font: '16px Courier', fill: '#ffffff' });

        var mineGrid = drawGrid(400, 400, this.add.graphics({x: 100, y: 30}));
        var enemyGrid = drawGrid(400, 400, this.add.graphics({x: 550, y: 30}));

        //  A drop zone
        // var zone = this.add.zone(290, 205, 400, 400).setDropZone();
        // zone.input.dropZone = true;
        var zone = this.add.zone(100, 30, 1800, 1600).setDropZone();
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
            SELF.matchGameBtn = this.util.addButton('btnMatchGamge', 300, 500, function(event, scope){ 
                //scope.scene.start('createGame');
                console.log('match game');
                SELF.matchGameBtn.destroy();
                
                SELF.wallet.matchGame(SELF.matchGameId ,SELF.createdGame.planes, "1");
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
                SELF.createGameBtn = this.util.addButton('btnCreateGamge', 300, 500, function(event, scope){ 
                    //scope.scene.start('createGame');
                    console.log('create game');
                    SELF.createGameBtn.destroy();
                    
                    SELF.wallet.createNewGame(SELF.createdGame.planes, "1", function(gameId){
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

        this.updatePlanDraggable();

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
            gameObject.updateGridPosition(gameObject.x - offsetX, gameObject.y - 30);

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
            }
            
            gameObject.isDragging = false;
            SELF.selectedPlane = null;
            SELF.cursors = SELF.input.keyboard.createCursorKeys();
        });

        this.input.on('pointerdown', function (pointer) {

            if(SELF.gameState === "GameInProgress"){
                if(SELF.playStep % 2 === SELF.playerIndex){
                    var x = pointer.x;
                    var y = pointer.y;
        
                    // add enemy plane status
                    if ((x > 550 && x < 950) && ( y > 30 && y < 430)) {
        
                        var xCell = parseInt((x - 550) / 40);
                        var yCell = parseInt((y - 30) / 40);
                        console.log("x: " + xCell + ", y: " + yCell);
                        var gameId = SELF.matchGame? SELF.matchGameId : SELF.createdGameId;
                        
                        SELF.wallet.attack(gameId, xCell, yCell);
                        SELF.attackStateUpdated = false;
                        //var tx = (xCell * 40) + 565;
                        //var ty = (yCell * 40) + 40;
                        
                    }
                }

                SELF.timedEvent = SELF.time.addEvent({ delay: 1000, callback: SELF.onEvent, callbackScope: SELF, repeat: 15 });
            }

        }, this);

        this.input.keyboard.on('keydown_SPACE', function(event){
            if(SELF.selectedPlane && SELF.selectedPlane.isDragging){
                SELF.selectedPlane.setNextDirection();
            }
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

        SELF.matchTimer = this.time.addEvent(
        { 
            delay: 3000,
            loop:true, 
            callback: function(){
                var gameId = SELF.matchGame? SELF.matchGameId : SELF.createdGameId;
                SELF.wallet.getGame(gameId, game =>{
                    if(game.state === "WaitingForAccept"){
                        if(SELF.gameState !== "WaitingForConfirm" &&
                            InternetStandardTime < (game.attemptToMatchTimestamp + ACTION_EXPIRE_TIMEOUT)){
                            SELF.gameState = game.state;
                            if(!SELF.matchGame){
                                SELF.waitingForMatch(game);
                            }
                        }
                    }else if(game.state === "GameInProgress"){
                        SELF.processOngoingGame(gameId, game);
                    }else if(game.state === "EndGameRequested"){
                        // TODO: draw enemy's result and ask user whether to accept result or challenge the result 
                    }else if(game.state === "GameEnded"){
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
        if(game.state === "GameInProgress" && SELF.gameState !== "UpdatingResult"){

            if(SELF.gameState !== "GameInProgress" && SELF.gameState !== "UpdatingResult"){
                console.log("Game started");
                SELF.gameState = game.state;
                
                //TODO: notify user to move
            }

            if(!SELF.requestEndGameBtn){
                SELF.requestEndGameBtn = SELF.util.addButton('btnRequestEnd', 300, 500, function(event, scope){ 
                    //scope.scene.start('createGame');
                    console.log('request end game');
                    SELF.requestEndGameBtn.visible = false;
                    //SELF.requestEndGameBtn = null;

                    if(!SELF.endGameBtn){
                        SELF.endGameBtn = SELF.util.addButton('btnEndGame', 220, 500, function(event, scope){ 
                            //scope.scene.start('createGame');
                            console.log('request end game');
                            SELF.endGameBtn.visible = false;
                            SELF.cancelBtn.visible = false;
        
                            console.log('End game');
                            SELF.requestingEndGame = true;
                            SELF.updatePlanDraggable();
        
                        }, SELF, SELF);
                    }else{
                        SELF.endGameBtn.visible = true;
                    }

                    if(!SELF.cancelBtn){
                        SELF.cancelBtn = SELF.util.addButton('btnCancel', 420, 500, function(event, scope){ 
                            //scope.scene.start('createGame');
                            console.log('cancel end game');
                            SELF.endGameBtn.visible = false;
                            SELF.cancelBtn.visible = false;
        
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

            if(game.attacks.length > SELF.playStep ){
                // new step, need to update attack result onchain
                SELF.playStep = game.attacks.length;

                SELF.playerIndex = SELF.matchGame? 1 : 0;
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
                        var ty = (lastAttackStep.y * 40) + 40;

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

        }        
    },
    waitingForMatch: function(game){
        var SELF = this;
        //var currentTime = Math.floor(Date.now() / 1000); 
        if((game.attemptToMatchTimestamp + ACTION_EXPIRE_TIMEOUT) > InternetStandardTime){

            //SELF.matchTimer.destroy();
            if(!SELF.acceptGameBtn){
                SELF.add.text(200, 450, 'Do you want to accept user ' + game.playerAddress[1] + " challenge?", { font: '16px Courier', fill: '#ffffff' });
                SELF.acceptGameBtn = SELF.util.addButton('btnAccept', 300, 500, function(event, scope){ 
                    //scope.scene.start('createGame');
                    console.log('accept game');
                    SELF.acceptGameBtn.destroy();
                    SELF.denyGameBtn.destroy();
                    SELF.acceptGameBtn = null;
                    SELF.denyGameBtn = null;
    
                    SELF.gameState = "WaitingForConfirm";
                    SELF.wallet.acceptGame(SELF.createdGameId); 
                    //SELF.monitorGameStateChange();
                }, SELF, SELF);
    
                SELF.denyGameBtn = SELF.util.addButton('btnDeny', 400, 500, function(event, scope){ 
                    //scope.scene.start('createGame');
                    console.log('deny game');
                    SELF.acceptGameBtn.destroy();
                    SELF.denyGameBtn.destroy();
                    SELF.acceptGameBtn = null;
                    SELF.denyGameBtn = null;
                    //SELF.monitorGameStateChange();
    
                }, SELF, SELF);
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
                this.planes[i].y = pos.y + 30;
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
                    this.enemyPlanes[i].y = pos.y + 30;
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
        this.timerText.setText('倒计时: ' + this.timedEvent.repeatCount);
    }

});
