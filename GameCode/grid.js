function drawGrid(canvasWidth, canvasHeight, graphics) {
    var cols = 10;
        var rows = 10;

        // cell width is the parent width divided by the number of columns
        var cellWidth = canvasWidth / cols;
        // cell height is the parent height divided the number of rows
        var cellHeight = canvasHeight / rows;
        //make an align grid
        grid = {
            cellWidth: cellWidth,
            cellHeight: cellHeight
        }

        graphics.lineStyle(4, 0xff0000, 1.0);
        graphics.beginPath();
        for (var i = 0; i < canvasWidth; i += grid.cellWidth) {
            graphics.moveTo(i, 0);
            graphics.lineTo(i, canvasHeight);
        }
        for (var i = 0; i < canvasHeight; i += grid.cellHeight) {
            graphics.moveTo(0, i);
            graphics.lineTo(canvasWidth, i);
        }
        graphics.closePath();
        graphics.strokePath();
        graphics.fillPath();
}

var configMine = {
    type: Phaser.AUTO,
    width: 300,
    height: 300,
    parent: 'mine',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: {
        preload: preload,
        create: create
    }
};

var gameMine = new Phaser.Game(configMine);

var configEnemy = {
    type: Phaser.AUTO,
    width: 300,
    height: 300,
    parent: 'enemy',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: {
        preload: preload,
        create: create
    }
};

var gameEnemy = new Phaser.Game(configEnemy);

function create () {
    drawGrid(gameMine.canvas.width, gameMine.canvas.height, this.add.graphics({x: 0, y: 0}))
    drawGrid(gameEnemy.canvas.width, gameEnemy.canvas.height, this.add.graphics({x: 0, y: 0}))
}