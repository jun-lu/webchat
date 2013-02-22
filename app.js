
/**
 * Module dependencies.
 开发原则  先实现功能，允许不合理的编码，效率低下的实现。
 尽量不出现当前能想到的不合理代码结构
 */

var express = require('express');
var http = require('http');
var path = require('path');
var routes = require('./routes');

var system = require("./routes/system");
var socketio = require('socket.io');
var socketServer = require("./lib/socketServer");

var app = express();
var server = null;

app.configure(function(){
  app.set('port', process.env.PORT || 80);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.cookieParser());

  app.use(express.static(path.join(__dirname, 'public'), {maxAge:new Date("2030").getTime()}));

  //路由
  routes( app );

});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//启动服务器
server = http.createServer(app);


var io  = socketio.listen( server );
//socket connection
io.sockets.on('connection', socketServer.onConnection);
//---
io.set('authorization', system.authorization);



server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});






