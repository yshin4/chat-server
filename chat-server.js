var net = require('net');
var sockets = [];
var port = 9633;

console.log("runniing");

var server = net.createServer(function(socket) {
	console.log("The server is running");
	socket.write("Welcome to the GungHo test chat server\nLogin name?");
	socket.write("Login name?");
}) 