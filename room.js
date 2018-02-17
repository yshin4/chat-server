class Room {
	constructor(roomName) {
		this.name = roomName;
		this.members = [];
		this.numMember = 0;
	}

	addMember(member) {
		this.members.push(member);
		this.numMember += 1;
	}

	removeMember(member) {
		const index = this.members.findIndex(member);
		this.members.splice(index, 1);
		this.numMember -= 1;
	}
}

module.exports.room = Room;