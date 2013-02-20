
/**
 * Module dependencies.
 开发原则  先实现功能，允许不合理的编码，效率低下的实现。
 尽量不出现当前能想到的不合理代码结构
 */

//var MongoStore = require('connect-mongo');
var settings = require('./settings');
var express = require('express');
var http = require('http');
var path = require('path');
var routes = require('./routes');
var socketio = require('socket.io');//.listen(server);
var socketServer = require('./lib/socketServer');
//var parseJSONCookie = require("connect").utils.parseJSONCookie;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.cookieParser());
 
  /*  
  app.use(express.session({
    secret: settings.cookieSecret, store: new MongoStore({
        db: settings.db
    })
  }));
  //*/
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.all("*", routes.all);
///*
// index /
app.get('/', routes.index.get);

// chat
app.get('/:key', routes.chat.get);

//登陆
app.get('/sys/login', routes.sysLogin.get);

//登出
app.get('/sys/out', routes.sysLoginout.get);

//注册
app.get('/sys/reg', routes.sysReg.get);

//获取模板
app.get('/sys/tmpl', routes.api.tmpl);

//get more
app.get('/sys/getmore', routes.api.getMore);

// -----------------------

// get /\d+
app.post('/:key', routes.chat.post);

// post 创建对话 /
app.post('/sys/create', routes.sysCreate.post);

// get login
app.post('/sys/login', routes.sysLogin.post);

// get reg
app.post('/sys/reg', routes.sysReg.post);

//修改用户信息
app.post('/sys/set_user_name', routes.api.setUserName);

//修改对话房间信息
app.post('/sys/update_room', routes.api.updateRoom);

//进入一个房间
app.post('/sys/into', routes.api.into);

//创建匿名用户
//app.get('/sys/create_anonymous_user', routesAPI.api.createAnonymousUser);





// server
var server = http.createServer(app);

//socketio
var io  = socketio.listen(server);

//express
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

//socket connection
io.sockets.on('connection', socketServer.onConnection);
//---
io.set('authorization', routes.authorization);

