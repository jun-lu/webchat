
/**
	
	传入 http server
	
*/

var socketio = require('socket.io');
var cookie = require("express/node_modules/cookie");

var session = require("./session");
var socketServer = require("../lib/socketServer");
var UserModel = require("../lib/UserModel");




module.exports = function( server ){
	
	// socket 服务器
	var io  = socketio.listen( server );

	//socket connection
	io.sockets.on('connection', socketServer.onConnection);

	//socket session实现
	io.set('authorization', session.socketSession);


}