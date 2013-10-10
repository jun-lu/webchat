
/*
	分发请求到各个模块
*/

var session = require("./session");
//主页
var home = require("./home");
//对话页面
var chat = require("./chat");
//登录
var sysLogin = require("./sys/login");
//登出
var sysOut = require("./sys/out");
//注册
var sysReg = require("./sys/register");
//create
var sysCreate = require("./sys/create");
//into
var sysInto = require("./sys/into");
//into
var roomLimit = require("./sys/room_limit");

var personal = require("./user/personal");

var weiboLogin = require("./sys/weibo_login");

var qqLogin = require("./sys/qq_login");

//信息详细页面
var detail = require("./d/detail");

var mobile = require("./m/chat");
// 提供给前台的ajax api 
var apiRoutes = require("./api/index");

var socketServer = require("../lib/socketServer");

var notice = require("./user/notice");

var photoIndex = require('./p/photoIndex');
var photo = require('./p/photo');
var albums = require('./p/albums');


function CORS_OPTIONS( req, res ){
	res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
	res.setHeader('Access-Control-Allow-Credentials', true);
	res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
	res.end();

}

module.exports = function ( app ) {


	//处理 session
	app.all("*", session.httpSession);
	
	
	/**
		基本页面
	*/
		// index /
		app.get('/', home.get);
		app.get('/home', home.index);

		app.get('/recomment', require("./recomment").get);

		app.get('/recently', require("./recently").get);

		app.get('/a/test', function(req, res){
			res.render("test", {});
		});

		app.get('/c/chat-js', function(req, res){

			var user = req.session.user;

			var output = {
				user:user ? user.getInfo() : null
			};

			res.render("c/chat", output);

		});

		// chat
		app.get('/t/:key', chat.get);
		
		// mobile chat page
		app.get('/m/:key', mobile.get);
		
		
		//登录
		app.get('/login', sysLogin.get);
		
		//登出
		app.get('/out', sysOut.get);
		
		//注册
		app.get('/reg', sysReg.get);

		//单个信息页面
		app.get('/d/:_id', detail.get);
		
		//ie
		app.get('/ie', function(req, res){
			res.render("ie.ejs");
			res.end();
		});


		//weibo login
		app.get('/sys/weibo_login', weiboLogin.get);
		
		//qq登录
		app.get('/sys/qq_login', qqLogin.get);
		
		
	/** 
		数据提交
	
	*/
	
		//对话发送信息
		app.options('/api/post', CORS_OPTIONS);

		app.post('/api/post', chat.post);
		//app.post('/post', chat.post);

		// post 创建对话 /
		//app.post('/sys/create', sysCreate.post);
		// post 创建对话 /
		app.get('/create-topic', require("./sys/create-topic").get);

		// get login
		app.post('/login', sysLogin.post);

		// get reg
		app.post('/reg', sysReg.post);

		//输入房间密码
		app.get('/room_limit', roomLimit.get);
		//输入房间密码
		app.post('/room_limit', roomLimit.post);

		//主页
		app.get('/user/home',require("./user/home").get);
		//用户提醒
		app.get('/user/notice',require("./user/notice").get);
		//访问记录
		app.get('/user/topic',require("./user/topic").get);
		//绑定email
		app.get('/user/bind-mail',require("./user/bind-mail").get);
		//设置头像
		app.get('/user/edit-avatar',require("./user/edit-avatar").get);
		//设置信息
		app.get('/user/edit-info',require("./user/edit-info").get);

		//用户个人页面
		app.get('/user/:key', personal.get);

	/**
		/p/
		图片模块
	*/
		app.get('/p/index', function( req, res ){
			res.write("页面建设中","utf-8");
			//res.end();
		});
		
		
		// albums.get 
		app.get('/p/r/:albums/page/:page', albums.view);
		//albums.createView
		app.get('/p/create-albums/:roomid', albums.createView);
		//albums.post
		app.post('/p/create-albums', albums.create);
		
		
		// photo.get
		app.get('/p/r/:albums/:photo', photo.view);
		// photo.image /p/v/:albums/:photo[\.\w+]
		app.get('/p/v/:dir/:photo', photo.image);
		
		//photo.createView
		app.get('/p/create-photo/:albums', photo.createView);
		//普通上传
		app.get('/p/create-photo-2/:albums', photo.createView2);
		//photo.post
		app.post('/p/create-photo', photo.create);

		// photoIndex.get
		app.get('/p/:roomId', photoIndex.get);


		//15号接口
		app.post('/p/sys/delete-photo', photo.deletePhoto);


		// ajax api routes
		apiRoutes( app );

	
};

