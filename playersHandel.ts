var Player = require('./models/Player.ts');
var _ = require('lodash');
module.exports = class PlayersHandel {

    static playersInSystem = new Array();

    static checkPlayerExits(sender){
        var tmp = undefined;
        this.playersInSystem.forEach(element => {
            if(element.id.toString() == sender.toString()){
                tmp = element;
            }
        });
        return tmp;
    }
    static removePlayer(sender){
        if(this.checkPlayerExits(sender) != undefined){
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
       if(this.checkPlayerExits(player.id) == undefined){
            this.playersInSystem.push(player);
       }else{
           console.log("addPlayer", "DUPLICATE USER");
       }
    }

    static showAllPlayer(){
        let tmp = "";
        this.playersInSystem.forEach(element => {
            tmp += this.showPlayerInfo(element) + "\n";
        });
        console.log(this.playersInSystem);
        return tmp;
    }
    
    static showPlayerInfo(player){
        return `${player.id}`;
    }

    
    static setPlayerRoom(sender, roomId){
        var tmpPlayer = this.checkPlayerExits(sender);
        if(tmpPlayer != undefined){
            tmpPlayer.room = roomId;
            return "SUCC";
        }
        return "FAIL";
    }

    static setPlayerAdmin(sender){
        var tmpPlayer = this.checkPlayerExits(sender);
        if(tmpPlayer != undefined){
            tmpPlayer.admin = true;
            return "SUCC";
        }
        return "FAIL";
    }
    
    static outRoom(sender){
        var tmp = this.checkPlayerExits(sender);
        tmp.room = null;
    }

}