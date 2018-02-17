var net = require('net');
var roomFile = require('./room.js');
var room = roomFile.room;
var sockets = [];
var rooms = [];
var port = 9633;

var server = net.createServer(function(socket) {
    sockets.push(socket);
    socket.write("Welcome to the GungHo test chat server\n");
    socket.write("Login Name?\n");
    var hasNickname = false;

    socket.on("data", function(data) {
        var input = data.toString();
        var jsonInput = JSON.stringify(input);
        var removeQuote = jsonInput.replace(/^"/, "");
        var removeNewline = removeQuote.replace(/\\r\\n"|\\n"/, "");         
        if (!hasNickname) {       
            if (checkNicknameExist(removeNewline)) {
                socket.write("Sorry, name taken.\n");
                socket.write("Login Name?\n");
            } else {
                socket.nickname = removeNewline;
                hasNickname = true;
                socket.write("Welcome " + removeNewline + "!\n");
            }
        } else if (removeNewline === "/rooms"){
            displayRooms(socket);
        } else if (removeNewline.substring(0, 5) === "/make"){
            if (removeNewline.substring(5).trim() === "") {
                socket.write("Enter room name to make.\nEx) /make room1\n");
            } else {
                var roomName = removeNewline.substring(6);
                makeRoom(socket, roomName);
            }
        } else if (removeNewline.substring(0,5) === "/join"){
            if (removeNewline.substring(5).trim() === "") {
                socket.write("Enter room name to join.\nEx) /join room1\n");
            } else {
                var roomName = removeNewline.substring(6);
                joinRoom(socket, roomName);
                socket.write("entering room: " + roomName + "\n");
            }            
        }
        } else {
            socket.write(input);
        }
        
    });

    socket.on("error", function(error) {
        console.log("Socket has error: ", error.message);
    });
});

// TODO: Leaveroom
// TODO: Exit
// TODO: joinroom -> display members, if room does not exist
// room state, current room

var joinRoom = function(socket, roomName) {
    for (r of rooms) {
        if (r.name === roomName) {
            r.addMember(socket.nickname);
        }
    }
}

var displayRooms = function(socket) {
    socket.write("Active rooms are:\n");
    for (r of rooms) {
        socket.write("* " + r.name + " (" + r.numMember + ")\n");
    }
    socket.write("end of list.\n");
};

var makeRoom = function(socket, roomName) {
    var r = new room(roomName);
    socket.write("room " + roomName + " created.\n");
    rooms.push(r);
};

var checkNicknameExist = function(nickname) {
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