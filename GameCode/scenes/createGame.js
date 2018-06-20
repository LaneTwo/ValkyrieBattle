var SceneCreateGame = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:
    function SceneCreateGame ()
    {
        Phaser.Scene.call(this, { key: 'createGame' });
        this.cursors;
        this.selectedPlane;
        this.graphics;
    },

    preload: function() {
        this.load.image("plane", "images/plane.jpeg");
    },
    
    create: function() {
        var SELF = this;

        this.graphics = this.add.graphics({ x: 0, y: 0 });

        this.add.text(250, 105, 'Mine Planes', { font: '16px Courier', fill: '#ffffff' });
        this.add.text(700, 105, 'Enemy Planes', { font: '16px Courier', fill: '#ffffff' });

        var mineGrid = drawGrid(400, 400, this.add.graphics({x: 100, y: 130}));
        var enemyGrid = drawGrid(400, 400, this.add.graphics({x: 550, y: 130}));

        //  A drop zone
        var zone = this.add.zone(290, 305, 400, 400).setDropZone();
        zone.input.dropZone = true;

        var plane1 = new Plane(this, 50, 170).setInteractive();
        var plane2 = new Plane(this, 50, 170).setInteractive();
        var plane3 = new Plane(this, 50, 170).setInteractive();

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

            console.log("x: ",pointer.x)
            console.log("y: ",pointer.y)
            var x = pointer.x;
            var y = pointer.y;

            // add enemy plane status
            if ((x > 550 && x < 950) && ( y > 130 && y < 530)) {

                var mCell = parseInt((x - 550) / 40);
                var nCell = parseInt((y - 50) / 40);

                var tx = (mCell * 40) + 565;
                var ty = (nCell * 40) + 170;

                this.add.text(tx, ty, 'x', { font: '16px Courier', fill: '#ffffff' });    
            }


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
