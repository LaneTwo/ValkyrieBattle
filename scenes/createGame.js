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
        this.createdGame.init();
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
    },
    
    create: function() {
        var SELF = this;

        this.add.text(250, 5, 'Mine Planes', { font: '16px Courier', fill: '#ffffff' });
        this.add.text(700, 5, 'Enemy Planes', { font: '16px Courier', fill: '#ffffff' });

        this.timerText = this.add.text(5, 30, '倒计时: 15', { font: '16px Courier', fill: '#ffffff' });

        var mineGrid = drawGrid(400, 400, this.add.graphics({x: 100, y: 30}));
        var enemyGrid = drawGrid(400, 400, this.add.graphics({x: 550, y: 30}));

        //  A drop zone
        var zone = this.add.zone(290, 205, 400, 400).setDropZone();
        zone.input.dropZone = true;

        this.planes = [];
        this.planes.push(new PlaneSprite(this, 50, 70).setInteractive());
        this.planes.push(new PlaneSprite(this, 50, 70).setInteractive());
        this.planes.push(new PlaneSprite(this, 50, 70).setInteractive());

        if(SELF.matchGame){
            SELF.matchGameBtn = this.util.addButton('btnMatchGamge', 300, 500, function(event, scope){ 
                //scope.scene.start('createGame');
                console.log('match game');
                SELF.matchGameBtn.destroy();
                // SELF.matchTimer = SELF.time.addEvent(
                //     { 
                //         delay: 5000,
                //         loop:true, 
                //         callback: function(){
                //             SELF.wallet.getGame(SELF.matchGameId, gameDetail =>{
                //                 console.log(gameDetail);
                //             })
                //         }, 
                //         callbackScope: SELF
                //     });
                
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
                        // SELF.matchTimer = SELF.time.addEvent(
                        //     { 
                        //         delay: 5000,
                        //         loop:true, 
                        //         callback: function(){
                        //             SELF.wallet.getGame(SELF.createdGameId, gameDetail =>{
                        //                 console.log(gameDetail);
                        //             })
                        //         }, 
                        //         callbackScope: SELF
                        //     });
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

        this.updateGame();

        this.input.setDraggable(this.planes[0]);
        this.input.setDraggable(this.planes[1]);
        this.input.setDraggable(this.planes[2]);

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            
            gameObject.x = dragX;
            gameObject.y = dragY;
            gameObject.isDragging = true;
            
            SELF.selectedPlane = gameObject;
        });

        this.input.on('dragend', function (pointer, gameObject, dropped) {
    
            if (!dropped) {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
            console.log(gameObject.x + "," + gameObject.y);
            gameObject.updateGridPosition(gameObject.x - 100, gameObject.y - 30);

            // if(!SELF.createdGame.addPlane(gameObject.plane)){
            //     gameObject.x = gameObject.input.dragStartX;
            //     gameObject.y = gameObject.input.dragStartY;
            //     gameObject.plane.point.x = -1;
            //     gameObject.plane.point.y = -1;
            // }
            SELF.updateGame();
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
                        // if(SELF.gameState !== "WaitingForAccept"){
                        //     SELF.gameState = game.state;
                        //     if(!SELF.matchGame){
                        //         SELF.waitingForMatch(game);
                        //     }
                        // }
                        SELF.gameState = game.state;
                        if(!SELF.matchGame){
                            SELF.waitingForMatch(game);
                        }

                    }else if(game.state === "GameInProgress"){
                        SELF.processOngoingGame(gameId, game);
                        // console.log("Game started");
                        // SELF.gameState = game.state;

                        // if(SELF.gameState === "GameInProgress"){

                        // }else if(SELF.gameState === "UpdatingResult"){
                        //     if(game.state === "GameEnded"){
                        //         console.log("Game end");
                        //         SELF.gameState = "GameEnded";
                        //         SELF.matchTimer.destroy();
                        //         if(SELF.matchGame){
                        //             localStorage.setItem("challengeGameId", "");
                        //             localStorage.setItem("challengeGameLayout", "");
                        //             localStorage.setItem("challengeGameSalt", "");
                        //         }else{
                        //             localStorage.setItem("createdGameId", "");
                        //             localStorage.setItem("createdGameLayout", "");
                        //             localStorage.setItem("createdGameSalt", "");
                        //         }

                        //         //TODO: ask user whether to return to home page
                        //     }
                        // }

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
                    }
                })
            }, 
            callbackScope: SELF
        });
    },

    processOngoingGame(gameId, game){
        var SELF = this;
        if(SELF.gameState !== "GameInProgress" && SELF.gameState !== "UpdatingResult"){
            console.log("Game started");
            SELF.gameState = game.state;
            
            //TODO: notify user to move

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
        }else{
            // Update timeout game result
            var currentTime = Math.floor(Date.now() / 1000); 
            if(currentTime > (game.lastMoveTimestamp + ACTION_EXPIRE_TIMEOUT)){                
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
        var currentTime = Math.floor(Date.now() / 1000); 
        if((game.attemptToMatchTimestamp + ACTION_EXPIRE_TIMEOUT) > currentTime){

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
    
                    SELF.wallet.acceptGame(SELF.createdGameId); 
                    SELF.monitorGameStateChange();
                    // SELF.time.addEvent(
                    //     { 
                    //         delay: 3000,
                    //         repeat: 1,
                    //         callback: function(){
                                
                    //         },
                    //         callbackScope: SELF
                    //     });
                }, SELF, SELF);
    
                SELF.denyGameBtn = SELF.util.addButton('btnDeny', 400, 500, function(event, scope){ 
                    //scope.scene.start('createGame');
                    console.log('deny game');
                    SELF.acceptGameBtn.destroy();
                    SELF.denyGameBtn.destroy();
                    SELF.acceptGameBtn = null;
                    SELF.denyGameBtn = null;
                    SELF.monitorGameStateChange();
                    // SELF.time.addEvent(
                    //     { 
                    //         delay: 60000,
                    //         repeat: 1,
                    //         callback: function(){
                    //             SELF.monitorGameStateChange();
                    //         },
                    //         callbackScope: SELF
                    //     });
    
                }, SELF, SELF);
            }

        }        
    },
    updateGame: function(){
        this.createdGame.init();
        var originalPlanes = _.cloneDeep(this.createdGame.planes);
        this.createdGame.planes = [];
        this.createdGame.numberOfPlanes = 0;

        if(!(this.createdGame.addPlane(_.cloneDeep(this.planes[0].plane)) && 
            this.createdGame.addPlane(_.cloneDeep(this.planes[1].plane)) && 
            this.createdGame.addPlane(_.cloneDeep(this.planes[2].plane)))){
            this.createdGame.planes = _.cloneDeep(originalPlanes);

            this.planes[0].plane = originalPlanes[0];
            this.planes[1].plane = originalPlanes[1];
            this.planes[2].plane = originalPlanes[2];
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

    },

    onEvent: function () {
        this.timerText.setText('倒计时: ' + this.timedEvent.repeatCount);
    }

});
