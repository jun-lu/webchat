
/*
 * GET home page.
 */
var WebStatus = require('../lib/WebStatus');
var RoomModel = require('../lib/RoomModel');
var ChatModel = require('../lib/ChatModel');
var API = require('../lib/api');
//最大的chatIndex
//{roomid:number}
var maxIndex = {};


module.exports = {

	index:{

		get:function(req, res){

			res.render('index', {user:req.session.user});

		},
		post:null

	},
	chat:{

		get:function(req, res){

			var user = req.session.user;

			var i = 0;
			var indexData = {
				user:user
			};
			var roomkey = req.params.key;
			var roomModel = new RoomModel();
			var chatModel = new ChatModel();

			//查找房间信息
			roomModel.on( roomModel.onfindOne , function(err, room){

				i++;
				console.log( "room info", err, room );
				if( room ){
					//res.render('chat', room);
					indexData.topic = room.topic;
					indexData.des = room.des;
					indexData.onlineUser = room.onlineUser;
					indexData.id = room.id;
					
					render();
				}else{
					//没有查到到房间
					res.send(404);
					res.end();
				}

			});

			roomModel.findOne( {id: Number(roomkey)} )// emit --> onfind

			// 查找首页数据
			chatModel.on(chatModel.onfind, function(err, chats){
				console.log("chat data ok");
				i++;
				if(chats){

					indexData.indexChats = chats;
					
				}
				render();
			});

			chatModel.find( {roomid:roomkey} );

			//获取当前 roomid的最大发言 key 
			//console.log("maxIndex", maxIndex, maxIndex[roomkey] );
			if( maxIndex[roomkey] === undefined ){
				//console.log("查询roomid的最大发言");
				chatModel.count( roomkey );
				chatModel.on( chatModel.oncount, function(err, roomid, index){
					//console.log( "oncount", roomid, maxIndex );
					maxIndex[roomid] = index;
					//console.log(maxIndex);

				});
			}


			function render(){
				//console.log("print i:", i , i ==2 );
				if( i == 2){

					res.render('chat', indexData);
					//res.end();
				}

			}

		},
		post:function( req, res ){

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

					res.write( JSON.stringify( data ) );
					res.end();

				});

				//
				console.log(maxIndex[roomid], maxIndex);
				model.create(roomid, text, ++maxIndex[roomid], {id:1, name:"lujun"});
			}else{	
				res.end("{code:-1}", 'utf-8')
			}
		}

	},
	sysLogin:{

		get:function( req, res ){

			res.render('sys/login', new WebStatus().toJSON() );
		},
		post:function(req, res){}

	},

	sysReg:{
		get:function(req, res){

			res.render('sys/reg',  new WebStatus().toJSON() );

		},
		post:function(req, res){}
	},
	sysLoginout:{

		get:function(req, res){

			req.session.user = null;
			res.redirect('/sys/login');

		},
		post:null

	},
	sysCreate:{

		get:null,
		post:function(req, res){
		
			//创建房间的人的ID
			//console.log("create", req.body.topic, req.body.des);
			var masterid = 1;//req.session.user._id;//测试时候使用管理员
			if(req.body.topic){

				API.createRoom( req.body.topic, req.body.des, masterid , function(status, room){
				
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
	}

};
