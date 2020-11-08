const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);


io.of("/games").on("connection", (socket) => {  // create namespace
    socket.on("joinRoom", (room) => { // client sends join room emit
        console.log(`client joining room: ${room}`);
        socket.join(room);  // let client join room
        io.of("/games").in(room).emit("newUser", `new user is in your room ${room}`); // broadcast msg to games namespace use .on to broadcast to all but me, use .in to broadcast to all including me
        return socket.emit("success", `joined room ${room}`) // send client a msg
    })
});

http.listen(4000, () => {
    console.log('listening on *:4000');
});