class Room {
    constructor(roomName) {
        this.name = roomName;
        this.members = [];
        this.numMember = 0;
        this.hasUsers = false;
    }

    addMember(member) {
        this.members.push(member);
        this.numMember += 1;
        member.room = this;
        this.hasUsers = true;
    }

    removeMember(member) {
        const index = this.members.indexOf(member);
        this.members.splice(index, 1);
        this.numMember -= 1;
        member.room = null;
        this.hasUsers = this.numMember > 0;
    }
}

module.exports.room = Room;