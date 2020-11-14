const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const axios = require('axios');
const randomWords = require('random-words');
let clients = [];

function getRhymes() {
    const word = randomWords();
    const promise = axios.get(`https://api.rhymezone.com/words?arhy=1&max=1000&qe=sl&sl=${word}`);
    return promise.then((response) => response.data);
}

// app.get('/', async (req, res) => {
//     getRhymes().then((r) => res.send(r));
// });

io.of("/games").on("connection", (socket) => {
    socket.on("joinRoom", ({room, username}) => { // client sends join room emit
        console.log(`${username} joined ${room}`);

        socket["username"] = username;
        socket["room"] = room;
        clients.push(socket);

        socket.join(room);

        socket.to(room).emit("userJoinedRoom", {username: socket["username"], id: socket.id});  // send the info of the user who just joined to everyone but the joiner
        clients.forEach(c => {if(c["room"] === room){socket.emit("userJoinedRoom", {username: c["username"], id: c.id})}});  // on join send emit usernames of everyone in the room to the client just joined
    });

    socket.on("leaveRoom", (room) => { // client sends join room emit
        console.log(`${socket.username} leaving room ${room}`);
        // socket.to(room).emit("userLeftRoom", {username: socket["username"], id: socket.id});
        // clients = clients.filter(function(el){  // remove disconnecting client from list
        //     return el.id !== socket.id;
        // });
    });

   // socket.on("sendMsg", ({username, msg, room}) => {
   //     console.log(`user ${username} in room ${room} sends: ${msg}`);
   //     socket.emit("broadcastMsg", {username, msg, room});// to just the client
   //     socket.to(room).emit("broadcastMsg", {username, msg, room});  // to all in the room
   // });
});

http.listen(4000, () => {
    console.log('listening on *:4000');
});