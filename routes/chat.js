/**
	
	chat
	
	对话页面
*/
var Log = require('../lib/Log');
var User = require('../lib/User');
var Room = require('../lib/Room');
var Chat = require('../lib/Chat');

var RoomModel = require('../lib/RoomModel');
var ChatModel = require('../lib/ChatModel');
var LogModel = require('../lib/LogModel');

var API = require("../lib/api");
var maxIndex = {};


module.exports = {

	
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


};