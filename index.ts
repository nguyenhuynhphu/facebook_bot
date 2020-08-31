'use strict';

// Imports dependencies and set up http server
var Room = require('./models/Room.ts');
var Player = require('./models/Player.ts');
const
  PAGE_ACCESS_TOKEN = "EAAJDVVZAcvT0BAAjWSxIooCWPk3M8ZB7t1tTdnxA27wlhoJz3YDr98qA11jfBCWQk8I2p9LvwYDtG6tUisB9rSQr3nshviwb0HLKntcZCv4XoENGscTcgEavKs0er394waPHDOePbIZB5pwZAwzMqZBWGrZAMnxlaEhY0S7LQ2ZBWwZDZD",
  express = require('express'),
  Command = require('./command.ts'),
  PlayersHandel = require('./playersHandel.ts'),
  RoomsHandel = require('./roomsHandel.ts'),
  request = require('request'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

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
        const sender_psid = webhook_event.sender.id;
        console.log(webhook_event);
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
  let tmp = new Player(sender_psid, true, false, null, null, false);
  PlayersHandel.addPlayer(tmp);
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
  if(response != undefined){
    if(response.listSender != undefined){
      let array = response.listSender;
      console.log(array);
      array.forEach(senderId => {
        var request_body = {
          "recipient": {
            "id": senderId
          },
          "message": {
            "text": "Phòng đã bị xóa phòng !"
          }
        }
        request({
          "uri": "https://graph.facebook.com/v2.6/me/messages",
          "qs": { "access_token": PAGE_ACCESS_TOKEN },
          "method": "POST",
          "json": request_body
        }, (err, res, body) => {
          if (!err) {
            
          } else {
            console.error("Unable to send message:" + err);
          }
        });
      });
    }else{
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
          
        } else {
          console.error("Unable to send message:" + err);
        }
      });
    
    }
  }
}


//4287205711351255
function handleMessage(sender_psid, received_message) {
  let response;
  var currentUser = PlayersHandel.checkPlayerExits(sender_psid); 

  if(currentUser != undefined){//có gởi @start chưa
    var currentRoom = RoomsHandel.getRoomBySender(sender_psid);  //có phải là admin của phòng nào không

    if(received_message.text.toLowerCase() === "@all_room"){
      RoomsHandel.showAllRoomInfo();
      response = {
        "text": "Show all room"
      };
    }else if(received_message.text.toLowerCase() === "@delete_room"){
      RoomsHandel.removeRoom(sender_psid);
      response = {
        "text": "Your room have remove !"
      };
    }else if(received_message.text.toLowerCase() === "@role_all"){
      response = Command.handelRoleAll();
    }else if(received_message.text.toLowerCase() === "@test_msg"){
      sender_psid = 4287205711351255;
      response = {"text": "Oh yeah bạn !"};
    }else if(received_message.text.toLowerCase() === "@all_player"){
      response = {"text": PlayersHandel.showAllPlayer()};
    }else if(received_message.text.toLowerCase() === "@disconnect"){
      // PlayersHandel.removePlayer(sender_psid);
      // response = {"text": "Disconnect Success !"};
    }else if(received_message.text.toLowerCase() === "@my_room"){
      response = RoomsHandel.getRoomInformation(sender_psid);
    }else if(received_message.text.toLowerCase() === "@help"){
      response = Command.handelHelp();
    }else if(received_message.text.toLowerCase() === "@newgame"){
      response = RoomsHandel.startGame(sender_psid, callSendAPI);
    }else if(received_message.text.toLowerCase() === "@out_room"){
      response = RoomsHandel.outRoom(sender_psid);
    }else if(received_message.text.toLowerCase().includes("j[") && received_message.text.toLowerCase().includes("]") ){
      response = RoomsHandel.joinRoom(sender_psid, received_message.text);
    }else if(received_message.text.toLowerCase().includes("l[") && received_message.text.toLowerCase().includes("]") ){
      if(currentRoom){
        RoomsHandel.setNumberPlayer(sender_psid, received_message.text);
      }else{
        response = {
          "text": "Bạn không phải admin hoặc chưa tạo phòng !"
        };
      }
    }else if(received_message.text.toLowerCase().includes("r[") && received_message.text.toLowerCase().includes("]") ){
      if(currentRoom){
        RoomsHandel.setRoles(sender_psid, received_message.text);
      }else{
        response = {
          "text": "Bạn không phải admin hoặc chưa tạo phòng !"
        };
      }  
    }else{
      response = {
        "text": "Mình không hiểu lệnh !"
      };
    }
    
  }else{
    if (received_message.text.toLowerCase() === "@start") {
      accessGame(sender_psid);
    }else{
      response = {
        "text": "Send @start before doing anything !"
      };
    }
  }
  
  // Sends the response message
  callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
  let response;
  const payload = received_postback.payload;
  if (payload === '@_Join') {
    response = { "text": "You join a game, send me your key: " };
  } else if (payload === '@_Create') {
    // random id phòng -> trả về key
    response = RoomsHandel.createRoom(sender_psid);
    RoomsHandel.startGame(sender_psid, callSendAPI);
  }
  callSendAPI(sender_psid, response);

}




// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));