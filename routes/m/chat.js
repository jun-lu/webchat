/**
	
	chat
	
	对话页面
*/

var config = require("../../config");
var UserModel = require("../../lib/UserModel");
var RoomModel = require('../../lib/RoomModel');
var ChatModel = require('../../lib/ChatModel');
var LogModel = require('../../lib/LogModel');
var WebStatus = require('../../lib/WebStatus');
var socketServer = require('../../lib/socketServer');
//var maxIndex = {};
var roomLimit = require("../sys/room_limit");


module.exports = {

	
		/**

			对话首页
		
		*/
		get:function(req, res){

			var i = 0;
			var user = req.session.user ? req.session.user : null;
			var time = parseInt(req.query.t) || parseInt(Date.now()/1000) + 1000;
			var indexData = {
				user:user ? user.getInfo() : user
			};

			if( user == null ){

				UserModel.createAnonymousUser( function( status ){

					if(status.code == 0){
						user = status.result;//User.factory( userjson );
						res.setHeader("Set-Cookie", ["sid="+user.toCookie()+";path=/;domain="+config.domain+";expires="+new Date("2030") ]);
						indexData.user = user.getInfo();
						intoPage();
					}else{

						//  创建匿名用户错误
						throw " createAnonymousUser error "+ status.code;
					}
				});

			}else{

				intoPage();
			}


			function intoPage(){
				//var i = 0;
				
				var key = req.params.key;

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
							res.render('m/chat', indexData);

						});


						//创建用户日志
						LogModel.create( user._id, "into_room",  room.getInfo() );

					}else{

						res.status(404).render("404", status.toJSON());
						res.end();
					}


				});
			}

		}
};