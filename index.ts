'use strict';

// Imports dependencies and set up http server
var Room = require('./models/Room.ts');
var Player = require('./models/Room.ts');
const
  PAGE_ACCESS_TOKEN = "EAAJDVVZAcvT0BAAjWSxIooCWPk3M8ZB7t1tTdnxA27wlhoJz3YDr98qA11jfBCWQk8I2p9LvwYDtG6tUisB9rSQr3nshviwb0HLKntcZCv4XoENGscTcgEavKs0er394waPHDOePbIZB5pwZAwzMqZBWGrZAMnxlaEhY0S7LQ2ZBWwZDZD",
  express = require('express'),
  Command = require('./command.ts'),
  request = require('request'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server
const gameRoomArray = new Map();
let systemRoles = require("./roles.ts");

// Adds support for GET requests to our webhook
app.get('/', (req, res) => {
    // Your verify token. Should be a random string.
    const VERIFY_TOKEN = PAGE_ACCESS_TOKEN;

    // Parse the query params
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  });
// Creates the endpoint for our webhook
app.post('/', (req, res) => {

    const body = req.body;
    if (body.object === 'page') {
      body.entry.forEach(function(entry) {
        const webhook_event = entry.messaging[0];
        console.log(webhook_event);
        const sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);

        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message);
        } else if (webhook_event.postback) {
          handlePostback(sender_psid, webhook_event.postback);
        }

      });
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }

});

function accessGame(sender_psid){
  // Construct the message body
  const request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message":{
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"Welcome to Ma Soi, choice your option !",
          "buttons":[
            {
              "type":"postback",
              "title":"Join Game",
              "payload":"@_Join"
            },
            {
              "type":"postback",
              "title":"Create Game",
              "payload":"@_Create"
            }
          ]
        }
      }
    }
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });

}


function callSendAPI(sender_psid, response) {
  // Construct the message body
  const request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });

}

function handleMessage(sender_psid, received_message) {
  let response;
  // Check if the message contains text
  if (received_message.text.toLowerCase() === "@start") {
    // kết nối với bot
    accessGame(sender_psid);
  }else if(received_message.text.toLowerCase() === "@all_room"){
    console.log("ALL ROOM", gameRoomArray);
    let tmp = "";
    gameRoomArray.forEach(element => {
      tmp += element.toString() + "\n";      
    });
    response = {
      "text": tmp
    };
  }else if(received_message.text.toLowerCase() === "@my_room"){
    response = {
      "text": findRoom(sender_psid) ? findRoom(sender_psid).toString() : "You don't have room !"
    };
  }else if(received_message.text.toLowerCase() === "@role_all"){
    response = Command.handelRoleAll();
  }else if(received_message.text.toLowerCase() === "@help"){
    response = Command.handelHelp();
  }else if(received_message.text.toLowerCase() === "@newgame"){
    response = Command.handelHelp();
  }else if(received_message.text.toLowerCase().includes("l[") && received_message.text.toLowerCase().includes("]") ){
    setNumberPlayer(sender_psid, received_message.text);
  }else if(received_message.text.toLowerCase().includes("r[") && received_message.text.toLowerCase().includes("]") ){
    setRoles(sender_psid, received_message.text);
  }else{

  }
  // Sends the response message
  callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  const payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === '@_Join') {
    response = { "text": "You join a game, send me your key: " };
    callSendAPI(sender_psid, response);
  } else if (payload === '@_Create') {
    // random id phòng -> trả về key
    createRoom(sender_psid);
  }

}

function randomKeyNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function createRoom(sender_psid){
  let reponseMessage;
  if(!findRoom(sender_psid)){
    let roomid;
    do {
      roomid = Math.floor(randomKeyNumber(10000,99999));
    }
    while (gameRoomArray.has(roomid));
    //tao phong
      let room = new Room(null, [], sender_psid.toString(), null, null, [],);
      console.log(room);
    //tao admin
      let tempPlayer = new Player(sender_psid);
      tempPlayer.room = roomid;
      tempPlayer.admin = true;
      //insert admin to room and add room to gameRoomArray
      room.players.push(sender_psid);
      gameRoomArray.set(roomid , room);
      reponseMessage = { "text": "You have created a game, your room ID is: "+ roomid };

      setTimeout(function () {
        var room = findRoom(sender_psid);
        checkRoomState(room, sender_psid);
      }, 2000);
  }else{
    reponseMessage = { "text": "You owner a room !" };
  
  }
  callSendAPI(sender_psid, reponseMessage);
	
}

//check thằng đó có phải là admin của phòng nào không
function findRoom(sender){
  let tmp;
  gameRoomArray.forEach((room) =>{
    if(room.adminId == sender.toString()){
      tmp = room;
    }
  })
  return tmp;
}

function setNumberPlayer(sender_psid, received_message){
  var room = findRoom(sender_psid.toString());
  if(room != undefined){
    var msg = received_message.toLowerCase();
    msg = msg.slice(2, msg.lastIndexOf("]"));
    room.number_player = Number.parseInt(msg);
    console.log("SET NUMBER PLAYER", room);
    checkRoomState(room, sender_psid);
  }
}

function setRoles(sender_psid, received_message){
  var room = findRoom(sender_psid.toString());
  room.usingRole = [];
  if(room != undefined){
    var msg = received_message.toLowerCase();
    msg = msg.slice(2, msg.lastIndexOf("]"));
    let tmp = [];
    msg.split(",").forEach(element => {
      tmp.push(element.trim());
    });
    room.usingRole = tmp.filter((item, i, ar) => ar.indexOf(item) === i);
    console.log("SET ROLES", room);
    checkRoomState(room, sender_psid);
  }
}

function isValidRole(roles){
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

function checkRoomState(room, sender_psid){
  let response;
  if(room.number_player == null){
    response = { "text": "Please Enter Number of player: (Gửi với dạng: L[Số người chơi], Ví dụ L[8]" }
    callSendAPI(sender_psid, response);
    return "NUMBER_PLAYER_MISSING";
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
    response = { 
      "text": `
        Chưa chọn vai trò, nói cho mình biết trò chơi của bạn sẽ có chức năng gì đặc biệt ?
  Cú pháp: R[x, x, x...]
  vói x là id của chức năng
  Ví dụ: R[1, 2, 3]
  Mình sẽ nhập số lượng sau nhé !
  Nếu bạn không nhớ id của chức năng, gửi @role_all để mình giúp bạn !
      ` 
    }
    callSendAPI(sender_psid, response);
    return "NOT_CHOICE_ROLE_YET";
  }else{
    // if(room.usingRole.length < room.number_player){ 
    //   return "NOT_ENOUGH_ROLE_FOR_PLAYER";
    // }
  }

  if(!isValidRole(room.usingRole)){
    response = { 
      "text": `Các vai trò bạn chọn chưa có sói, bạn chọn lại giúp mình nhé` 
    }
    callSendAPI(sender_psid, response);
    return "NOT_CHOICE_ROLE_YET";
  }

  return "READY_TO_START";
}

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));