'use strict';

// Imports dependencies and set up http server
var Room = require('./models/Room.ts');
const
  PAGE_ACCESS_TOKEN = "EAAJDVVZAcvT0BAAjWSxIooCWPk3M8ZB7t1tTdnxA27wlhoJz3YDr98qA11jfBCWQk8I2p9LvwYDtG6tUisB9rSQr3nshviwb0HLKntcZCv4XoENGscTcgEavKs0er394waPHDOePbIZB5pwZAwzMqZBWGrZAMnxlaEhY0S7LQ2ZBWwZDZD",
  express = require('express'),

  request = require('request'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server
// var Room = require('./models/Room');
const gameRoomArray = new Map();
gameRoomArray.set(
  "2988442917949850",
  new Room(8, [], "2988442917949850", [], [], [])
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
    response = {
      "text": gameRoomArray
    }
  }else if(received_message.text.toLowerCase() === "@role_all"){
    response = Command.handelRoleAll();
  }else if(received_message.text.toLowerCase() === "@help"){
    response = Command.handelHelp();
  }else if(received_message.text.toLowerCase() === "@newgame"){
    response = Command.handelHelp();
  }else if(received_message.text.toLowerCase() === "number"){
    var room = findRoom(sender_psid.toString());
    room.number_player = 8;
    response = {
      "text" : room
    }
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
    // nhập số người trong phòng
    setTimeout(function(){
      response = { "text": "Number of player: (Gửi với dạng: [Số người chơi], Ví dụ [8]" }
      callSendAPI(sender_psid, response);
    }, 2000);
    // chọn chức năng có trong phòng
  }

}

function generateKey(){

}

function findRoom(sender){
  gameRoomArray.forEach((room) =>{
    if(room.adminId === sender){
      return room;
    }
  })
  return null;
}

function checkRoomState(room){
  
}

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));