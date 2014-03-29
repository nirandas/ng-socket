/**
 * @author Nirandas Thavorath <nirandas@gmail.com>
 * copyright 2014
 * MIT license
 */

var sockjs = require("sockjs"),
    http = require("http");
var httpServer = http.createServer(function(req, res) {
    if (req.url == "/ng-socket.js") {
        res.end(require("fs").readFileSync("ng-socket.js"));
    } else {
        res.end(require("fs").readFileSync("index.html"));
    }
});

var socketServer = sockjs.createServer();
socketServer.installHandlers(httpServer, {
    prefix: "/echo"
});
httpServer.listen(4949);

socketServer.on("connection", function(socket) {
    console.log("new connection");
    socket.on("data", function(message) {
        console.log(message);
        message = JSON.parse(message);
        if (message.length != 2) {
            throw "Invalid message format " + message;
        }

        var id = message[1];
        var cancel = setInterval(function() {
            socket.write(JSON.stringify([message[0], id]));
            id--;
            if (id == 0) {
                clearInterval(cancel);
            }
        }, 5);
    });

});
