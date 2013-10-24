/**
	
	chat
	
	对话页面
*/

var config = require("../config");
var tool = require("../lib/tools");
var UserModel = require("../lib/UserModel");
var RoomModel = require('../lib/RoomModel');
var ChatModel = require('../lib/ChatModel');
var LogModel = require('../lib/LogModel');
var ContactModel = require('../lib/ContactModel');
var WebStatus = require('../lib/WebStatus');
var NoticeModel = require('../lib/NoticeModel');
var socketServerRoutes = require('./socketServerRoutes');
var roomLimit = require("./sys/room_limit");
var Promise = require("../lib/Promise");
var Cookie = require("../lib/Cookie");
var spiderAU = ["Baiduspider","Googlebot","MSNBot","YoudaoBot","JikeSpider","Sosospider","360Spider"];

tool.markdown = require('../lib/markdown');

function isSpiderBot( ua ){

	for(var i=0; i<spiderAU.length; i++){
		if( ua.indexOf( spiderAU[i] ) != -1 ){

			return true;

		};
	}

	return false;

};

module.exports = {

	
		/**

			对话首页
		
		*/
		get:function(req, res){

			var ua = req.header("User-Agent");
			var i = 0;
			var key = req.params.key;
			var user = req.session.user;
			var time = parseInt(req.query.t) || parseInt(Date.now()/1000) + 1000;

			var output = {
				room:null,
				user : user ? user.getInfo() : null,
				nextTime:"",
				prevTime:parseInt(req.query.t) || "",
				tool:tool
			}

			var promise = new Promise();


			//查找对话，确定权限
			promise.then(function(){

				//查找对话房间信息
				RoomModel.idOrNameFind(key, key, function( status ){

					//console.log("idOrNameFind", status);
					if(status.code == "0" && status.result){
						output.room = status.result;
						promise.ok( );

					}else{
						status.setMsg("没有找到对话，请确认输入");
						res.status(404).render("404", status.toJSON() );
						//res.end();
					}


				});

			});
			//如果用户不存在创建匿名用户
			promise.add(function(){

				//如果是搜索引擎也不创建匿名用户
				if( user == null){

					UserModel.createAnonymousUser( function( status ){

						if(status.code == 0){
							user = status.result;//User.factory( userjson );
							var cookie = new Cookie("sid", user.toCookie());
							cookie.setExpires(new Date("2030"));
							res.setHeader("Set-Cookie", [cookie.toString()]);
							output.user = user.getInfo();
							promise.ok();
						}else{
							status.code("500");
							status.setMsg("创建匿名用户错误");
							res.render("error", status.toJSON());	
						}
					});

				}else{
					promise.ok();
					//intoPage();
				}


			});


			promise.then(function(){

				var room = output.room;
				var roomid = room.id;

				if( user.name == "" ){
					res.render("set_nickname", output);
					return ;
				}

				//房间设置了密码，用户没有权限访问
				if( room.password  && !user.isRoomPasswrod(room.id, room.password) ){
					res.redirect("/room_limit?roomid="+room.id);
					return ;
						
				}

				//output.room = room.getInfo();

				//查找首页数据 
				ChatModel.findChats( roomid , time, 30, function( status ){

					output.indexChats = status.result || [];
					output.indexChats.reverse();
					output.nextTime = status.result && status.result.length ? status.result[status.result.length-1].time : "";
					promise.ok( roomid );
					//res.render('chat', output);

				});
				//console.log( "room", room )	
				//创建用户日志  如果是搜索引擎user信息为空
				if(!isSpiderBot(ua) && user.name){
					//console.log("加入", ua);
					LogModel.create( user._id, "into_room",  room, function(){} );
				}

			});

			
			promise.then(function( roomid ){

				ChatModel.count({roomid:roomid, to:"*"}, function( status ){

					output.chats_count = status.result;
					//console.log( output );
					res.render('chat', output);
				});
			});

			promise.start();

		},
		test:function(req, res){

			var output = {

				user:{

					_id:Date.now(),
					name:"abcd"
				},
				room:{
					id:req.params.key
				}
			}

			
			res.render('test', output);

			//promise.start();

		},
		// 发布一条信息
		post:function( req, res ){
		
			res.setHeader('Access-Control-Allow-Credentials', 'true');
			res.setHeader("Access-Control-Allow-Origin", req.headers.origin);


			var user = req.session.user.getInfo();
			var text = String(req.body.text);
			var roomid = req.body.roomid;
			var to = req.body.to || "*";
			var aim = req.body.aim || null;//针对某条信息的回复 源信息id
			var status = new WebStatus();
			var promise;

			if( !user ){

				res.end( new WebStatus("304").setMsg("not login").toString() );
				return ;
			}

			if( text.length == 0  || text.length > 5000 ){

				status.setCode("-1");
				status.addMsg("内容范围应该在0-5000之间");
				res.write( status.toString() );
				res.end();
				return ;

			};

			promise = new Promise();

			promise.then(function(){

				ChatModel.create(roomid, text, to, user._id, aim , function( status ){

					res.write( status.toString(), "utf-8" );
					res.end();

					if(status.code == "0"){
						var chat = status.result[0];
						//socket分发
						socketServerRoutes.distribute( chat.roomid, chat );

						if( aim ){
							//提醒与建立用户关系
							promise.ok( chat );
						}
					}

				});

			});


			promise.then(function( chat ){

				ChatModel.findOne({_id:ChatModel.objectId(aim)}, function( status ){
					//自己回复自己不加入提醒
					if(status.code == "0" && user._id != status.result.from){
						//console.log("ad thermongraph");
						//加入提醒
						NoticeModel.create(1, user._id, status.result.from, roomid, to, chat._id.toString());
						//加入关系
						ContactModel.addThermograph(user._id, status.result.from, 1);
					}
				});

			});
			
			promise.start();

		}
};