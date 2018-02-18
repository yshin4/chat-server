class Room {
    constructor(roomName) {
        this.name = roomName;
        this.members = [];
        this.numMember = 0;
    }

    addMember(member) {
        this.members.push(member);
        this.numMember += 1;
        member.room = this;
    }

    removeMember(member) {
        const index = this.findMember(member);
        this.members.splice(index, 1);
        this.numMember -= 1;
        member.room = null;
    }

    findMember(member) {
        for (let i in this.members){
            if (member.nickname === this.members[i].nickname) {
                return i;
            }
        }
    }
}

module.exports.room = Room;