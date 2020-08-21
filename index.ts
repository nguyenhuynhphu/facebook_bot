'use strict';

// Imports dependencies and set up http server
var Room = require('./models/Room.ts');
const
  PAGE_ACCESS_TOKEN = "EAAJDVVZAcvT0BAAjWSxIooCWPk3M8ZB7t1tTdnxA27wlhoJz3YDr98qA11jfBCWQk8I2p9LvwYDtG6tUisB9rSQr3nshviwb0HLKntcZCv4XoENGscTcgEavKs0er394waPHDOePbIZB5pwZAwzMqZBWGrZAMnxlaEhY0S7LQ2ZBWwZDZD",
  express = require('express'),
  Command = require('./command.ts'),
  request = require('request'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server
const gameRoomArray = new Map();
gameRoomArray.set(
  "342000678",
  {
    number_player: null,
    players: [
      {name: "asdasd"}
    ],
    adminId: "2988442917949850",
    targets: null,
    suspects: null,
    usingRole: null,
    roomState: ""
  }
);
gameRoomArray.set(
  "123456789",
  {
    number_player: 25,
    players: [],
    adminId: "1232132132",
    targets: [],
    suspects: [],
    usingRole: [],
    roomState: ""
  }
);

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
    console.log("My ROOM", findRoom(sender_psid));
  }else if(received_message.text.toLowerCase() === "@role_all"){
    response = Command.handelRoleAll();
  }else if(received_message.text.toLowerCase() === "@help"){
    response = Command.handelHelp();
  }else if(received_message.text.toLowerCase() === "@newgame"){
    response = Command.handelHelp();
  }else if(received_message.text.toLowerCase().includes("[") && received_message.text.toLowerCase().includes("]") ){
    setNumberPlayer(sender_psid, received_message.text);
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
    generateKey();
    response = { "text": "Your create a game, this is your key **************" }
    callSendAPI(sender_psid, response);
    // kieemr tra state cua phong
    var room = findRoom(sender_psid);
    checkRoomState(room, sender_psid);
    // chọn chức năng có trong phòng
  }

}

function generateKey(){

}

function findRoom(sender){
  let tmp;
  gameRoomArray.forEach((room) =>{
    if(room.adminId == sender.toString()){
      console.log("MATCH");
      tmp = room;
    }
  })
  return tmp;
}

function setNumberPlayer(sender_psid, received_message){
  var room = findRoom(sender_psid.toString());
  if(room != undefined){
    var msg = received_message.toLowerCase();
    msg = msg.slice(1, msg.lastIndexOf("]"));
    room.number_player = Number.parseInt(msg);
    console.log("SET NUMBER PLAYER", room);
    checkRoomState(room, sender_psid);
  }
}

function setRoles(sender_psid, received_message){
  var room = findRoom(sender_psid.toString());
  if(room != undefined){
    var msg = received_message.toLowerCase();
    msg = msg = msg.slice(2, msg.lastIndexOf("]"));
    let usingRole = msg.split(",");
    usingRole.forEach(element => {
      if(room.usingRole == null)
        room.usingRole = new Array();
      room.usingRole.push(element.trim());
    });
    console.log("SET ROLES", room);
    checkRoomState(room, sender_psid);
  }
}


function checkRoomState(room, sender_psid){
  let response;
  if(room.number_player == null){
    response = { "text": "Please Enter Number of player: (Gửi với dạng: [Số người chơi], Ví dụ [8]" }
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
  if(room.usingRole == null){
    response = { 
      "text": `
        Chưa chọn vai trò, nói cho mình biết trò chơi của bạn sẽ có chức năng gì đặc biệt ?
      Cú pháp: R[Thợ săn, Phù Thủy, Dân Làng, Sói],
      Mình sẽ nhập số lượng sao nhé !
      Nếu bạn không nhớ chức năng, gửi @role_all để mình giúp bạn !
      ` 
    }
    callSendAPI(sender_psid, response);
    return "NOT_CHOICE_ROLE_YET";
  }else{
    if(room.usingRole.length < room.number_player){
      return "NOT_ENOUGH_ROLE_FOR_PLAYER";
    }
  }
  return "READY_TO_START";
}

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));