/**
	
	chat
	
	对话页面
*/

var UserModel = require("../lib/UserModel");
var RoomModel = require('../lib/RoomModel');
var ChatModel = require('../lib/ChatModel');
var LogModel = require('../lib/LogModel');

var socketServer = require('../lib/socketServer');

var maxIndex = {};



module.exports = {

	
		/**

			对话首页
		
		*/
		get:function(req, res){

			var i = 0;
			var user = req.session.user ? req.session.user.getInfo() : null;
			var indexData = {
				user:user
			};

			if( user == null ){

				UserModel.createAnonymousUser( function( status ){

					if(status.code == 0){
						user = status.result;//User.factory( userjson );
						res.setHeader("Set-Cookie", ["sid="+user.toCookie()+";path=/;expires="+new Date("2030") ]);
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
						indexData.room = room.getInfo();


						//查找首页数据
						ChatModel.findChats( roomid , 10, function( status ){

							indexData.indexChats = status.result || [];
							res.render('chat', indexData);

						});



						//读取发言id
						if( maxIndex[room.id] === undefined ){
							ChatModel.countChats( roomid, function( status ){
								//console.log("countChats", status);
								if(status.code == "0"){
									maxIndex[roomid] = status.result;
								}

							});
						}

						//创建用户日志
						LogModel.create( user._id, "into_room",  room.getInfo() );

					}else{

						res.render("404", {msg:"没有找到对话空间，请再次确认输入。"});
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


			if(text && roomid){

				ChatModel.create(roomid, text, ++maxIndex[roomid], {id:user._id, name:user.name}, function( status ){

					//console.log("create", status );
					if(status.code == "0"){
						var chat = status.result;
						socketServer.newChat( chat );
					}

					res.write( status.toString(), "utf-8" );
					res.end();

				});

			}else{
				res.end("{code:-1}", 'utf-8')
			}

		}


};