'use strict';

// Imports dependencies and set up http server
const
  PAGE_ACCESS_TOKEN = "EAAJDVVZAcvT0BAAjWSxIooCWPk3M8ZB7t1tTdnxA27wlhoJz3YDr98qA11jfBCWQk8I2p9LvwYDtG6tUisB9rSQr3nshviwb0HLKntcZCv4XoENGscTcgEavKs0er394waPHDOePbIZB5pwZAwzMqZBWGrZAMnxlaEhY0S7LQ2ZBWwZDZD",
  express = require('express'),
 
  request = require('request'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server
require("./roles.tsx"),
// Adds support for GET requests to our webhook
app.get('/', (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = PAGE_ACCESS_TOKEN;
      
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
      
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
 
    let body = req.body;
  
    // Checks this is an event from a page subscription
    if (body.object === 'page') {
  
      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {
        
        // Gets the message. entry.messaging is an array, but 
        // will only ever contain one message, so we get index 0
        let webhook_event = entry.messaging[0];
        console.log(webhook_event);
        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);
        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message);        
        } else if (webhook_event.postback) {
          handlePostback(sender_psid, webhook_event.postback);
        }
        
      });
  
      // Returns a '200 OK' response to all requests
      res.status(200).send('EVENT_RECEIVED');
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  
});

function accessGame(sender_psid){
  // Construct the message body
  let request_body = {
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
  let request_body = {
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
    // Create the payload for a basic text message
    accessGame(sender_psid);
  } else if(received_message.text.toLowerCase() === "@role_all"){
    let tmp = "";
    data.forEach((role) =>{
      tmp += `${role.id}_${role.name}\n`
    })
    response = {
      "text": tmp
    }
  }else if(received_message.text.toLowerCase() === "@help"){
    response = {
      "text": `
        Các lệnh được sử dụng:
@start: bắt đầu kết nối với bot
@newgame: bắt đầu một game mới với phòng hiện tại
@endgame: kết thúc game ngay lập tức
@role_xx: xx là mã của vai trò, sẽ giúp các bạn biết về vai trò của thẻ
@role_all: tất cả các vai trò của game
@help: bộ các lệnh được sử dụng \n
      `
    }
  }else{

  }
  // Sends the response message
  callSendAPI(sender_psid, response);    
}

function handlePostback(sender_psid, received_postback) {
  let response;
  
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === '@_Join') {
    response = { "text": "You join a game, send me your key: " }
  } else if (payload === '@_Create') {
    response = { "text": "Your create a game, this is your key **************" }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}


// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));