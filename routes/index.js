
/*
 * GET home page.
 */
var fs = require('fs');
//var mongodb = require('mongodb'); 
var User = require('../lib/User');
var Room = require('../lib/Room');
var Log = require('../lib/Log');
var WebStatus = require('../lib/WebStatus');
var RoomModel = require('../lib/RoomModel');
var ChatModel = require('../lib/ChatModel');
var LogModel = require('../lib/LogModel');
var API = require('../lib/api');
var crypto = require('crypto');
var socketServer = require('../lib/socketServer');
var cookie = require("express/node_modules/cookie");

//最大的chatIndex
//{roomid:number}
var maxIndex = {};


module.exports = {

	// 实现 session
	all:function(req, res, next){

		var cookieSelect = null;
		req.session = {};
		if( req.cookies && req.cookies.sid ){

			var a = req.cookies.sid.split("|");

			cookiesSelecter = {
				hexMail:a[0],
				hexPwd:a[1],
				hexRandom:a[2]
			};

			req.cookiesSelecter = cookiesSelecter;

			API.cookieLogin(cookiesSelecter, function( status ){
				req.session.user = status.result;
				next();
			});	

		}else{

			req.cookiesSelecter = null;
			next();

		}  
	  
	},
	authorization:function (data, accept) {

	    if (data.headers.cookie) {
	        // if there is, parse the cookie
	        //这里获取sid, 请重新像更好的办法
	        //console.log( parseJSONCookie(data.headers.cookie) );
	        data.cookies = cookie.parse(data.headers.cookie);
	        // note that you will need to use the same key to grad the
	        // session id, as you specified in the Express setup.
	        if(data.cookies && data.cookies.sid){
	          var a = data.cookies.sid.split("|");

	          var cookiesSelecter = {
	            hexMail:a[0],
	            hexPwd:a[1],
	            hexRandom:a[2]
	          };

	          API.cookieLogin(cookiesSelecter, function( status ){
	          //console.log("socket cookiesSelecter",  status.code );
	            data.sessionUser = status.result.getInfo();
	          }); 

	          //data.sessionID = data.cookie;
	        }
	    } else {
	       // if there isn't, turn down the connection with a message
	       // and leave the function.
	       return accept('No cookie transmitted.', false);
	    }
	    // accept the incoming connection
	    accept(null, true);

	},
	//首页
	index:{

		get:function(req, res){

			var user = req.session.user || null;
			var log = {

			};

			if( user ){

				API.getLog( String(user._id), function( logs ){

					//console.log("logs", logs );
					for(var i=0; i< logs.length; i++){

						if(log[logs[i].info.id] == undefined){

							log[logs[i].info.id] = logs[i].info;

						}
					}
					res.render('index', {user:user, log:log});
				} );
				return ;
			}

			res.render('index', {user:user, log:log});

		},
		post:null

	},
	//聊天页面
	chat:{

		get:function(req, res){

			var i = 0;
			var user = req.session.user ? req.session.user.getInfo() : null;
			var indexData = {
				user:user
			};

			if( user == null ){

				API.createAnonymousUser( function(status, userjson){

					if(status.code == 0){
						user = User.factory( userjson );
						res.setHeader("Set-Cookie", ["sid="+user.toCookie()+";path=/;expires="+new Date("2030") ]);
						indexData.user = user.getInfo();
						intoPage();	
					}else{
						throw " createAnonymousUser error "+ status.code;
					}
				});

			}else{

				intoPage();
			}


			function intoPage(){
				//var i = 0;
				
				var roomkey = req.params.key;
				var roomModel = new RoomModel();
				var chatModel = new ChatModel();

				//这里可以并行查询，但是需要修复以往数据
				API.getRoom({"$or":[{id:roomkey},{name:roomkey}]}, function( status ){

					if(status.code == 0 && status.result ){

						//i++;	
						room = Room.factory( status.result );
						indexData.room = room.getInfo();
						//render();

						step2_1( room );
						step2( room );

					}else{

						res.render("404", {msg:"没有找到对话空间，请再次确认输入。"});
						res.end();

					}

				});
				
				function step2_1( room ){

					var logmodel = new LogModel();
					logmodel.insert( new Log( user._id, "into_room",  room.getInfo() ).toJSON() );

				}

				function step2( room ){

					//roomModel.findOne( {id:roomkey} )// emit --> onfind

					//查找首页数据
					chatModel.on(chatModel.onfind, function(err, chats){
						if(chats){

							indexData.indexChats = chats;
							
						}else{

							indexData.indexChats = [];
						}
						res.render('chat', indexData);
						//render();
					});
					//console.log("step2", room);
					chatModel.findChats( {roomid:room.id }, 10);

					//获取当前 roomid的最大发言 key 
					if( maxIndex[room.id] === undefined ){
						//console.log("查询roomid的最大发言");
						chatModel.count( room.id );
						chatModel.on( chatModel.oncount, function(err, roomid, index){
							//console.log( "oncount", roomid, maxIndex );
							maxIndex[roomid] = index;
							//console.log(maxIndex);

						});
					}

				}	
			}

		},
		// 发布一条信息
		post:function( req, res ){

			var user = req.session.user;

			var model = new ChatModel();
			var text = req.body.text;
			var roomid = req.body.roomid;
			//console.log(text , roomid); 
			if(text && roomid){

				model.on( model.oninsert , function(err, chat){
					//console.log(model.oninert, chat);
					//res.redirect('/'+room.id);
					var data = {
						code:0,
						r:chat
					};
					//分发消息
					socketServer.newChat( chat );
					res.write( JSON.stringify( data ) );
					res.end();

				});

				//
				//console.log(maxIndex[roomid], maxIndex);
				model.create(roomid, text, ++maxIndex[roomid], {id:user._id, name:user.name});
			}else{	
				res.end("{code:-1}", 'utf-8')
			}
		}

	},
	//登陆页面
	sysLogin:{

		get:function( req, res ){
			//var user = req.session ? req.session.user : null;
			var status = new WebStatus().toJSON();
			//status.user = user;
			res.render('sys/login', status );
		},
		// 登录
		post:function(req, res ){

			var expEmail = /./;
			var email = req.body.email;
			var pwd = req.body.pwd;

			var status = new WebStatus();

			if( !expEmail.test( email ) ){

				status.setCode( "-3" );
				status.setMsg( "email 格式错误" );

				res.render('sys/login', status.toJSON() );
				return ;
			};

			//console.log("login form", email, pwd);
			API.loginUser(email, pwd, function( status, userjson ){

			//console.log( "login", user );
				if(status.code == 0){
					//req.session.user = user;
					var user = User.factory( userjson );
					res.setHeader("Set-Cookie", ["sid="+user.toCookie()+";path=/;expires="+new Date("2030") ]);
					res.redirect("/");
					// 登陆成功
				}else{
					res.render("sys/login", status.toJSON() );
					//失败
				}

			});
		}
	},
	//注册页面
	sysReg:{
		get:function(req, res){

			res.render('sys/reg',  new WebStatus().toJSON() );

		},
		post:function(req, res){

			var md5 = null;
			var expEmail = /./;
			var email = req.body.email;
			var name = req.body.name;
			var pwd = req.body.pwd;
			var pwd2 = req.body.pwd2;

			var status = new WebStatus();

			if( !expEmail.test( email ) ){

				status.setCode( "-3" );
				status.setMsg( "email 格式错误" );

				res.render('sys/reg', status.toJSON() );
				return ;
			}

			if( pwd != pwd2 ){

				status.setCode( "-4" );
				status.setMsg( "两次密码不配" );

				res.render('sys/reg', status.toJSON() );
				return ;
			}

			md5 = crypto.createHash('md5');
			md5.update( pwd );
			pwd = md5.digest( 'hex' ) 


			status.setResult({

				email:email,
				pwd:pwd,
				name:name
			});
		
			//检查email是否被注册
			//return ;
			API.checkEmail(email, function( status ){
				//可以注册
				if(status.code == 0){

					var user = new User(email, pwd);
					user.setName( name );
					//创建新用户
					API.createUser( user, function( status, userjson ){

						if(status.code == 0){
							//res.session.user = user;
							var user = User.factory( userjson );
							res.setHeader("Set-Cookie", ["sid="+user.toCookie()+";path=/;expires="+new Date("2030") ]);
							res.render("sys/wellcome", user);
						}else{
							res.render('sys/reg', status.toJSON() );
						}

					});

				}else{
					//应该考虑处理系统错误
					res.render('sys/reg', status.toJSON() );

				}

			});	
		}
	},
	//登出
	sysLoginout:{
		get:function(req, res){
			//req.session.user = null;
			res.setHeader("Set-Cookie", ["sid=0|0|0;path=/;expires="+new Date("2000")]);
			res.redirect('/sys/login');
		},
		post:function(req, res){}
	},
	//创建 对话
	sysCreate:{

		get:null,
		post:function(req, res){
		
			//创建房间的人的ID
			//console.log("create", req.body.topic, req.body.des);
			var masterid = req.session.user._id;//测试时候使用管理员
			if(req.body.topic){

				API.createRoom( req.body.topic, req.body.des, masterid , function(status, roomjson){
					
					var room = Room.factory( roomjson );
					var logmodel = new LogModel();

					logmodel.insert( new Log( masterid, "create_room",  room.getInfo() ).toJSON() );


					if(status.code == 0){
						res.redirect('/'+room.id);
					}else{
						res.redirect('/');
					}

				});
				
			}else{
				res.redirect('/');
			}
		}
	},

	api:{

		//修改当前用户的昵称
		setUserName:function( req, res ){

			var user = req.session.user;
			var name = req.body.name;
			var status = new WebStatus();
			
			res.setHeader("Content-Type" ,"application/json; charset=utf-8");

			//console.log(user, name);
			if( name ){
				//db.bson_serializer.ObjectID.createFromHexString(hex);
				API.updateUser({_id:user._id}, {name:name}, function( status ){

					res.write( status.toString() , "utf-8");
					res.end();

				});

			}else{

				//res.setHeader("Content-Type" ,"application/json; charset=utf-8");
				status.setCode("-1");
				res.write( status.toString(), "utf-8" );
				res.end();
			}

		},
		tmpl:function(req, res){
			//console.log(req);
			var file = req.query.path;
			//console.log("tmpl", "tmpl/"+file, __dirname);
			if(file){
				//var fs = require('fs');
                fs.readFile(__dirname+"/../views/tmpl/"+file, "utf-8", function(err, data){
                	res.setHeader("Content-Type" ,"text/ejs; charset=utf-8");
		            res.end(data);
					//res.sendFile( "tmpl/"+file );
                });
			}else{
				res.write( file + "not defined");
				res.end();
			}
		},

		//修改房间信息
		updateRoom:function(req, res){

			var user = req.session.user;
			var id = req.body.id;

			//验证当前用户是否有修改权限
			API.getRoom({id:id}, function( status ){

				if(status.code == 0){

					var data = status.result;

					//验证成功进入第2步
					if(data.masterId == user._id){
						update();
						return ;
					}

					status.setCode( "403" );

				}

				res.write( status.toString(), "utf-8" );
				res.end();
				

			});



			//第2步修改信息
			function update(){

				var name = req.body.name;
				var topic = req.body.topic;
				var des = req.body.des;

				var status = null;

				//请把验证写得更详细，比如限制最长字符长度与最短字符长度
				if(topic && des){

					API.updateRoom( {id:id}, {
						name:name,
						topic:topic,
						des:des	
					}, function( status ){

						res.write( status.toString(), "utf-8" );
						res.end();
						
					});	
				}else{

					status = new WebStatus();
					status.setCode("-1");
					res.write( status.toString(), "utf-8" );
					res.end();
				}

			}

		},

		// time
		getMore:function(req, res){

			// 下拉数据
			var roomid = req.query.roomid;
			var time = parseInt(req.query.time, 10);
			var limit = req.query.limit || 10;
			var chatModel = new ChatModel();

			chatModel.on(chatModel.onfind, function(err, chats){
				
				var status = new WebStatus();

				if(err){
					status.setCode( "601" );
				}else{
					console.log("getmore", chats);
					status.setResult( chats || [] );
				}

				res.write( status.toString(), "utf-8" );
				res.end();


			});

			chatModel.findChats( {roomid:roomid, time:{"$lt":time} }, 10);
		},

		into:function(req, res){

			var id = req.body.roomid;
			if(id){

				res.redirect("/"+id);

			}else{

				res.redirect("/");
			}
		}
	}
	

};
