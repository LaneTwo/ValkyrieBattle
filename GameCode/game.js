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
            
        } else if (this.orientation == PlaneOrientation.Bottom) {

        } else {

        }
    }
};

var Game = function() {
    this.numberOfPlanes = 0;
    this.planes = [];
    this.status = [
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
    ];
};

Game.prototype = {
    init: function() {
        new Plane(new SVGPoint)
    },

    addPlane: function(plane) {
        
    }, 

    isGameOver: function() {

    }
};

