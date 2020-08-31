module.exports = class Player {
    id; // sender
    alive;
    admin;
    role;
    room;
    isPlay;
    constructor(id, alive, admin, role, room, isPlay){
        this.id = id;
        this.alive = alive;
        this.admin = admin;
        this.role = role;
        this.room = room;
        this.isPlay = isPlay;
    }
}
