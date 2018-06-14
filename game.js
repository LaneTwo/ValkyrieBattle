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
        
    }, 

    isGameOver: function() {

    }
};

