var SceneCreateGame = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:
    function SceneCreateGame ()
    {
        Phaser.Scene.call(this, { key: 'createGame' });
        this.cursors;
        this.selectedPlane;
    },


    preload: function() {
        this.load.image("plane", "images/plane.jpeg");
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

        var plane1 = new Plane(this, 50, 70).setInteractive();
        var plane2 = new Plane(this, 50, 70).setInteractive();
        var plane3 = new Plane(this, 50, 70).setInteractive();

        this.children.add(plane1);
        this.children.add(plane2);
        this.children.add(plane3);

        this.input.setDraggable(plane1);
        this.input.setDraggable(plane2);
        this.input.setDraggable(plane3);

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            
            gameObject.x = dragX;
            gameObject.y = dragY;
            
        });

        this.input.on('dragend', function (pointer, gameObject, dropped) {
    
            if (!dropped) {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }

            this.selectedPlane = gameObject;
            this.cursors = SELF.input.keyboard.createCursorKeys();
        });

        this.input.on('pointerdown', function (pointer) {

            console.log(pointer);

        }, this);


    },

    update: function() {

        if (this.cursors && this.cursors.left.isDown) {
            this.selectedPlane.setAngle(-90);
        } else if (this.cursors && this.cursors.right.isDown) {
            this.selectedPlane.setAngle(90);
        } else if (this.cursors && this.cursors.up.isDown) {
            this.selectedPlane.setAngle(0);
        } else if (this.cursors && this.cursors.down.isDown) {
            this.selectedPlane.setAngle(180);
        }

    }
});