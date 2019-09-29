var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var github = require('github-api');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var users = {}

io.on('connection', function(socket) {
  console.log('user connected!');
  socket.on('message', function (data) {
	data = JSON.parse(data); 
	setUserAndPass(data);
  	users[data.email] = {data: data, socket: socket}
  });
});

function setUserAndPass(data) {
	let buff = new Buffer(data.token, 'base64');
        let text = buff.toString('ascii').split(':');
        data.username = text[0];
        data.password = text[1];
}

setInterval(function(){ getNotifications() }, 10000);

function getNotifications() {
	Object.keys(users).forEach(function(key) {
  		// var gitToken = users[key].data.token;
  		var userSocket = users[key].socket;

  		var gh = new github({
  			// token: gitToken
			username: users[key].data.username,
			password: users[key].data.password
		});

		var me = gh.getUser();

		me.listNotifications(function(err, notifications) {
			if (err) { 
				return console.log(err);
			}

			console.log(notifications);
			
			notifications.forEach(function(value){
				userSocket.emit('notification', value);
			});
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
