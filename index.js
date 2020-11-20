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

function getRoomHost(room){
    // set host flag of the client who is connected and been in the room longest as the room host
    let foundHost = false;
    let host = null;
    clients.forEach(client => {
        if(client["room"] === room){
            if(!foundHost){
                client["host"] = true;
                foundHost = true;
                host = client;
            }
            else{
                client["host"] = false;
            }
        }
    });
    return host;
}

io.of("/games").on("connection", (socket) => {
    socket.on("joinRoom", ({room, username}) => { // client sends join room emit
        socket["username"] = username;
        socket["room"] = room;

        clients.push(socket);
        getRoomHost(room);

        socket.join(room);

        socket.to(room).emit("userJoinedRoom", {username: socket["username"], id: socket.id, host: socket["host"]});  // send the info of the user who just joined to everyone but the joiner

        clients.forEach(c => {
            if(c["room"] === room){
                if(c === socket){
                    socket.emit("userJoinedRoom", {username: c["username"], id: c.id, host: c["host"], isYou: true});
                }
                else{
                    socket.emit("userJoinedRoom", {username: c["username"], id: c.id, host: c["host"]});
                }
            }
        });  // on join send emit usernames of everyone in the room to the client just joined
    });

    socket.on("disconnect", () => {
        clients = clients.filter(function(el){  // remove disconnecting client from list
            return el.id !== socket.id;
        });
        let host = getRoomHost(socket.room);
        if(host){  // if theres anyone left in the room
            socket.to(socket.room).emit("userLeftRoom", {username: socket["username"], id: socket.id, host: host["id"]});  // send new host in response
        }
    });

   //     socket.emit("broadcastMsg", {username, msg, room});// to just the client
   //     socket.to(room).emit("broadcastMsg", {username, msg, room});  // to all in the room
});

http.listen(4000, () => {
    console.log('Server Started');
});