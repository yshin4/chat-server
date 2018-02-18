const net = require('net');
const roomFile = require('./room.js');
const room = roomFile.room;
const sockets = [];
const rooms = [];
const port = 9633;

const server = net.createServer(function(socket) {
    sockets.push(socket);
    socket.write("Welcome to the GungHo test chat server\n");
    socket.write("Login Name?\n");
    let hasNickname = false;
    let inRoom = false;
    socket.room = null;

    socket.on("data", function(data) {
        const command = formatInput(data);        
        if (!hasNickname) {
            hasNickname = setNickname(socket, command);
        } else if (command === "/rooms" || command === "/room"){
            displayRooms(socket);
        } else if (command.substring(0, 5) === "/make"){
            makeRoom(socket, command);
        } else if (command.substring(0, 5) === "/join"){
            inRoom = joinRoom(socket, command);
        } else if (command.substring(0, 6) === "/leave") {
            leaveRoom(socket, inRoom);
            inRoom = false;
        } else if (inRoom) {
            broadCast(socket, data.toString());
        }else {
            console.log(input);
            //socket.write(input);
        }
    });

    socket.on("error", function(error) {
        console.log("Socket has error: ", error.message);
    });
});

// TODO: Exit
// using /rooms /make /join while in a room. = only allow them when youre not in the room.


const leaveRoom = function (socket, inRoom) {
    if (!inRoom) {
        socket.write("You're not in a room.\n");
        return;
    }
    socket.write("Left room " + socket.room.name + ".\n");
    socket.room.removeMember(socket);
}

const broadCast = function(sender, message) {
    for (member of sender.room.members) {
        if (member.nickname !== sender.nickname) {
            member.write(sender.nickname + ": " + message);
        }
    }
}

const alertNewUser = function(newUser) {
    const user = newUser.nickname;
    for (member of newUser.room.members) {
        if (member.nickname !== user) {
            member.write("* new user joined chat: " + user + "\n");
        }
    }
}

const joinRoom = function(socket, command) {
    if (command.substring(5).trim() === "") {
        socket.write("You must enter room name to join.\nEx) /join room1\n");
        return false;
    }
    const roomName = command.substring(6);
    const foundRoom = findRoom(roomName);
    if (foundRoom) {
        foundRoom.addMember(socket);
        alertNewUser(socket);
        socket.write("entering room: " + roomName + "\n");
        displayMembers(foundRoom, socket);
        return true;
    } else {
        socket.write("No active room: " + roomName + "\n");
        return false;
    }
}

const displayMembers = function(currentRoom, socket) {
    const members = currentRoom.members;
    socket.write("Members in the room:\n")
    for (m of members) {
        const isSelf = m.nickname === socket.nickname ? " (** this is you)\n" : "\n";
        socket.write("* " + m.nickname + isSelf);
    }
    socket.write("end of list.\n");
}

const displayRooms = function(socket) {
    if (!rooms.length) {
        socket.write("There are no active rooms.\n")
    } else {
        socket.write("Active rooms are:\n");
        for (r of rooms) {
            socket.write("* " + r.name + " (" + r.numMember + ")\n");
        }
        socket.write("end of list.\n");
    }
};

const makeRoom = function(socket, command) {
    if (command.substring(5).trim() === "") {
        socket.write("Enter room name to make.\nEx) /make room1\n");
    } else {
        const roomName = command.substring(6);    
        const r = new room(roomName);
        socket.write("room " + roomName + " created.\n");
        rooms.push(r);
    }
};

const findRoom = function(roomName) {
    for (r of rooms) {
        if (r.name === roomName){
            return r;
        }
    }
    return null;
}

const askAgain = function(socket) {
    socket.write("Sorry, name taken.\n");
    socket.write("Login Name?\n");
}

const setNickname = function(socket, command) {
    if (checkNicknameExist(command)){
        askAgain(socket);
        return false;
    } else {
        socket.nickname = command;
        socket.write("Welcome " + command + "!\n"); 
        return true;  
    }
}

const checkNicknameExist = function(nickname) {
    for (s of sockets) {
        if (nickname === s.nickname) {
            return true;
        }
    }
    return false;
};

const formatInput = function(data) {
    const input = data.toString();
    const jsonInput = JSON.stringify(input);
    const removeQuote = jsonInput.replace(/^"/, "");
    const removeNewline = removeQuote.replace(/\\r\\n"|\\n"/, "");
    return removeNewline;
}

server.on("error", function(error) {
    console.log("Error: ", error.message);
});

server.listen(port, function() {
    console.log("Server listening at http://localhost:", port);
});