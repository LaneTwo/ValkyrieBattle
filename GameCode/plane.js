var PlaneSprite = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function PlaneSprite (scene, x, y)
    {
        Phaser.GameObjects.Image.call(this, scene);

        this.setTexture('plane');
        this.setPosition(x, y);
        //this.setScale(0.3);

        this.isDragging = false;
        this.plane = new Plane({x:-1, y:-1}, 0);
    },

    setNextDirection:function (){
        var orientation = this.plane.orientation + 1;
        if(orientation >= 4){
            orientation = 0;
        }

        this.plane.orientation = orientation;
    },

    getAngle: function(){
        return this.plane.orientation * 90;
    },

    updateGridPosition: function(x, y){
        var centerOffsetX = 0;
        var centerOffsetY = 0;

        switch(this.plane.orientation){
            case PlaneOrientation.Top:
                centerOffsetX = 0;
                centerOffsetY = -60;
                break;
            case PlaneOrientation.Right:
                centerOffsetX = 60;
                centerOffsetY = 0;
                break;
            case PlaneOrientation.Bottom:
                centerOffsetX = 0;
                centerOffsetY = 60;
                break;
            case PlaneOrientation.Left:
                centerOffsetX = -60;
                centerOffsetY = 0;
                break;                                                          
        }
        var gridX = Math.floor((x + centerOffsetX) / 40);
        var gridY = Math.floor((y + centerOffsetY)/ 40);

        if(gridX < 0){
            gridX = 0;
        }
        if(gridY < 0 ){
            gridY = 0;
        }

        this.plane.point.x = gridX;
        this.plane.point.y = gridY;

        console.log(gridX + ","+ gridY);
    },

    getDrawPosition: function(){
        var position = { x: -1, y: -1};
        if(this.plane.point.x >= 0 && this.plane.point.y >= 0){
            position.x = this.plane.point.x * 40;
            position.y = this.plane.point.y * 40;
            switch(this.plane.orientation){
                case PlaneOrientation.Top:
                    position.x += 20;
                    position.y += 80;
                    break;
                case PlaneOrientation.Right:
                    position.x -= 40;
                    position.y += 20;
                    break;
                case PlaneOrientation.Bottom:
                    position.x += 20;
                    position.y -= 40;
                    break;
                case PlaneOrientation.Left:
                    position.x += 80;
                    position.y += 20;
                    break;                                                          
            }
        }

        return position;
    },

    getPlaneObject: function(){
        return this.plane;
    }



});