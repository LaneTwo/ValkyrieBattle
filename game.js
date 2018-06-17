'use strict';

//地图尺寸
var MAP_ROW = 10;
var MAP_COL = 10;

//机头方向
var PlaneOrientation = {};
PlaneOrientation.Top = 0;
PlaneOrientation.Right = 1;
PlaneOrientation.Bottom = 2;
PlaneOrientation.Left = 3;

//飞机的数量
var MAX_PLAN_NUM = 3;

var Point = function(x,y) {
    this.x = x;
    this.y = y;
}

//飞机
var Plane = function(point, orientation) {
    this.point = point;
    this.orientation = orientation;
};

Plane.prototype = {
    isCrash: function(point) {
        if (this.point.x == point.x && this.point.y == point.y) {
            return true;
        } else {
            return false;
        }
    },
    isShot: function(point) {
        if ( this.orientation == PlaneOrientation.Top ) {
            if (((point.y == this.point.y + 1) && (point.x >= this.point.x - 2 && point.x <= this.point.x + 2 )) ||
            ((point.y == this.point.y + 2) && (point.x == this.point.x)) || ((point.y == this.point.y + 3) && (point.x >= this.point.x - 1 && point.x <= this.point.x + 1))) {
                return true;
            } else {
                return false;
            }
        } else if (this.orientation == PlaneOrientation.Right) {
            if((point.x == this.point.x - 1 ) && (point.y >= this.point.y - 2 && point.y <= this.point.y + 2 ) || (point.x == this.point.x - 2) && (point.y == this.point.y) || (point.x == this.point.x - 3) && (point.y >= this.point.y - 1 && point.y <= this.point.y + 1)){
                return true;
            } else {
                return false;
            }
        } else if (this.orientation == PlaneOrientation.Bottom) {
            if ((point.x >= this.point.x - 2 && point.x <= this.point.x + 2) && (point.y == this.point.y - 1) || (point.x == this.point.x) && (point.y == this.point.y - 2) || (point.x >= this.point.x -1 && point.x <= this.point.x + 1) && (point.y == this.point.y - 3)){
                return true;
            } else {
                return false;
            }
        } else {
            if ((pint.x == this.point.x + 1) && (point.y >= this.point.y - 2 && poing.y <= this.point.y + 2) || (point.x == this.point.x + 2) && (point.y == this.point.y) || (point.x == this.point.x + 3) && (point.y >= this.point.y - 1 && point.y <= this.point.y + 1)) {
                return true;
            } else {
                return false;
            }
        }
    }
};

var Game = function() {
    this.numberOfPlanes = 0;
    this.planes = [];
    this.status = [];
};

