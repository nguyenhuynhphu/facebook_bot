module.exports = class Player {
    id; // sender
    alive;
    admin;
    role;
    room;
    constructor(id, alive, admin, role, room){
        this.id = id;
        this.alive = alive;
        this.admin = admin;
        this.role = role;
        this.room = room;
    }
}
