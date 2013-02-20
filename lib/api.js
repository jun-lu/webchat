
/*
 * GET home page.
 */

var WebStatus = require('../lib/WebStatus');

var User = require('../lib/User');
var UserModel = require('../lib/UserModel');

var Room = require('../lib/Room');
var RoomModel = require('../lib/RoomModel');


var Log = require('../lib/Log');
var LogModel = require('../lib/LogModel');

var crypto = require('crypto');

var API = {

	/* 检查email是否可以注册 */
	checkEmail:function( mail, callback){

		//检查email是否被注册
		var userModel = new UserModel();
		callback = callback || function(){};

		userModel.on(userModel.onfindOne, function(err, data){

			var status = new WebStatus();

			if(err){

				status.setCode( "601" );
				callback( status );
				return;
			}

			//用户已经存在
			console.log("checkEmail", err, data);
			if( data && data.mail ){

				status.setCode("-5");
				status.setMsg("此email已经被使用了");
				//res.render('sys/reg', status.toJSON() );

				callback( status );
				return ;

			}

			callback( status );


		});

		userModel.checkEmail( mail );


	},
	loginUser:function(mail, pwd, callback){

		//检查email是否被注册
		

		var userModel = new UserModel();
		var md5 = crypto.createHash('md5');
		var user = null;
		
		md5.update( pwd );
		pwd = md5.digest( 'hex' );

		user = new User(mail, pwd);

		callback = callback || function(){};

		userModel.on(userModel.onfindOne, function(err, data){

			var status = new WebStatus();
			//console.log( "query user", data );
			if(err){

				status.setCode( "601" );
				callback( status );
				return;
			}

			//用户已经存在
			
			if( data == null ){

				status.setCode("-10");
				status.setMsg("用户名或密码错误");
				callback( status );
				return ;
			};

			if( data && data.mail ){

				status.setMsg("用户名密码验证通过");
				callback( status, data );
				return ;
			}
			throw "有些错误";
		});

		userModel.findOne( user.loginSelecter() );


	},
	//cookie自动登陆
	//hexMail, hexPwd, hexRandom
	cookieLogin:function( cookieSelecter, callback){

		//console.log( cookieSelecter );
		var userModel = new UserModel();

		userModel.on(userModel.onfindOne, function(err, userjson){

			//console.log( userjson );
			var status = new WebStatus();
			status.setCode("-1");

			if(err) {
				console.log("error", err);
				throw err
			};

			if(userjson && userjson.mail){
				status.setCode( "0" );
				status.setResult( User.factory(userjson) );
			}

			callback( status );
		});

		userModel.findOne( cookieSelecter );


	},
	/*创建用户*/
	createUser:function(user, callback){

		

		var userModel = new UserModel();

		userModel.on(userModel.oninsert, function(err, data){

			var status = new WebStatus();

			if(err){

				status.setCode( "601" );
				callback( status );
				return;
			}

			callback( status,  data);

		});


		userModel.create( user );

		

	},
	/** 创建对话 */
	createRoom:function(topic, des, masterid, callback){

		var model = new RoomModel();
		var room = new Room( topic, des, masterid);

		model.on( model.oninsert , function(err, data){

			var status = new WebStatus();

			if(err){

				status.setCode( "601" );
				callback( status );
				return;
			}

			callback( status,  data);

		});
		model.create( room );
		//res.end("请正确提交表单");
	},
	//创建匿名用户
	createAnonymousUser:function( callback ){

		//req.setHeader("cookie", [""]);

		var user = null;
		var mail = String( Date.now() );
		var pwd = mail;
		var md5 = crypto.createHash('md5');

		md5.update( pwd );
		pwd = md5.digest( 'hex' );

		user = new User( mail, pwd );
		
		API.createUser( user, callback);


	},
	updateUser:function(selecter, seter, callback){

		var model = new UserModel();
		model.on( model.onupdate , function(err, data){

			var status = new WebStatus();

			if(err){

				status.setCode( "601" );
				
			}else{

				status.setCode( "0" );
				status.setResult( data );
			}

			callback( status );

		});
		model.update( selecter,  seter);

	},

	updateRoom:function(selecter, seter, callback){

		var model = new RoomModel();
		model.on( model.onupdate, function(err, data){

			console.log("onupdate", err, data);
			var status = new WebStatus();
			if( err ){

				status.setCode( "601" );
			}else{

				status.setCode("0");
				status.setResult( data );

			}

			callback( status );
		});

		model.update( selecter, seter );
	},

	getRoom:function( selecter, callback ){

		var roomModel = new RoomModel();

		//查找房间信息
		roomModel.on( roomModel.onfindOne , function(err, data){

			var status = new WebStatus();
			if( err ){

				status.setCode( "601" );

			}else{

				if(data != null){
					status.setCode("0");
					status.setResult( data );
				}else{

					status.setCode("404");
				}
			}

			callback( status );

		});

		roomModel.findOne( selecter )// emit --> onfind
	},

	getLog:function( id, callback ){

		var logmodel = new LogModel();

		logmodel.on(logmodel.onfind, function( err, logjsons ){

			var logs = [], i=0;
			//console.log( "onfind", logjsons );
			if(logjsons != null){

				for(;i<logjsons.length; i++){

					logs.push( Log.factory( logjsons[i] ) );
				}

			}

			callback( logs );

		})

		logmodel.findLog({id:id, "$or":[{location:'into_room'}, {location:'create_room'}]})
	}
};


module.exports = API;
