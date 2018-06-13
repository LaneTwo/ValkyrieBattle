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

    graphics.lineStyle(4, 0x5a3105, 1.0);
    graphics.beginPath();
    for (var i = 0; i < canvasWidth; i += grid.cellWidth) {
        graphics.moveTo(i, 0);
        graphics.lineTo(i, canvasHeight);
    }
    graphics.moveTo(canvasWidth, 0);
    graphics.lineTo(canvasHeight, canvasHeight);

    for (var i = 0; i < canvasHeight; i += grid.cellHeight) {
        graphics.moveTo(0, i);
        graphics.lineTo(canvasWidth, i);
    }
    graphics.moveTo(0, canvasHeight);
    graphics.lineTo(canvasWidth, canvasWidth);

    graphics.closePath();
    graphics.strokePath();
    graphics.fillPath();
}