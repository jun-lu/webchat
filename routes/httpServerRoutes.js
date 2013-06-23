
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
var api = require("./api/api");

var socketServer = require("../lib/socketServer");

var socketio = require('socket.io');

var SystemMail = require("../lib/SystemMail");

var admin = require("./sys/admin");

var notice = require("./user/notice");

var photoIndex = require('./p/photoIndex');
var photo = require('./p/photo');
var albums = require('./p/albums');



module.exports = function ( app ) {


	//处理 session
	app.all("*", session.httpSession);
	
	
	/**
		基本页面
	*/
		// index /
		app.get('/', home.get);

		// chat
		app.get('/:key', chat.get);
		
		// mobile chat page
		app.get('/m/:key', mobile.get);
		
		
		//登录
		app.get('/sys/login', sysLogin.get);
		
		//登出
		app.get('/sys/out', sysOut.get);
		
		//注册
		app.get('/sys/reg', sysReg.get);

		//单个信息页面
		app.get('/d/:_id', detail.get);
		
		//ie
		app.get('/sys/ie', function(req, res){
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
		app.post('/sys/post', chat.post);

		// post 创建对话 /
		app.post('/sys/create', sysCreate.post);

		// get login
		app.post('/sys/login', sysLogin.post);

		// get reg
		app.post('/sys/reg', sysReg.post);

		//进入一个房间
		app.post('/sys/into', sysInto.post);

		//输入房间密码
		app.get('/sys/room_limit', roomLimit.get);

		//用户提醒
		app.get('/user/notices',notice.get);

		//用户个人页面
		app.get('/user/:key', personal.get);

	

	

	/**
		ajax api 
	*/
	
		//获取模板
		app.get('/sys/tmpl', api.getTmpl);
		

		//获取某房间更多chat
		app.get('/sys/getmore', api.getMore);

		//修改用户信息
		app.post('/sys/set_user_name', api.setUserName);
		//输入房间密码
		app.post('/sys/room_limit', roomLimit.post);

		//修改对话房间信息
		app.post('/sys/room_update', api.updateRoom);

		//匿名用户绑定email  bindmail
		app.post('/sys/bindmail', api.bindMail);
		//获取我的活动记录
		app.get('/sys/ichats', api.ichats);
		//检查用户名是否注册
		app.get('/sys/checkmail', api.checkMailIsReg);
		//修改用户头像
		app.post('/sys/set_avatar', api.setAvatar);
		//检查roomKey是否被注册
		app.get('/sys/check_room_key', api.checkRoomKey);
		//读取房间历史
		app.get('/sys/history', api.getHistory);
		//修改用户的介绍
		app.post('/sys/user_summary', api.userSummary);
		//12号接口
		app.get('/sys/notice_count', api.noticeCount);
		//13号接口
		app.get('/sys/notice_list', api.noticeList);
		//14号接口
		app.post('/sys/notice_status', api.noticeStauts);
		
	
	/**
		/p/
		图片模块
	*/
		app.get('/p/index', function( req, res ){
			res.write("页面建设中","utf-8");
			res.end();
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
		//16号接口
		//app.post('/p/sys/delete-albums', albums.deleteAlbums);

	
};