Game.prototype = {
    init: function() {
        for(var i=0; i< MAP_ROW; i++) {
            this.status[i] = new Array(MAP_COL);
            for(var j=0; j< MAP_COL; j++) {
                this.status[i][j] = 0;
            }
        }
    },

    addPlane: function(plane) {
        if (this.planes.length == MAX_PLAN_NUM) {
            console.log("飞机数量已达上限，无法继续添加。");
            return false;
        }
        var point = plane.point;
        if (plane.orientation == PlaneOrientation.Top) {
            if (point.x < 0 || point.x >= MAP_COL || point.y < 0 || point.y >= MAP_ROW) {
                console.log("飞机超出边界");
                return false;
            } else if (point.x - 2 < 0 || point.x + 2 >= MAP_COL || point.y + 3 >= MAP_ROW){
                console.log("飞机超出边界");
                return false;
            } else if(this.status[point.x][point.y] == 0 && this.status[point.x - 2][point.y + 1] == 0 && this.status[point.x - 1][point.y + 1] == 0 && this.status[point.x][point.y + 1] == 0 && this.status[point.x + 1][point.y + 1] == 0 && this.status[point.x + 2][point.y + 1] == 0
                && this.status[point.x][point.y + 2] == 0 && this.status[point.x - 1][point.y + 3] == 0 && this.status[point.x][point.y + 3] == 0 && this.status[point.x + 1][point.y + 3] == 0 ) {
                    console.log("添加飞机成功");

                    this.status[point.x][point.y] = 1;
                    this.status[point.x - 2][point.y + 1] = 1;
                    this.status[point.x - 1][point.y + 1] = 1;
                    this.status[point.x][point.y + 1] = 1;
                    this.status[point.x + 1][point.y + 1] = 1;
                    this.status[point.x + 2][point.y + 1] = 1;
                    this.status[point.x][point.y + 2] = 1;
                    this.status[point.x - 1][point.y + 3] = 1;
                    this.status[point.x][point.y + 3] = 1;
                    this.status[point.x + 1][point.y + 3] = 1;

                    this.planes[this.numberOfPlanes] = plane;
                    this.numberOfPlanes += 1;
                    return true;
                } else {
                    console.log("飞机有叠加，无法添加"); 
                    return false;
                }
        } else if (plane.orientation == PlaneOrientation.Right) {
            if (point.x < 0 || point.x >= MAP_COL || point.y < 0 || point.y >= MAP_ROW) {
                console.log("飞机超出边界");
                return false;
            } else if (point.x - 3 < 0 || point.x >= MAP_COL || point.y - 2 < 0 || point.y + 2 >= MAP_ROW){
                console.log("飞机超出边界");
                return false;
            } else if(this.status[point.x][point.y] == 0 && this.status[point.x - 1][point.y - 2] == 0 && this.status[point.x - 1][point.y - 1] == 0 && this.status[point.x - 1][point.y] == 0 && this.status[point.x - 1][point.y + 1] == 0 && this.status[point.x - 1][point.y + 2] == 0
                && this.status[point.x - 2][point.y] == 0 && this.status[point.x - 3][point.y - 1] == 0 && this.status[point.x - 3][point.y] == 0 && this.status[point.x - 3][point.y + 1] == 0 ) {
                    console.log("添加飞机成功");

                    this.status[point.x][point.y] = 1;
                    this.status[point.x - 1][point.y - 2] = 1;
                    this.status[point.x - 1][point.y - 1] = 1;
                    this.status[point.x - 1][point.y] = 1;
                    this.status[point.x - 1][point.y + 1] = 1;
                    this.status[point.x - 1][point.y + 2] = 1;
                    this.status[point.x - 2][point.y] = 1;
                    this.status[point.x - 3][point.y - 1] = 1;
                    this.status[point.x - 3][point.y] = 1;
                    this.status[point.x - 3][point.y + 1] = 1;

                    this.planes[this.numberOfPlanes] = plane;
                    this.numberOfPlanes += 1;
                    return true;
                } else {
                    console.log("飞机有叠加，无法添加"); 
                    return false;
                }
        } else if (plane.orientation == PlaneOrientation.Bottom) {
            if (point.x < 0 || point.x >= MAP_COL || point.y < 0 || point.y >= MAP_ROW) {
                console.log("飞机超出边界");
                return false;
            } else if (point.x - 2 < 0 || point.x + 2 >= MAP_COL || point.y - 3 < 0){
                console.log("飞机超出边界");
                return false;
            } else if(this.status[point.x][point.y] == 0 && this.status[point.x - 2][point.y - 1] == 0 && this.status[point.x - 1][point.y - 1] == 0 && this.status[point.x][point.y - 1] == 0 && this.status[point.x + 1][point.y - 1] == 0 && this.status[point.x + 2][point.y - 1] == 0
                && this.status[point.x][point.y - 2] == 0 && this.status[point.x - 1][point.y - 3] == 0 && this.status[point.x][point.y - 3] == 0 && this.status[point.x + 1][point.y - 3] == 0 ) {
                    console.log("添加飞机成功");

                    this.status[point.x][point.y] = 1;
                    this.status[point.x - 2][point.y - 1] = 1;
                    this.status[point.x - 1][point.y - 1] = 1;
                    this.status[point.x][point.y - 1] = 1;
                    this.status[point.x + 1][point.y - 1] = 1;
                    this.status[point.x + 2][point.y - 1] = 1;
                    this.status[point.x][point.y - 2] = 1;
                    this.status[point.x - 1][point.y - 3] = 1;
                    this.status[point.x][point.y - 3] = 1;
                    this.status[point.x + 1][point.y - 3] = 1;

                    this.planes[this.numberOfPlanes] = plane;
                    this.numberOfPlanes += 1;
                    return true;
                } else {
                    console.log("飞机有叠加，无法添加"); 
                    return false;
                }
        } else {
            if (point.x < 0 || point.x >= MAP_COL || point.y < 0 || point.y >= MAP_ROW) {
                console.log("飞机超出边界");
                return false;
            } else if (point.x + 3 >= MAP_COL || point.y - 2 < 0 || point.y + 2 >= MAP_ROW){
                console.log("飞机超出边界");
                return false;
            } else if(this.status[point.x][point.y] == 0 && this.status[point.x + 1][point.y - 2] == 0 && this.status[point.x + 1][point.y - 1] == 0 && this.status[point.x + 1][point.y] == 0 && this.status[point.x + 1][point.y + 1] == 0 && this.status[point.x + 1][point.y + 2] == 0
                && this.status[point.x + 2][point.y] == 0 && this.status[point.x + 3][point.y - 1] == 0 && this.status[point.x + 3][point.y] == 0 && this.status[point.x + 3][point.y + 1] == 0 ) {
                    console.log("添加飞机成功");

                    this.status[point.x][point.y] = 1;
                    this.status[point.x + 1][point.y - 2] = 1;
                    this.status[point.x + 1][point.y - 1] = 1;
                    this.status[point.x + 1][point.y] = 1;
                    this.status[point.x + 1][point.y + 1] = 1;
                    this.status[point.x + 1][point.y + 2] = 1;
                    this.status[point.x + 2][point.y] = 1;
                    this.status[point.x + 3][point.y - 1] = 1;
                    this.status[point.x + 3][point.y] = 1;
                    this.status[point.x + 3][point.y + 1] = 1;

                    this.planes[this.numberOfPlanes] = plane;
                    this.numberOfPlanes += 1;
                    return true;
                } else {
                    console.log("飞机有叠加，无法添加"); 
                    return false;
                }
        }
    }, 
    
    shootAt: function(point) {
        if (point.x < 0 || point.x >= MAP_COL || point.y < 0  || point.y >= MAP_ROW) {
            console.log("涉及超出范围.");
            return;
        }
        
        for(var i=0;i<this.planes.length;i++) {
            if (this.planes[i].isCrash(point)) {
                console.log("飞机被击毁.");
                if (this.planes[i].orientation == PlaneOrientation.Top) {
                    this.status[point.x][point.y] = 0;
                    this.status[point.x - 2][point.y + 1] = 0;
                    this.status[point.x - 1][point.y + 1] = 0;
                    this.status[point.x][point.y + 1] = 0;
                    this.status[point.x + 1][point.y + 1] = 0;
                    this.status[point.x + 2][point.y + 1] = 0;
                    this.status[point.x][point.y + 2] = 0;
                    this.status[point.x - 1][point.y + 3] = 0;
                    this.status[point.x][point.y + 3] = 0;
                    this.status[point.x + 1][point.y + 3] = 0;
                } else if(this.planes[i].orientation == PlaneOrientation.Right) {
                    this.status[point.x][point.y] = 0;
                    this.status[point.x - 1][point.y - 2] = 0;
                    this.status[point.x - 1][point.y - 1] = 0;
                    this.status[point.x - 1][point.y] = 0;
                    this.status[point.x - 1][point.y + 1] = 0;
                    this.status[point.x - 1][point.y + 2] = 0;
                    this.status[point.x - 2][point.y] = 0;
                    this.status[point.x - 3][point.y - 1] = 0;
                    this.status[point.x - 3][point.y] = 0;
                    this.status[point.x - 3][point.y + 1] = 0;
                } else if(this.planes[i].orientation == PlaneOrientation.Bottom) {
                    this.status[point.x][point.y] = 0;
                    this.status[point.x - 2][point.y - 1] = 0;
                    this.status[point.x - 1][point.y - 1] = 0;
                    this.status[point.x][point.y - 1] = 0;
                    this.status[point.x + 1][point.y - 1] = 0;
                    this.status[point.x + 2][point.y - 1] = 0;
                    this.status[point.x][point.y - 2] = 0;
                    this.status[point.x - 1][point.y - 3] = 0;
                    this.status[point.x][point.y - 3] = 0;
                    this.status[point.x + 1][point.y - 3] = 0;
                } else {
                    this.status[point.x][point.y] = 0;
                    this.status[point.x + 1][point.y - 2] = 0;
                    this.status[point.x + 1][point.y - 1] = 0;
                    this.status[point.x + 1][point.y] = 0;
                    this.status[point.x + 1][point.y + 1] = 0;
                    this.status[point.x + 1][point.y + 2] = 0;
                    this.status[point.x + 2][point.y] = 0;
                    this.status[point.x + 3][point.y - 1] = 0;
                    this.status[point.x + 3][point.y] = 0;
                    this.status[point.x + 3][point.y + 1] = 0;
                }

                this.planes.splice(i, 1);
                i -= 1;

            } else if (this.planes[i].isShot(point)) {
                console.log("飞机被击伤");
                this.status[point.x][point.y] = 2;
            } else {
                console.log("没有击中飞机。")
            }
        }
    },

    isGameOver: function() {
        for(var i=0; i< MAP_ROW; i++) {
            for(var j=0;j<MAP_COL;j++) {
                if (this.status[i][j] != 0) {
                    return false;
                }
            }
        }
        return true;
    }
};

