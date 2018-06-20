var SceneCreateGame = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:
    function SceneCreateGame ()
    {
        Phaser.Scene.call(this, { key: 'createGame' });
        this.cursors;
        this.selectedPlane;
        this.createdGame = new Game();
        this.createdGame.init();
    },


    preload: function() {
        this.load.image("plane", "images/plane.png");
    },
    
    create: function() {
        var SELF = this;

        this.add.text(250, 5, 'Mine Planes', { font: '16px Courier', fill: '#ffffff' });
        this.add.text(700, 5, 'Enemy Planes', { font: '16px Courier', fill: '#ffffff' });

        var mineGrid = drawGrid(400, 400, this.add.graphics({x: 100, y: 30}));
        var enemyGrid = drawGrid(400, 400, this.add.graphics({x: 550, y: 30}));

        //  A drop zone
        var zone = this.add.zone(290, 205, 400, 400).setDropZone();
        zone.input.dropZone = true;

        var plane1 = new PlaneSprite(this, 50, 70).setInteractive();
        var plane2 = new PlaneSprite(this, 50, 70).setInteractive();
        var plane3 = new PlaneSprite(this, 50, 70).setInteractive();

        //Initialize plane position
        plane1.plane.point = {x: 2, y:0};
        plane2.plane.point = {x: 7, y:0};
        plane3.plane.point = {x: 2, y:9};
        plane3.plane.orientation = PlaneOrientation.Bottom;

        this.children.add(plane1);
        this.children.add(plane2);
        this.children.add(plane3);
        this.planes = [plane1, plane2, plane3];

        this.updateGame();

        this.input.setDraggable(plane1);
        this.input.setDraggable(plane2);
        this.input.setDraggable(plane3);

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

    }
});