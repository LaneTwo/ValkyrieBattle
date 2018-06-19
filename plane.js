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
        this.direction = 0;
        this.plane = new Plane({x:-1, y:-1}, 0);
    },

    setNextDirection:function (){
        this.direction++;
        if(this.direction >= 4){
            this.direction = 0;
        }

        this.plane.orientation = this.direction;
    },

    getAngle: function(){
        return this.direction * 90;
    },

    updateGridPosition: function(x, y){
        var centerOffsetX = 0;
        var centerOffsetY = 0;

        switch(this.direction){
            case 0:
                centerOffsetX = 0;
                centerOffsetY = -60;
                break;
            case 1:
                centerOffsetX = 60;
                centerOffsetY = 0;
                break;
            case 2:
                centerOffsetX = 0;
                centerOffsetY = 60;
                break;
            case 3:
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
            switch(this.direction){
                case 0:
                    position.x += 20;
                    position.y += 80;
                    break;
                case 1:
                    position.x -= 40;
                    position.y += 20;
                    break;
                case 2:
                    position.x += 20;
                    position.y -= 40;
                    break;
                case 3:
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