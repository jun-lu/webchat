
/**
 * Module dependencies.
*/

var d = require('domain').create();
var fs = require("fs");

d.on("error", function( err ){

  fs.appendFile("log.txt", "\r\n"+new Date().toString()+"\r\n"+err.stack+"\r\n", function(){});

});

d.run(function(){
  
  var config = require("./config");

  var WebSocket = require("ws");
  var http = require('http');
  var path = require('path');
  var util = require("util");

  var express = require('express');

  var httpServerRoutes = require('./routes/httpServerRoutes');
  var socketServerRoutes = require('./routes/socketServerRoutes');

  var app = express();

  // app 配置
  app.configure(function(){
  	
    app.set('port', config.serverPort || 80);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');

    //app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.compress());//gzip,deflate,sdch 
    //自控制图片上传
    app.use(express.bodyParser({
      uploadDir:config.uploadDir,
      keepExtensions:true,
      limit:1024*1024*10//, 
     // defer:true
    }));

    app.use(express.methodOverride());

    app.use(express.cookieParser());

    app.use(express.static(path.join(__dirname, 'public'), {maxAge:new Date("2030").getTime()}));

    //路由
    httpServerRoutes( app );

  });

  /**
  	开发者模式
  
  app.configure('development', function(){
    app.use(express.errorHandler());
  });
*/
  // create server
  var server = http.createServer(app);

  //socket server
  socketServerRoutes.init( server );

  // ** 服务器启动
  server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });

})
