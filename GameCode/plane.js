var Plane = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function Plane (scene, x, y)
    {
        Phaser.GameObjects.Image.call(this, scene);

        this.setTexture('plane');
        this.setPosition(x, y);
        //this.setScale(0.3);

        this.isDragging = false;
        this.direction = 0;
    },

    setNextDirection:function (){
        this.direction++;
        if(this.direction >= 4){
            this.direction = 0;
        }
    },

    getAngle: function(){
        return this.direction * 90;
    }


});