var app = angular.module("app", ['btford.socket-io']);

app.factory('socket', function (socketFactory) {
  return socketFactory();
});

app.controller("MainCtrl", function($scope, $http, socket) {
  var token;

  $scope.events = [{foo: 'bar'}];

  socket.on('pong', function () {
    console.log('- pong');
  });
  socket.on('time', function (data) {
    console.log('- broadcast: ' + data);
  });
  socket.on('authenticated', function () {
    console.log('- authenticated');
  });
  socket.on('disconnect', function () {
    console.log('- disconnected');
  });
  socket.on('error', function (reason){
    console.error('Unable to connect Socket.IO', reason);
  });
  socket.on('webhooks', function (data){
    $scope.events.push(data);
  });

  $scope.ping = function() {
    socket.emit('ping');
  };

  $scope.login = function() {
    $http.post('/login', {username: 'user', password: 'pass'})
      .success(function(data, status, headers, config) {
        console.log(data);
        token = data.token;
      });
  };
});
