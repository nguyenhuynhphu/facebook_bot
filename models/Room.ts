module.exports = class Room {
    number_player;
    players;
    adminId;
    dead_player = [];
    wolves = [];
    villagers = [];
    targets = [];
    suspects = [];
    usingRole = [];

    constructor(number_player, players, adminId, targets, suspects, usingRole){
        this.number_player = number_player;
        this.players = players;
        this.adminId = adminId;
        this.targets = targets;
        this.suspects = suspects;
        this.usingRole = usingRole
    }
};