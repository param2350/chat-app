const path = require("path");
const express = require("express");
const http = require('http');

const {
  isRealString
} = require('./utils/validation');
const {
  Users
} = require('./utils/users');
const socketIO = require('socket.io');
const {
  generateMessage,
  generateLocationMessage
} = require('./utils/message')
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var publicPath = path.join(__dirname, '../public');
var users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {



  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      callback('name and room are required')
    }
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));


    socket.emit('newMessage', generateMessage('admin', 'welcome'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('admin', `${params.name} has joined`));
    callback();




  });

  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);

    if(user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));

    }

    callback('from admin');
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);

    if(user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.lat, coords.long));

    }
  })

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(users.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the room`));
    }


  });
});

server.listen(port, () => {
  console.log(`server on port ${port}`);
});
