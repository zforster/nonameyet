const server = require('http').createServer();
const io = require('socket.io')(server, { origins: 'localhost:3000'});

io.on('connection', (socket) => {
    console.log("new client!");
    socket.emit("welcome", "hello there");
});

server.listen(4001, () => console.log("started"));

