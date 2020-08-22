module.exports = class Room {
    roomId;
    number_player;
    players;
    adminId;
    dead_player = [];
    wolves = [];
    villagers = [];
    targets = [];
    suspects = [];
    usingRole = [];

    constructor(roomId, number_player, players, adminId, targets, suspects, usingRole){
        this.roomId = roomId;
        this.number_player = number_player;
        this.players = players;
        this.adminId = adminId;
        this.targets = targets;
        this.suspects = suspects;
        this.usingRole = usingRole
    }
};