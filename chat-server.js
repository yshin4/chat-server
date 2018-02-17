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

    socket.on("data", function(data) {
        const input = data.toString();
        const jsonInput = JSON.stringify(input);
        const removeQuote = jsonInput.replace(/^"/, "");
        const command = removeQuote.replace(/\\r\\n"|\\n"/, "");         
        if (!hasNickname) {
            hasNickname = setNickname(socket, command);
        } else if (command === "/rooms"){
            displayRooms(socket);
        } else if (command.substring(0, 5) === "/make"){
            makeRoom(socket, command);
        } else if (command.substring(0, 5) === "/join"){
            inRoom = joinRoom(socket, command);
        } else if (inRoom) {
            broadCast(socket, input);
        } else {
            console.log(input);
            //socket.write(input);
        }
    });

    socket.on("error", function(error) {
        console.log("Socket has error: ", error.message);
    });
});

// TODO: Leaveroom
// TODO: Exit
// TODO: display new user while in room
// current room
// using /rooms /make /join while in a room. = allow or disallow?
// secret room? ask for pw, separate command? but how to store pw

const broadCast = function(sender, message) {
    for (s of sockets) {
        if (s.nickname !== sender.nickname) {
            s.write(sender.nickname + ": " + message);
        }
    }
}

const alertNewUser = function(newUser) {
    const user = newUser.nickname;
    for (s of sockets) {
        if (s.nickname !== user) {
            s.write("* new user joined chat: " + user + "\n");
        }
    }
}

const joinRoom = function(socket, command) {
    if (command.substring(5).trim() === "") {
        socket.write("Enter room name to join.\nEx) /join room1\n");
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

server.on("error", function(error) {
    console.log("Error: ", error.message);
});

server.listen(port, function() {
    console.log("Server listening at http://localhost:", port);
});