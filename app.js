
/**
 * Module dependencies.
 开发原则  先实现功能，允许不合理的编码，效率低下的实现。
*/
var settings = require("./settings");
var util = require("util");
var fs = require("fs");
var express = require('express');
var http = require('http');
var path = require('path');
var routes = require('./routes');

var system = require("./routes/system");
var socketio = require('socket.io');
var socketServer = require("./lib/socketServer");

var app = express();
var server = null;


/**  捕获所有程序错误
process.on('uncaughtException', function( err ){

  var time = Date.now();
  var buffer = new Buffer( util.inspect(err)+"\n" );
  var file = time - time%(24*60*60*1000);
  fs.open(file+".log", "a", function(err, fb){
      fs.write(fb, buffer, 0, buffer.length, null, function(){});
  });
  
});
*/

// app 配置
app.configure(function(){
  app.set('port', settings.serverPort);
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

// create server
server = http.createServer(app);

// socket 服务器
var io  = socketio.listen( server );
//socket connection
io.sockets.on('connection', socketServer.onConnection);
//socket session实现
io.set('authorization', system.authorization);


// ** 服务器启动
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});



