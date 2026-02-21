const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'adminView.html'));
});

const fs = require("fs");
const passwordFile = fs.readFileSync("./passwords.txt" )+'';
const allPasswords = "";
if (navigator.userAgent.indexOf('Win')!=-1)
    allPasswords = passwordFile.split('\r\n');
else if (navigator.userAgent.indexOf('Mac')!=-1)
    allPasswords = passwordFile.split('\r');
else
    allPasswords = passwordFile.split('\n');
console.log("Here are all the passwords:");
console.log(allPasswords);

io.on('connection', (socket) => {
    console.log('a user connected');
    console.log('their id: ', socket.id);

    socket.on('room select', (room) => {
        console.log("user joined room", room);
        socket.join(room);
    })

    socket.on('password attempt', (room, attempt) =>{
        io.to(room).emit('password attempt', allPasswords.includes(attempt))
    })

    socket.on("disconnect", () => {
        console.log("user disconnected");
    })

    socket.on('change color', (r, g, b, fs, room) => {
        io.to(room).emit('change color', r,g,b,fs);
    })
    socket.on('change freq', (fs, nf, room) => {
        io.to(room).emit('change freq', fs,nf);
    })
    socket.on('change smile', (fs, nO, room) => {
        io.to(room).emit('change smile', fs, nO);
    })
    socket.on('change smile pos', (fs, nX, nY, room) => {
        io.to(room).emit('change smile pos', fs, nX, nY);
    })
    socket.on('change circle pos', (fs, nX, nY, room) => {
        io.to(room).emit('change circle pos', fs, nX, nY);
    })
    socket.on('change radius', (fs, nR, room) => {
        io.to(room).emit('change radius', fs, nR);
    })

});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});