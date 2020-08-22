gameRoomArray : Map<number, Room> = new Map<number, Room>();
const PAGE_ACCESS_TOKEN = "EAAJDVVZAcvT0BAAjWSxIooCWPk3M8ZB7t1tTdnxA27wlhoJz3YDr98qA11jfBCWQk8I2p9LvwYDtG6tUisB9rSQr3nshviwb0HLKntcZCv4XoENGscTcgEavKs0er394waPHDOePbIZB5pwZAwzMqZBWGrZAMnxlaEhY0S7LQ2ZBWwZDZD"
class Room {
  number_player: number;
  players: Array<any>;
  targets: Array<any>;
  suspects: Array<any>;
} 

class Player (){
    id: any;
    alive: boolean = true;
    admin: boolean = false;
	room: number = 0;
	constructor(id: any){
		this.id = id;
	}
}

function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function createRoom (sender, number){
    let roomid;
	do {
		roomid = randomNumber(10000,99999);
	}
	while (this.gameRoomArray.has(roomid));
	//tao phong
    let room = new Room();
	//tao admin
    let tempPlayer = new Player(sender);
	tempPlayer.room = roomid;
    tempPlayer.admin = true;
	//insert admin to room and add room to gameRoomArray
	room.players.push(sender);
    this.gameRoomArray.set(roomid , room);
	
    let startMessage = { text: "You have created a game, your room ID is: "+ roomid };
    sendTextMessage(sender, startMessage);
}

function joinRoom(sender,text){
	if (gameRoomArray.has(text)){
		if(gameRoomArray.get(text).players.length < 25){
			let newPlayer = new Player(sender);
			newPlayer.room = text;
			gameRoomArray.get(text).players.push(newPlayer);
			let joinMessage = { text: "you have successfully joined the room: "+ text};
		}
	}
	else{
		let joinMessage = { text: "room ID invalid"};
	}
}

function outRoom(sender,text){
	if (gameRoomArray.has(text)){
		for(var i = 0; i < gameRoomArray.get(text).players.length;i++){
			if(gameRoomArray.get(text).players.get(i).id == sender){
				gameRoomArray.get(text).players.splice(i, 1);
			}
		}	
	}
	else{
		let joinMessage = { text: "room ID invalid"};
	}
}

function messageToWoft(roomid, text) {
	let i;
	if(gameRoomArray.has(roomid)) {
		for(i = 0; i < gameRoomArray.get(roomid).players.length; i++) {
			if(gameRoomArray.get(roomid).player.get(i).role == ""){
				sendTextMessage(gameRoomArray.get(roomid).player.get(i).id, text);
			}
			
		}		
	}
	else {
		console.log('Error in callEveryone');
	}
}

function messageToWoft(roomid, text) {
	let i;
	if(gameRoomArray.has(roomid)) {
		for(i = 0; i < gameRoomArray.get(roomid).players.length; i++) {
			sendTextMessage(gameRoomArray.get(roomid).player.get(i).id, text);
		}		
	}
	else {
		console.log('Error in callEveryone');
	}
}

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function displayWolvesPossibleChoice(roomid) {
    
}

function displayPossibleChoiceToAnotherPlayer(roomid) {
    
}


function turnNightOnce(roomid) {
    messageEveryone(roomid, "Night time starts!!");
	displayPossibleChoiceToAnotherPlayer(roomid);
    displayWolvesPossibleChoice(roomid);
}

