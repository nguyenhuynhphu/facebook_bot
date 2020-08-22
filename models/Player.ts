module.exports = class Player {
    id; // sender
    alive;
    admin;
    role;
    room;
    constructor(id, room){
        this.id = id;
        this.alive = true;
        this.admin = false;
        this.room = room;
    }
}
