var net = require('net');
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
        if (!hasNickname) {
            var jsonInput = JSON.stringify(input);
            var removeQuote = jsonInput.replace(/^"/, "");
            var removeNewline = removeQuote.replace(/\\r\\n"|\\n"/, "");            
            if (checkNicknameExist(removeNewline)) {
                socket.write("Sorry, name taken.\n");
                socket.write("Login Name?\n");
            } else {
                socket.nickname = removeNewline;
                hasNickname = true;
                socket.write("Welcome " + removeNewline + "!\n");
            }
        } else {
            socket.write(input);
        }
        
    });

    socket.on("error", function(error) {
        console.log("Socket has error: ", error.message);
    });
});

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