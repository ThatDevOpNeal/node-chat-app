const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/message.js');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
/*
    socket.emit will emit to a single connection.
    io.emit will emit to everyone's connection.
*/

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log(`New user connected`);

    socket.emit(`newMessage`, generateMessage(`Admin`, `Welcome to the chat app!`));

    socket.broadcast.emit(`newMessage`, generateMessage(`Admin`, `A new user has joined the session!`));

    socket.on('createMessage', (message, callback) => {
        console.log(`Create Message:`, message);
        io.emit(`newMessage`, generateMessage(message.from, message.text));
        callback(`This is from the server.`);
    });

    socket.on(`createLocationMessage`, (coords) => {
        io.emit(`newLocationMessage`, generateLocationMessage(`Admin`, coords.latitude, coords.longitude));
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit(`newMessage`, generateMessage(`Admin`, `A user has left the session!`));
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
