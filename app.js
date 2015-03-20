var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var basicAuth = require('basic-auth-connect');

var socketIo = require('socket.io');
var socketio_jwt = require('socketio-jwt');

var jwt = require('jsonwebtoken');
var jwt_secret = 'foo bar big secret';

var app = express();

var config = {
  username: process.env.BASIC_USERNAME || 'username',
  password: process.env.BASIC_PASSWORD || 'password'
};

app.use(basicAuth(function(user, pass){
  return config.username == user && config.password == pass;
}));

app.use(bodyParser.json());
app.use(express.static(__dirname + '/app'));

app.post('/login', function (req, res) {
  var profile = {
    username: 'demo',
    id: 12345678910,
    email: 'test@email.com'
  };

  // We are sending the profile inside the token
  var token = jwt.sign(profile, jwt_secret, { expiresInMinutes: 60*5 });

  res.json({token: token});
});

var server = http.createServer(app);
var sio = socketIo.listen(server);

sio.use(socketio_jwt.authorize({
  secret: jwt_secret,
  handshake: true
}));

sio.sockets
  .on('connection', function (socket) {
    console.log(socket.decoded_token.email, 'connected');
    socket.on('ping', function (m) {
      socket.emit('pong', m);
    });
  });

setInterval(function () {
  sio.sockets.emit('time', Date());
}, 5000);

server.listen(process.env.PORT || 3000, function () {
  console.log('listening on http://localhost:3000');
});