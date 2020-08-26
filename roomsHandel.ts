var Room = require('./models/Room.ts');
var Player = require('./models/Player.ts');
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

    static showRoomInfo(room){
        console.log(room);
        let tmp = `
          RoomID = ${room.roomId}
        AdminId = ${room.adminId}
        Number Player = ${room.number_player}
          Players in Room:
          ${room.players}
        `
        return tmp;
    }
    static showAllRoomInfo(){
        this.gameRoomArray.forEach(element => {
            console.log(element);
        });
    }

    static randomKeyNumber(min, max) {
        return Math.random() * (max - min) + min;
      }
      
    static createRoom(sender_psid){
        let responseMessage;
        if(this.getRoomBySender(sender_psid) == undefined){
            let roomid;
            do {
                roomid = Math.floor(this.randomKeyNumber(10000, 99999));
            }
            while (this.getRoomByRoomID(roomid) != undefined);
        
            //tao phong
            let room = new Room(roomid, 10, [], sender_psid.toString(), null, null, []);
            //tao admin
            let tempPlayer = new Player(sender_psid, true, true, "", roomid);
            //insert admin to room and add room to gameRoomArray
            room.players.push(tempPlayer);
        
            this.addRoom(sender_psid, room);
            responseMessage = { "text": "You have created a game, your room ID is: "+ roomid};
        
        }else{
            responseMessage = { "text": "You owner a room !" };
        }
        return responseMessage;
    }

}