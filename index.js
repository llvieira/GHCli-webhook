var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var github = require('github-api');

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
  		var gitToken = users[key].data.token;
  		var userSocket = users[key].socket;

  		var gh = new github({
  			token: gitToken
		});

		var me = gh.getUser();

		me.listNotifications(function(err, notifications) {
			if (err) { 
				return console.log(err);
			}

			console.log(notifications);
			userSocket.emit('notification', notifications);
		});
	});
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});

// https://socket.io/get-started/chat]
// https://developer.github.com/v3/activity/notifications/
// https://www.npmjs.com/package/github-api
// https://stackoverflow.com/questions/17476294/how-to-send-a-message-to-a-particular-client-with-socket-io
