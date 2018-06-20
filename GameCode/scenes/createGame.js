var SceneCreateGame = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:
    function SceneCreateGame ()
    {
        Phaser.Scene.call(this, { key: 'createGame' });
        this.cursors;
        this.selectedPlane;

        this.graphics;

        this.createdGame = new Game();
        this.createdGame.init();
        this.util = new Util();
        this.wallet = new WalletWrapper();
        
    },

    preload: function() {
        this.load.image("plane", "images/plane.png");
        this.load.image('btnCreateGamge', 'images/createGame.png');
    },
    
    create: function() {
        var SELF = this;

        this.graphics = this.add.graphics({ x: 0, y: 0 });

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

        var previousCreatedGame = SELF.wallet.loadCreatedGame();
        if(previousCreatedGame.gameId < 0){
            SELF.createGameBtn = this.util.addButton('btnCreateGamge', 300, 500, function(event, scope){ 
                //scope.scene.start('createGame');
                console.log('create game');
                SELF.createGameBtn.destroy();
                
                SELF.wallet.createNewGame(SELF.createdGame.planes, "1", function(){});
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

            console.log("x: ",pointer.x)
            console.log("y: ",pointer.y)
            var x = pointer.x;
            var y = pointer.y;

            // add enemy plane status
            if ((x > 550 && x < 950) && ( y > 30 && y < 430)) {

                var mCell = parseInt((x - 550) / 40);
                var nCell = parseInt((y - 30) / 40);

                var tx = (mCell * 40) + 565;
                var ty = (nCell * 40) + 40;

                this.add.text(tx, ty, 'x', { font: '16px Courier', fill: '#ffffff' });    
            }


        }, this);

        this.input.keyboard.on('keydown_SPACE', function(event){
            if(SELF.selectedPlane && SELF.selectedPlane.isDragging){
                SELF.selectedPlane.setNextDirection();
            }
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
        graphics.lineStyle(3, 0xffffff, 1);
        graphics.strokeCircle(x, y, clockSize);

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
        size = clockSize * 0.95;

        angle = (360 * timer.getProgress()) - 90;
        dest = Phaser.Math.RotateAroundDistance({ x: x, y: y }, x, y, Phaser.Math.DegToRad(angle), size);

        graphics.lineStyle(2, 0xffff00, 1);

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
});
