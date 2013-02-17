
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

var MongoStore = require('connect-mongo')(express);


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
 
  ///*  
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
//app.post('/sys/update_user', routs.api.updateUser);


//创建匿名用户
//app.get('/sys/create_anonymous_user', routesAPI.api.createAnonymousUser);






http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
