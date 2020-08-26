var Player = require('./models/Player.ts');
var _ = require('lodash');
module.exports = class PlayerHandel {

    static playersInSystem = new Array();

    static checkPlayerExits(player){
        var tmp = false;
        this.playersInSystem.forEach(element => {
            if(element.id.toString() == player.id.toString()){
                tmp = true;
            }
        });
        return tmp;
    }

    static removePlayer(player){
        if(!this.checkPlayerExits(player)){
            _.pull(this.playersInSystem, player);
       }else{
           console.log("removePlayer", "NO PLAYER TO REMOVE");
       }
    }

    static addPlayer(player){
       if(!this.checkPlayerExits(player)){
            this.playersInSystem.push(player);
       }else{
           console.log("addPlayer", "DUPLICATE USER");
       }
    }

    
}