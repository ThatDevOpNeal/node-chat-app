const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/message.js');
const { isRealString } = require('./utils/validation.js');
const { Users } = require('./utils/users.js');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
var users = new Users();
/*
    socket.emit will emit to a single connection.
    io.emit will emit to everyone's connection.
*/

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    socket.on(`join`, (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback(`Proper name and room name are required`);
        }

        socket.join(params.room);
        users.removeUser(socket.id); //incase this id exists already.
        users.addUser(socket.id, params.name, params.room);
        
        io.to(params.room).emit(`updateUserList`, users.getUserList(params.room));
        socket.emit(`newMessage`, generateMessage(`Admin`, `Welcome to the chat app!`));
        socket.broadcast.to(params.room).emit(`newMessage`, generateMessage(`Admin`, `${params.name} has joined the room!`));

        callback();
    });

    socket.on('createMessage', (message, callback) => {
        var user = users.getUser(socket.id);

        if (user && isRealString(message.text)) {
            io.to(user.room).emit(`newMessage`, generateMessage(user.name, message.text));
        }

        callback(`This is from the server.`);
    });

    socket.on(`createLocationMessage`, (coords) => {
        var user = users.getUser(socket.id);
        if (user) {
            io.to(user.room).emit(`newLocationMessage`, generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }
    });

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit(`updateUserList`, users.getUserList(user.room));
            io.to(user.room).emit(`newMessage`, generateMessage(`Admin`, `${user.name} has left the room.`));
        }
    });

});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
