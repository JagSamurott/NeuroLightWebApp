const dotenv = require('dotenv').config()
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const fs = require("fs");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'adminView.html'));
});
app.get('/api/envs', (req, res) => {
    const envs = [{
        name: 'CLIENT_ID',
        id: process.env.CLIENT_ID,
    },]
    res.send(envs);
});
app.use(express.static('.'));

//Stripe stuff
var validSubs = [];
async function getActiveSubsEmails() {
    const subscriptions = await stripe.subscriptions.list();
    var emails = [];
    for(const sub of subscriptions.data){
        const customer = await stripe.customers.retrieve(sub.customer);
        emails.push(customer.email);
    }
    return emails;
}
getActiveSubsEmails()
    .then(function(emails) {
        validSubs = emails;
    });

const passwordFile = fs.readFileSync("./passwords.txt" )+'';
var allPasswords = "";
if (passwordFile.includes("\r\n"))
    allPasswords = passwordFile.split('\r\n');
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
        getActiveSubsEmails()
            .then(function(emails) {
                validSubs = emails;
            })
            .then(io.to(room).emit('password attempt', validSubs.includes(attempt)));
        
    })

    socket.on("disconnect", () => { 
        console.log("user disconnected");
    })

    socket.on('change color', (r, g, b, fs, room) => {
        io.to(room).emit('change color', r,g,b,fs);
    })
    socket.on('change bright', (fs, br, room) => {
        io.to(room).emit('change bright', fs,br);
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