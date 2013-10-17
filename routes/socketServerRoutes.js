
/**
	
	传入 http server
	
*/

var WebSocketServer = require('ws').Server;
var config = require("../config");
var UserModel = require("../lib/UserModel");
var session = require("./session");
var wss = null;
var clientid = 0;


var socketHashList = {
	add:add,
	remove:remove,
	distribute:distribute,
	getUserList:function( roomid ){
		var list = this[roomid] || [];
		var userlist = [];
		var map = {};
		var user = null;
		for(var i=0; i<list.length; i++){
			user = list[i].session.user.getPublicInfo(36);
			if( map[user._id] == undefined){//去重复
				userlist.push( user );
				map[user._id] = 1;
			}
		}
		return userlist;
	},
	//如果在多个客户端登录会有同一个人的多个连接
	hasOnline:function(roomid, _id){

		var list = this[roomid] || [];
		for(var i=0; i<list.length; i++){
			if( list[i].session.user._id ==  _id){
				return true;
			}
		}
		return false;

	}
};



/**  
	
	{
		type:""//事件event
		data:{}//数据对象

	}
	
*/

module.exports = {
	init:function( httpServer ){

		wss = new WebSocketServer({
			server:httpServer
		});

		
	
		wss.on("error", function(){
			console.log("err", arguments)
		});
		/**
			识别用户身份

		*/
		wss.on('connection', function( ws ){
			//console.log("123456789")
			//console.log("ws", ws.upgradeReq);
			//ws.session.user.clientid = ++clientid;
			ws.on("error", function(){});
			//验证用户身份
			session.verificationUserAccount( ws.upgradeReq, function( status ){

				//console.log("status", status);

				if( status.code != "0" ){

					ws.send(JSON.stringify({type:"connection", data:status.toJSON()}));
					return ;
				}

				//console.log( "status", status );
				ws.session = {};
				ws.session.user = status.result;

				ws.on('message', function( message ){
					//console.log( "message", JSON.parse(message) );
					var socketMessage = JSON.parse( message );
					this.emit( socketMessage.type, socketMessage.data);
					

				});

				ws.on('close', function( data ){
					socketHashList.remove( this.session.roomid, this );

					//需要判断当前用户是否保持了多个socket连接。

					var haseoline = socketHashList.hasOnline(this.session.roomid, this.session.user._id);
					//console.log("haseoline", this.session.roomid, ws.session.user._id, haseoline);
					if( haseoline == false ){
						socketHashList.distribute( this.session.roomid, {
							type:"off-line",
							data:this.session.user.getPublicInfo()
						});
					}
				});

				//新消息
				ws.on('chat', function( data ){
					socketHashList.distribute( this.session.roomid, {
						type:"new-chat",
						data:data
					});
				});

				//登录一个房间
				ws.on('login', function( data ){

					//console.log( "roomid", data.roomid );
					this.session.roomid = data.roomid;
					//给当前连接推送在线用户列表
					var haseoline = socketHashList.hasOnline(this.session.roomid, this.session.user._id);
					socketHashList.add( data.roomid, this);
					this.send( JSON.stringify({type:"user-list", data:socketHashList.getUserList( data.roomid )}) );
					//通知其他人他上线
					if(haseoline == false){
						socketHashList.distribute( data.roomid, {
							type:"on-line",
							data:ws.session.user.getPublicInfo(36)
						});
					}

				});

				ws.send(JSON.stringify({type:"connection",data:status.toJSON()}));

			});

		});
		
	},
	distribute:function( roomid, data){
		//console.log("distribute",roomid, data);
		socketHashList.distribute( roomid, {
			type:"new-chat",
			data:data
		});
	}
};

//添加到队列
function add( id, socket){

	var list = this[id];

	if( list ){
		list.push( socket );
	}else{
		this[id] = [socket];
	}

}

//从队列中删除
function remove(id, socket){

	var list = this[id];
	for(var i=0; list && i<list.length; i++){

		if(list[i] == socket){
			list.splice(i, 1);
			break;
		}

	}

}


//消息分发
function distribute( id, data ){

	var list = this[id];

	for(var i=0; list && i<list.length; i++){

		list[i].send( JSON.stringify(data) );//.toString()

	}


}