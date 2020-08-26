var Room = require('./models/Room.ts');
var _ = require('lodash');
module.exports = class RoomsHandel {

    static gameRoomArray = new Map();

    static getRoomBySender(sender){
        return this.gameRoomArray.get(sender);
    }

    static removeRoom(sender){
        if(this.getRoomBySender(sender) != undefined){
            this.gameRoomArray.delete(sender);
       }else{
           console.log("removeRoom", "No Room To Delete");
       }
    }

    static addRoom(sender, room){
       if(this.getRoomBySender(sender) != undefined){
            this.gameRoomArray.set(sender, room);
       }else{
           console.log("addRoom", "Use Own Anthor Room");
       }
    }

    static getRoomByRoomID(roomID) {
        let tmp;
        this.gameRoomArray.forEach(element => {
          if (element.roomId.toString() == roomID){
            tmp = element;
          }
        });
        return tmp;
      }

    // static showAllPlayer(){
    //     let tmp = "";
    //     this.playersInSystem.forEach(element => {
    //         tmp += this.showPlayerInfo(element) + "\n";
    //     });
    //     return tmp;
    // }
    
    // static showPlayerInfo(player){
    //     return `${player.id}`;
    // }

    
    // static setPlayerRoom(sender, roomId){
    //     var tmpPlayer = this.checkPlayerExits(sender);
    //     if(tmpPlayer != undefined){
    //         tmpPlayer.room = roomId;
    //         return "SUCC";
    //     }
    //     return "FAIL";
    // }

    // static setPlayerAdmin(sender){
    //     var tmpPlayer = this.checkPlayerExits(sender);
    //     if(tmpPlayer != undefined){
    //         tmpPlayer.admin = true;
    //         return "SUCC";
    //     }
    //     return "FAIL";
    // }

}