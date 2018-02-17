var net = require('net');
var sockets = [];
var rooms = [];
var port = 9633;

var server = net.createServer(function(socket) {
    socket.write("Welcome to the GungHo test chat server\n");
    socket.write("Login Name?\n");
    var hasNickname = false;

    socket.on("data", function(data) {
        var input = data.toString();
        if (!hasNickname) {
            if (checkNicknameExist(input)) {
                console.log("does returning error");
                socket.write("Sorry, name taken.\n");
                socket.write("Login Name?\n");
            } else {
                socket.nickname = input;
                hasNickname = true;
                console.log(input.raw());
                socket.write("Welcome " + input.replace(/\n$/g, '') + "!");
            }
        } else {
            // TODO
        }
        
    });

    socket.on("error", function(error) {
        console.log("Socket has error: ", error.message);
    });
});

var checkNicknameExist = function(nickname) {
    sockets.forEach(function(socketNickname){
        console.log("nn is ", socketNickname);
        if (nickname === socketNickname){
            return true;
        }
    });
    return false;
};

server.on("error", function(error) {
    console.log("Error: ", error.message);
});

server.listen(port, function() {
    console.log("Server listening at http://localhost:", port);
});