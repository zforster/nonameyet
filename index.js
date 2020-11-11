const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const axios = require('axios');


function getRhymes(word) {
    const promise = axios.get(`https://api.rhymezone.com/words?arhy=1&max=1000&qe=sl&sl=${word}`);
    return promise.then((response) => response.data);
}

app.get('/', async (req, res) => {
    getRhymes(req.query.word).then((r) => res.send(r));
});

io.of("/chat").on("connection", (socket) => {
    socket.on("joinRoom", (room) => { // client sends join room emit
        console.log(`client joining room: ${room}`);
        socket.join(room);
    });

   socket.on("sendMsg", ({username, msg, room}) => {
       console.log(`user ${username} in room ${room} sends: ${msg}`);
       socket.emit("broadcastMsg", {username, msg, room});// to just the client
       socket.to(room).emit("broadcastMsg", {username, msg, room});  // to all in the room
   });
});

http.listen(4000, () => {
    console.log('listening on *:4000');
});