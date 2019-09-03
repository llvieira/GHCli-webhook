var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('message', function (data) {
    console.log(data.email);
    socket.join(data.email); // We are using room of socket io

    // get notifications from github for this user and send it
    io.in(data.email).emit('new_msg', {msg: 'hello'})
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

// https://socket.io/get-started/chat
// https://stackoverflow.com/questions/17476294/how-to-send-a-message-to-a-particular-client-with-socket-io