var Room = require('./models/Room.ts');
var Player = require('./models/Player.ts');
const playersHandel = require('./playersHandel.ts');
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
       if(this.getRoomBySender(sender) == undefined){
            this.gameRoomArray.set(sender, room);
       }else{
           console.log("addRoom", "Use Own Anthor Room");
       }
    }

    static getRoomByRoomID(roomID) {
        let tmp;
        this.gameRoomArray.forEach(element => {
          if (element.roomId.toString() == roomID.toString()){
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
    //tạo phòng bth - Y
    //đang trong phòng người khác mà tạo phong - N
    //có phòng rồi mà tạo nửa - X
    static createRoom(sender_psid){
        let responseMessage;
        var playerTmp = playersHandel.checkPlayerExits(sender_psid); //lấy user đang sử dụng Bot trong hệ thống để kiểm tra nó ở phòng nào
        if(playerTmp.room == null){
            if(this.getRoomBySender(sender_psid) == undefined){ //kiểm tra thằng này có sở hữu phòng nào chưas
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
                playersHandel.checkPlayerExits(sender_psid).room = roomid;
                this.addRoom(sender_psid, room);
                responseMessage = { "text": "Bạn đã tạo 1 phòng chơi, ID của phòng là: " + roomid + ", gởi nó cho bạn bè nhé !"};
            
            }else{
                responseMessage = { "text": "Bạn đang làm chủ 1 phòng" };
            }
        }else{
            responseMessage = { "text": "Bạn đang trong 1 phòng khác, không thể tạo phòng !" };
        }
        
        return responseMessage;
    }
    //tham gia phòng bth - Y
    //tham gia phòng khi đang trong phòng khác - X
    //tham gia rồi tham gia nửa - X
    //vào rồi đòi vào nửa - X
    static joinRoom(sender, text){
        let responseMessage;
        var msg = text.toLowerCase();
        msg = msg.slice(2, msg.lastIndexOf("]"));

        var playerTmp = playersHandel.checkPlayerExits(sender); //lấy user đang sử dụng Bot trong hệ thống để kiểm tra nó ở phòng nào
        if(playerTmp.room == null){ // nếu đang trong phòng rồi thì không cho vào phòng khác
            var room = this.getRoomByRoomID(msg);
            if (room != undefined){ // nếu phòng k có thì k cho dô
                if(room.players.length < room.number_player){ // nếu phòng đầy thì không cho dô
                    if(playerTmp.room.toString() != sender){ // bạn đang ở trong phòng mà vào nửa thì éo cho
                        let newPlayer = new Player(sender, true, false, "", msg);
                        room.players.push(newPlayer);
                        playersHandel.setPlayerRoom(sender, room.roomId);
                        responseMessage = { "text": "Vào phòng " + text + " thành công !"};
                    }else{
                        responseMessage = { "text": "Bạn đã vào bên trong " + text};
                    }
                }else{
                    responseMessage = { "text": "Phòng này full người bạn ơi"};
                }
            }
            else{
                responseMessage = { "text": "Không tìm thấy phòng: " + msg};
            }
        }else{
            responseMessage = { "text": "Bạn đang trong 1 phòng khác, hãy thoát khỏi phòng trước khi tham gia phòng khác !"};
        }
        return responseMessage;
    }
    //chưa vào phòng nào mà out - X
    //out phòng bth - Y
    static outRoom(sender){
        var player = playersHandel.checkPlayerExits(sender);
        if(player.room != null){ // chưa vào phòng nào mà muốn out
            var room = this.getRoomByRoomID(player.room);
            var responseMessage = { text: "Bạn đã thoát khỏi phòng " + player.room};

            player.room = null; //xóa room đưuọc ref từ list player

            for(var i = 0; i < room.players.length; i++){
                if(room.players[i].id.toString() == sender.toString()){
                    _.pull(room.players, room.players[i]); //xóa room ra khỏi hệ thống
                }   
            }
        }else{
            responseMessage = { text: "Bạn không ở trong phòng nào để thoát !"};
        }
        return responseMessage;
        
    }
      

}