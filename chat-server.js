const net = require('net');
const roomFile = require('./room.js');
const room = roomFile.room;
const sockets = [];
const rooms = [];
const port = 9633;
const maxRoom = 20;

// start server
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
        } else if (command === "/quit") {
            endSocket(socket, inRoom);
        } else if (command === "/help") {
            listCommands(socket);
        } else if (command === "/rooms" || command === "/room"){
            displayRooms(socket, inRoom);
        } else if (command.substring(0, 5) === "/make"){
            makeRoom(socket, command, inRoom);
        } else if (command.substring(0, 5) === "/join"){
            inRoom = joinRoom(socket, command, inRoom);
        } else if (command === "/leave") {
            leaveRoom(socket, inRoom);
            inRoom = false;
        } else if (inRoom) {
            broadCast(socket, data.toString());
        }
    });

    socket.on("error", function(error) {
        console.log("Socket has error: ", error.message);
        socket.end();
    });
});

// Remove user who left
const endSocket = function(socket, inRoom) {
    if (inRoom) {
        alertLeftUser(socket);
        socket.room.removeMember(socket);
    }
    sockets.splice(sockets.indexOf(socket), 1);
    process.stdout.write(socket.nickname + " left\n");
    socket.write("Goodbye\n");
    socket.end();
}

// Remove user from the current room
const leaveRoom = function(socket, inRoom) {
    if (!inRoom) {
        socket.write("You are not in a room.\n");
        return;
    }
    alertLeftUser(socket);
    socket.room.removeMember(socket);
    socket.room = null;
};

// List of available commands
const listCommands = function(socket) {
    socket.write("Commands:\n/help /rooms /make {roomname} /join {roomname} /leave /quit\n");
};

// Send message to users in the same room
const broadCast = function(sender, message) {
    for (member of sender.room.members) {
        if (member.nickname !== sender.nickname) {
            member.pause();
            member.write(sender.nickname + ": " + message);
            member.resume();
        }
    }
};

// Let the users in the room know that a user left
const alertLeftUser = function(leftUser) {
    const user = leftUser.nickname;
    for (member of leftUser.room.members) {
        if (member.nickname !== user) {
            member.write("* user has left chat: " + user + "\n");
        } else {
            member.write("* user has left chat: " + user + " (** this is you)\n");
        }
    }
};

// Let the users in ther room know that a new user joined
const alertNewUser = function(newUser) {
    const user = newUser.nickname;
    for (member of newUser.room.members) {
        if (member.nickname !== user) {
            member.write("* new user joined chat: " + user + "\n");
        }
    }
};


// Add the user to the room
const joinRoom = function(socket, command, inRoom) {
    if (inRoom) {
        socket.write("Please /leave current room to join a different one.\n")
        return true;
    }
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
};

// Display current members of the room when a new user enters
const displayMembers = function(currentRoom, socket) {
    const members = currentRoom.members;
    socket.write("Members in the room:\n")
    for (m of members) {
        const isSelf = m.nickname === socket.nickname ? " (** this is you)\n" : "\n";
        socket.write("* " + m.nickname + isSelf);
    }
    socket.write("end of list.\n");
};

// Display active rooms
const displayRooms = function(socket, inRoom) {
    if (inRoom) {
        socket.write("Please /leave to view the rooms.\n")
        return;
    }
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

// Make a new room
const makeRoom = function(socket, command, inRoom) {
    if (inRoom) {
        socket.write("Please /leave current room to make a new room.\n")
        return;
    }
    if (command.substring(5).trim() === "") {
        socket.write("Enter room name to make.\nEx) /make room1\n");
    } else {
        if (checkMaxRoom()) {
            socket.write("Sorry, max number of rooms reached. Please wait until a room is empty.\n");
            return;
        }
        const roomName = command.substring(6);
        if (checkRoomNameExist(roomName)) {
            socket.write("Room name already exists. Please choose a different room name.\n");
            return;
        }
        const r = new room(roomName);
        socket.write("room " + roomName + " created.\n");
        rooms.push(r);
    }
};

// Check if there are max number of rooms and remove a room if true
const checkMaxRoom = function() {
    if (rooms.length >= maxRoom) {
        return removeRoom();
    }
    return false;
}

// Remove an inactive room if there is one
const removeRoom = function() {
    for (r of rooms) {
        if (!r.hasUsers) {
            rooms.splice(rooms.indexOf(room), 1);
            return false;
        }
    }
    return true;
}

// Find a room by room name
const findRoom = function(roomName) {
    for (r of rooms) {
        if (r.name === roomName){
            return r;
        }
    }
    return null;
};

// Name already taken, ask the user again for a new name
const askAgain = function(socket) {
    socket.write("Sorry, name taken.\n");
    socket.write("Login Name?\n");
};

// Set user nickname
const setNickname = function(socket, command) {
    if (checkNicknameExist(command)){
        askAgain(socket);
        return false;
    } else {
        socket.nickname = command;
        socket.write("Welcome " + command + "!\n");
        process.stdout.write(socket.nickname + " joined\n");
        listCommands(socket);
        return true;  
    }
};

// Check for duplicate room names
const checkRoomNameExist = function(roomName) {
    for (r of rooms) {
        if (r.name === roomName) {
            console.log("exist");
            return true;
        }
    }
    return false;
}

// Check for duplicate names in the server
const checkNicknameExist = function(nickname) {
    for (s of sockets) {
        if (nickname === s.nickname) {
            return true;
        }
    }
    return false;
};

// Removes new line from raw input
const formatInput = function(data) {
    const input = data.toString();
    const jsonInput = JSON.stringify(input);
    const removeQuote = jsonInput.replace(/^"/, "");
    const removeNewline = removeQuote.replace(/\\r\\n"|\\n"/, "");
    // return data.toString().replace(/(\r\n|\n|\r)/gm,"");
    return removeNewline;
};

// Error if something goes wrong
server.on("error", function(error) {
    console.log("Error: ", error.message);
});

// Server is listening to the port
server.listen(port, function() {
    console.log("Server listening at http://localhost:", port);
});