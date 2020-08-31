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
    static convertArrayToString(str){
        let tmp = "";
        str.forEach(element => {
            tmp += element + "|"
        });
        return tmp.slice(0, tmp.length - 1);
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
                let room = new Room(roomid, null, [], sender_psid.toString(), null, null, [], false);
                //tao admin
                //insert admin to room and add room to gameRoomArray
                room.players.push(sender_psid);
                playersHandel.checkPlayerExits(sender_psid).room = roomid;
                this.addRoom(sender_psid, room);
                responseMessage = { "text": "Bạn đã tạo 1 phòng chơi, ID của phòng là: " + roomid + ", gửi nó cho bạn bè nhé !"};
                this.startGame(sender_psid);
            }else{
                responseMessage = { "text": "Bạn đang làm chủ 1 phòng" };
            }
        }else{
            responseMessage = { "text": "Bạn đang trong phòng, hãy thoát trước khi muốn làm gì khác !" };
        }
        
        return responseMessage;
    }
    //tham gia phòng bth - Y
    //tham gia phòng khi đang trong phòng khác - X
    //tham gia rồi tham gia nửa - X
    //vào rồi đòi vào nửa - X
    //game đang chơi thì tham gia phòng - N
    
    static joinRoom(sender, text){
        let responseMessage;
        var msg = text.toLowerCase();
        msg = msg.slice(2, msg.lastIndexOf("]"));

        var playerTmp = playersHandel.checkPlayerExits(sender); //lấy user đang sử dụng Bot trong hệ thống để kiểm tra nó ở phòng nào
        if(playerTmp.room == null){ // nếu đang trong phòng rồi thì không cho vào phòng khác
            var room = this.getRoomByRoomID(msg);
            if (room != undefined){ // nếu phòng k có thì k cho dô
                if(room.players.length < room.number_player){ // nếu phòng đầy thì không cho dô
                    room.players.push(sender);
                    playersHandel.setPlayerRoom(sender, room.roomId);
                    responseMessage = { text: "Vào phòng " + text + " thành công !"};
                
                }else{
                    responseMessage = { text: "Phòng này full người bạn ơi"};
                }
            }
            else{
                responseMessage = { text: "Không tìm thấy phòng: " + msg};
            }
        }else{
            responseMessage = { text: "Bạn đang trong 1 phòng khác, hãy thoát khỏi phòng trước khi tham gia phòng khác !"};
        }
        return responseMessage;
    }
    //chưa vào phòng nào mà out - X
    //out phòng bth - Y
    //nếu admin rời khỏi phòng, xóa phòng đi, thông báo là phòng đã bị hủy - Y
    //game đang chơi thì out - N
    static outRoom(sender){
        var player = playersHandel.checkPlayerExits(sender);
        var responseMessage;
        if(player.room != null){ // chưa vào phòng nào mà muốn out
            var ownerRoom = this.getRoomBySender(sender);
            if(ownerRoom){ //nếu nó là admin
                responseMessage = {
                    text: `Phòng ${ownerRoom.roomId} đã bị xóa !`, 
                    listSender: ownerRoom.players
                }
                ownerRoom.players.forEach(sender => {
                    console.log("SENDER", sender);
                    playersHandel.outRoom(sender);
                });
                // chưa xóa phòng cho các player trong phòng
                this.removeRoom(sender);
                
            }else{
                var room = this.getRoomByRoomID(player.room);
                responseMessage = { text: "Bạn đã thoát khỏi phòng " + player.room};

                player.room = null; //xóa room đưuọc ref từ list player

                for(var i = 0; i < room.players.length; i++){
                    if(room.players[i].toString() == sender.toString()){
                        _.pull(room.players, sender); //xóa user ra khỏi room ra khỏi hệ thống
                    }   
                }
            }
        }else{
            responseMessage = { text: "Bạn không ở trong phòng nào để thoát !"};
        }
        return responseMessage;
        
    }

    static getRoomInformation(sender){
        var room = this.getRoomBySender(sender);
        if(room != null){
            var tmp = `
                RoomID: ${room.roomId}
            Number Player: ${room.number_player}
            Admin: ${room.adminId}
            Using Role: ${room.usingRole}
            `
            return {text: tmp}
        }
        return {text: "Bạn không sở hữu phòng nào !"}
    }

    static startGame(sender, callAPI){
        let response;
        let room = this.getRoomBySender(sender);
        response = this.checkRoomState(room);
        console.log(response);
        console.log("startGame")
        if(response.text == "OK"){
            room.isStart = true;
        }
        callAPI(sender, response);
        return response;
    }



    static checkRoomState(room){
        if(room.number_player == null){
          return { text: "Please Enter Number of player: (Gửi với dạng: L[Số người chơi], Ví dụ L[8]" }
        }
        // if(room.players == null){
        //   return "NO_PLAYER_IN_ROOM";
        // }else{
        //   if(room.players.length < room.number_player){
        //     response = { "text": `Not enough player, ${room.players.length}/${room.number_player}` }
        //     callSendAPI(sender_psid, response);
        //     return "NOT_ENOUGN_PLAYER";
        //   }
        // }
        if(room.usingRole.length == 0){
            return { 
            text: `
              Nói cho mình biết trò chơi của bạn sẽ có chức năng gì đặc biệt ?
        Cú pháp: R[x, x, x...]
        vói x là id của chức năng
        Ví dụ: R[1, 2, 3]
        Mình sẽ nhập số lượng sau nhé !
        Nếu bạn không nhớ id của chức năng, gửi @role_all để mình giúp bạn !
            ` 
          }
        }
        if(!this.isValidRole(room.usingRole)){
            return { 
                text: `Các vai trò bạn chọn chưa có sói, bạn chọn lại giúp mình nhé` 
            }
        }
        return {text: `Đã sẵn sàng để bắt đầu !`};
    }
      
    static isValidRole(roles){
    // hàm này đang set cứng  cho sói thường, 
    //cần update để có thể handel tất cả các sói
    let vaild = false;
    roles.forEach(role => {
        if(role == "6".toLowerCase()){
            vaild = true;
        }
    });
    
    return vaild;
    }


    //chưa handel cú pháp 
    static setNumberPlayer(sender_psid, received_message){
        var room = this.getRoomBySender(sender_psid.toString());
        if(room != undefined){
            var msg = received_message.toLowerCase();
            msg = msg.slice(2, msg.lastIndexOf("]"));
            room.number_player = Number.parseInt(msg);
            this.startGame(sender_psid);
        }
    }
  
    //chưa handel cú pháp
    static setRoles(sender_psid, received_message){
        var room = this.getRoomBySender(sender_psid.toString());
        room.usingRole = [];
        if(room != undefined){
            var msg = received_message.toLowerCase();
            msg = msg.slice(2, msg.lastIndexOf("]"));
            let tmp = [];
            msg.split(",").forEach(element => {
                tmp.push(element.trim());
            });
            room.usingRole = tmp.filter((item, i, ar) => ar.indexOf(item) === i);
            this.startGame(sender_psid);
        }
    }
      

}