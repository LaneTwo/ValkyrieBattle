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
var PLAN_NUM = 3;

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
        switch (this.orientation) {
            case PlaneOrientation.Top:

            break;
            case PlaneOrientation.Right:
            
            break;
            case PlaneOrientation.Bottom:

            break;
            case PlaneOrientation.Left:
            
            break;
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

    },

    addPlane: function(plane) {
        
    }, 

    isGameOver: function() {
        
    }
};

