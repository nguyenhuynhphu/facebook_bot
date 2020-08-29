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
    isStart;
    constructor(roomId, number_player, players, adminId, targets, suspects, usingRole, isStart){
        this.roomId = roomId;
        this.number_player = number_player;
        this.players = players;
        this.adminId = adminId;
        this.targets = targets;
        this.suspects = suspects;
        this.usingRole = usingRole
        this.isStart = isStart;
    }
};