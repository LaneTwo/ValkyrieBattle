var SceneCreateGame = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:
    function SceneCreateGame ()
    {
        Phaser.Scene.call(this, { key: 'createGame' });
        this.cursors;
        this.selectedPlane;

        this.graphics;
        this.timerEvent;
        this.clockSize = 30;
        this.createdGame = new Game();
        this.createdGame.init();
        this.util = new Util();
        this.wallet = new WalletWrapper();
        this.matchGame = false;
        this.matchGameId = -1; 
        this.gameState = "WaitingForMatch";
         
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

        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.timerEvent = this.time.addEvent({ delay: 5000, timeScale: 0.5 });

        this.add.text(250, 5, 'Mine Planes', { font: '16px Courier', fill: '#ffffff' });
        this.add.text(700, 5, 'Enemy Planes', { font: '16px Courier', fill: '#ffffff' });

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
                SELF.waitForGameMatch();
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
                        SELF.matchTimer = SELF.time.addEvent(
                            { 
                                delay: 5000,
                                loop:true, 
                                callback: function(){
                                    SELF.wallet.getGame(SELF.createdGameId, gameDetail =>{
                                        console.log(gameDetail);
                                    })
                                }, 
                                callbackScope: SELF
                            });
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
                SELF.waitForGameMatch();

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

            var x = pointer.x;
            var y = pointer.y;

            // add enemy plane status
            if ((x > 550 && x < 950) && ( y > 30 && y < 430)) {

                var mCell = parseInt((x - 550) / 40);
                var nCell = parseInt((y - 30) / 40);
                console.log("m: " + mCell + ", n: " + nCell)
                var tx = (mCell * 40) + 565;
                var ty = (nCell * 40) + 40;
                
                this.add.text(tx, ty, 'x', { font: '16px Courier', fill: '#ffffff' });    
            }

            SELF.graphics.clear();
            SELF.drawClock(50, 50, SELF.timerEvent);

        }, this);

        this.input.keyboard.on('keydown_SPACE', function(event){
            if(SELF.selectedPlane && SELF.selectedPlane.isDragging){
                SELF.selectedPlane.setNextDirection();
            }
        });
    },

    waitForGameMatch: function(){
        var SELF = this;

        SELF.matchTimer = this.time.addEvent(
        { 
            delay: 3000,
            loop:true, 
            callback: function(){
                var gameId = SELF.matchGame? SELF.matchGameId : SELF.createdGameId;
                SELF.wallet.getGame(gameId, game =>{
                    if(game.state === "WaitingForAccept"){
                        if(!SELF.matchGame){
                            var currentTime = Math.floor(Date.now() / 1000); 
                            if((game.attemptToMatchTimestamp + 60) > currentTime){
            
                                SELF.matchTimer.destroy();
            
                                SELF.add.text(200, 450, 'Do you want to accept user ' + game.playerAddress[1] + " challenge?", { font: '16px Courier', fill: '#ffffff' });
                                SELF.acceptGameBtn = SELF.util.addButton('btnAccept', 300, 500, function(event, scope){ 
                                    //scope.scene.start('createGame');
                                    console.log('accept game');
                                    SELF.acceptGameBtn.destroy();
                                    SELF.wallet.acceptGame(SELF.createdGameId); 
                                    SELF.time.addEvent(
                                        { 
                                            delay: 3000,
                                            repeat: 1,
                                            callback: function(){
                                                SELF.waitForGameMatch();
                                            },
                                            callbackScope: SELF
                                        });
                                }, SELF, SELF);
    
                                SELF.denyGameBtn = SELF.util.addButton('btnDeny', 400, 500, function(event, scope){ 
                                    //scope.scene.start('createGame');
                                    console.log('deny game');
                                    SELF.denyGameBtn.destroy();
                                    SELF.time.addEvent(
                                        { 
                                            delay: 60000,
                                            repeat: 1,
                                            callback: function(){
                                                SELF.waitForGameMatch();
                                            },
                                            callbackScope: SELF
                                        });
      
                                }, SELF, SELF);
                            }
                        }
                    }else if(game.state === "GameInProgress"){
                        if(SELF.gameState === "WaitingForMatch" || SELF.gameState === "WaitingForAccept"){
                            console.log("Game started");
                            SELF.gameState = game.state;
                        }

                        if(SELF.gameState === "GameInProgress"){
                            var currentTime = Math.floor(Date.now() / 1000); 
                            if(currentTime > (game.lastMoveTimestamp + 90)){
                                SELF.gameState = "UpdatingResult";
                                //SELF.matchTimer.destroy();
                                var gameId = SELF.matchGame? SELF.matchGameId: SELF.createdGameId;
                                SELF.updateTimeoutGameResult(gameId);
                            }
                        }else if(SELF.gameState === "UpdatingResult"){
                            if(game.state === "GameEnded"){
                                console.log("Game end");
                                SELF.gameState = "GameEnded";

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
                        }

                    }
                })
            }, 
            callbackScope: SELF
        });


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
            // SELF.graphics.clear();
            // SELF.drawClock(50, 50, SELF.timerEvent);

        // if (this.cursors && this.cursors.left.isDown) {
        //     this.selectedPlane.setAngle(-90);
        // } else if (this.cursors && this.cursors.right.isDown) {
        //     this.selectedPlane.setAngle(90);
        // } else if (this.cursors && this.cursors.up.isDown) {
        //     this.selectedPlane.setAngle(0);
        // } else if (this.cursors && this.cursors.down.isDown) {
        //     this.selectedPlane.setAngle(180);
        // }

    },

    drawClock: function(x, y, timer) {
        //  Progress is between 0 and 1, where 0 = the hand pointing up and then rotating clockwise a full 360

        //  The frame
        this.graphics.lineStyle(3, 0xffffff, 1);
        this.graphics.strokeCircle(x, y, this.clockSize);

        var angle;
        var dest;
        var p1;
        var p2;
        var size;

        //  The overall progress hand (only if repeat > 0)
        if (timer.repeat > 0) {
            size = clockSize * 0.9;

            angle = (360 * timer.getOverallProgress()) - 90;
            dest = Phaser.Math.RotateAroundDistance({ x: x, y: y }, x, y, Phaser.Math.DegToRad(angle), size);

            graphics.lineStyle(2, 0xff0000, 1);

            graphics.beginPath();

            graphics.moveTo(x, y);

            p1 = Phaser.Math.RotateAroundDistance({ x: x, y: y }, x, y, Phaser.Math.DegToRad(angle - 5), size * 0.7);

            graphics.lineTo(p1.x, p1.y);
            graphics.lineTo(dest.x, dest.y);

            graphics.moveTo(x, y);

            p2 = Phaser.Math.RotateAroundDistance({ x: x, y: y }, x, y, Phaser.Math.DegToRad(angle + 5), size * 0.7);

            graphics.lineTo(p2.x, p2.y);
            graphics.lineTo(dest.x, dest.y);

            graphics.strokePath();
            graphics.closePath();
        }

        //  The current iteration hand
        size = this.clockSize * 0.95;

        angle = (360 * timer.getProgress()) - 90;
        dest = Phaser.Math.RotateAroundDistance({ x: x, y: y }, x, y, Phaser.Math.DegToRad(angle), size);

        this.graphics.lineStyle(2, 0xffff00, 1);

        this.graphics.beginPath();

        this.graphics.moveTo(x, y);

        p1 = Phaser.Math.RotateAroundDistance({ x: x, y: y }, x, y, Phaser.Math.DegToRad(angle - 5), size * 0.7);

        this.graphics.lineTo(p1.x, p1.y);
        this.graphics.lineTo(dest.x, dest.y);

        this.graphics.moveTo(x, y);

        p2 = Phaser.Math.RotateAroundDistance({ x: x, y: y }, x, y, Phaser.Math.DegToRad(angle + 5), size * 0.7);

        this.graphics.lineTo(p2.x, p2.y);
        this.graphics.lineTo(dest.x, dest.y);

        this.graphics.strokePath();
        this.graphics.closePath();
    }
});
