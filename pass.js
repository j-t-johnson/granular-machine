var app = require('express')();
var fs = require('fs');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get(/^(.*)$/, function(req, res){
	//if a specific file is requested, pass it on through...
	//note; this seems to be required for script files, too...
	res.sendFile(__dirname + req.params[0]);
});

console.log('Server is running.');
http.listen(3000, function(){
	console.log('listening on *:3000');
});
