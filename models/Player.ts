module.exports = class Player {
    id: number; // sender
    alive: boolean = true;
    admin: boolean = false;
    role: string;
	room: number = 0;
}
