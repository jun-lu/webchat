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
var WebStatus = require('../lib/WebStatus');
var NoticeModel = require('../lib/NoticeModel');
var socketServer = require('../lib/socketServer');
//var maxIndex = {};
var roomLimit = require("./sys/room_limit");

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
			var user = req.session.user ? req.session.user : null;
			var time = parseInt(req.query.t) || parseInt(Date.now()/1000) + 1000;
			var indexData = {
				user:user ? user.getInfo() : user,
				nextTime:"",
				prevTime:parseInt(req.query.t) || ""
			};

			//手机访问
			if(ua.indexOf("Android") != -1 || ua.indexOf("iPhone") != -1 || ua.indexOf("Mobile") != -1){
				res.redirect("/m/"+key);
				return ;
			}

			//["Baiduspider","Googlebot","MSNBot","YoudaoBot","JikeSpider","Sosospider","360Spider"]

			//如果是搜索引擎也不创建匿名用户
			if( user == null){

				UserModel.createAnonymousUser( function( status ){

					if(status.code == 0){
						user = status.result;//User.factory( userjson );
						res.setHeader("Set-Cookie", ["sid="+user.toCookie()+";path=/;domain="+config.domain+";expires="+new Date("2030") ]);
						indexData.user = user.getInfo();
						intoPage();
					}else{
						status.code("500");
						status.setMsg("创建匿名用户错误");
						res.render("error", status.toJSON());	
					}
				});

			}else{

				intoPage();
			}


			function intoPage(){
				//var i = 0;
				
				

				//查找对话房间信息

				RoomModel.idOrNameFind(key, key, function( status ){

					//console.log("idOrNameFind", status);
					if(status.code == "0"){

						var room = status.result;
						var roomid = room.id;

						//房间设置了密码，用户没有权限访问
						if( room.password  && !user.isRoomPasswrod(room.id, room.password) ){
						//if( true ){
							res.redirect("/sys/room_limit?roomid="+room.id);
							return ;
								
						}

						indexData.room = room.getInfo();

						//查找首页数据 
						ChatModel.findChats( roomid , time, 10, function( status ){

							indexData.indexChats = status.result || [];
							indexData.tool = tool;
							indexData.nextTime = status.result && status.result.length ? status.result[status.result.length-1].time : "";
							res.render('chat', indexData);

						});

						//创建用户日志  如果是搜索引擎user信息为空
						if(!isSpiderBot(ua) && user.name){
							//console.log("加入", ua);
							LogModel.create( user._id, "into_room",  room.getInfo(), function(){} );
						}

					}else{
						status.setMsg("没有找到对话，请确认输入");
						res.status(404).render("404", status.toJSON() );
						res.end();
					}


				});
			}

		},
		// 发布一条信息
		post:function( req, res ){

			var user = req.session.user;
			var text = req.body.text;
			var roomid = req.body.roomid;
			var to = req.body.to || null;//针对某条信息的回复 源信息id
			var status = new WebStatus();
			
			if( text.length == 0  || text.length > 5000 ){

				status.setCode("-1");
				status.addMsg("内容范围应该在0-5000之间");
				res.write( status.toString() );
				res.end();
				return ;

			};


			if(text && roomid && (to == null || to.length == 24)){

				var userjson = {

					"uid":user._id,
					"uname":user.name,
					"uavatar":user.getGravatar()

				};

				ChatModel.create(roomid, text, userjson, to, function( status ){

					res.write( status.toString(), "utf-8" );
					res.end();

					//console.log("create", status );
					if(status.code == "0"){
						var chat = status.result;
						//console.log( "chat", chat );
						socketServer.newChat( chat );

						//添加提醒
						if(to){
							ChatModel.findOne(to, function( status ){
								//自己回复自己不加入提醒
								if(status.code == "0" && user._id != status.result.uid){
									NoticeModel.create(1, user._id, status.result.uid, roomid, to, chat[0]._id.toString());
								}
							});
						}
					}

				});
				
			}else{
				status.setCode("-1");
				res.write( status.toString() );
				res.end();
			}

		}


};