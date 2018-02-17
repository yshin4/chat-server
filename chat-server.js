var net = require('net');
var sockets = [];
var port = 9633;

var server = net.createServer(function(socket) {
    socket.write("Welcome to the GungHo test chat server\n");
    socket.write("Login name?\n");
    var hasNickname = false;
    socket.nickname = ""

    socket.on("data", function(data) {
        if (!hasNickname) {
            socket.nickname = data.toString();
            hasNickname = true;
        }
        console.log(socket.nickname);
    });

    socket.on("error", function(error) {
        console.log("Socket has error: ", error.message);
    });
});

server.on("error", function(error) {
    console.log("Error: ", error.message);
});

server.listen(port, function() {
    console.log("Server listening at http://localhost:", port);
});