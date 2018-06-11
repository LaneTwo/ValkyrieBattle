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

var Game = function() {
    this.numberOfPlanes = 0;
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
    addPlane: function(point, orientation) {

    },
    isCrash: function(point) {

    },
    isShot: function(point) {

    }
}

