var Player = require('./models/Player.ts');
var _ = require('lodash');
module.exports = class PlayerHandel {

    static playersInSystem = new Array();

    static checkPlayerExits(sender){
        var tmp = false;
        this.playersInSystem.forEach(element => {
            if(element.id.toString() == sender.toString()){
                tmp = true;
            }
        });
        return tmp;
    }

    static removePlayer(sender){
        if(!this.checkPlayerExits(sender)){
            this.playersInSystem.forEach(element => {
                if(element.id == sender){
                    _.pull(this.playersInSystem, element);
                }
            });
       }else{
           console.log("removePlayer", "NO PLAYER TO REMOVE");
       }
    }

    static addPlayer(player){
        console.log(player);
       if(!this.checkPlayerExits(player.id)){
            this.playersInSystem.push(player);
       }else{
           console.log("addPlayer", "DUPLICATE USER");
       }
    }

    static showAllPlayer(){
        let tmp;
        this.playersInSystem.forEach(element => {
            tmp += this.showPlayerInfo(element) + "\n";
        });
        return tmp;
    }
    
    static showPlayerInfo(player){
        return `${player.id}`;
    }
}