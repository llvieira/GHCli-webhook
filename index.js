var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const request = require('request');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var users = {}

io.on('connection', function(socket){
  socket.on('message', function (data) {
  	users[data.email] = {data: data, socket: socket}
  });
});

setInterval(function(){ getNotifications() }, 5000);

function getNotifications() {
	Object.keys(users).forEach(function(key) {
  		var gitCredentials = users[key].data.credentials;
  		var notificationsDate = users[key].data.notificationsDate;
  		var userSocket = users[key].socket;

  		// TODO: make this request work
  		request(`https://api.github.com/notifications?since=${notificationsDate}`, { json: true }, (err, res, body) => {
  			if (err) { 
  				return console.log(err); 
  			}

  			// update user's notification date to the last notifications date
  			// users[key].data.notificationsDate = ...

  			userSocket.emit('new_msg', body);
		});
	});
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});

// https://socket.io/get-started/chat]
// https://developer.github.com/v3/activity/notifications/
// https://stackoverflow.com/questions/17476294/how-to-send-a-message-to-a-particular-client-with-socket-io