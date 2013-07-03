
/**
	
	传入 http server
	
*/

var WebSocketServer = require('ws').Server;
var config = require("../config");
var UserModel = require("../lib/UserModel");
var session = require("./session");
var wss = null;


var socketHashList = {
	add:add,
	remove:remove,
	distribute:distribute,
	getUserList:function( roomid ){
		var list = this[roomid];
		var userlist = [];
		for(var i=0; i<list.length; i++){
			userlist.push( list[i].session.user.getPublicInfo() );
		}
		return userlist;
	}
};



/**  
	
	{
		type:""//事件event
		data:{}//数据对象

	}
	
*/

module.exports = {
	init:function( server ){

		wss = new WebSocketServer({
			//port:8080,
			server:server//,
			//host:'sys/chat-server'
		});
		/**
			识别用户身份

		*/
		wss.on('connection', function( ws ){

			//console.log("ws", ws.upgradeReq);
			session.verificationUserAccount( ws.upgradeReq, function( status ){

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
					socketHashList.distribute( this.session.roomid, {

						type:"off-line",
						data:this.session.user.getPublicInfo()

					});
				});

				//新消息
				ws.on('chat', function( data ){

					console.log( 'chat', data , this.session.roomid);
					socketHashList.distribute( this.session.roomid, {
						type:"new-chat",
						data:data
					});
				});

				//登录一个房间
				ws.on('login', function( data ){

					//console.log( "roomid", data.roomid );
					this.session.roomid = data.roomid;
					socketHashList.add( data.roomid, this);

					//给当前连接推送在线用户列表
					this.send( JSON.stringify({type:"user-list", data:socketHashList.getUserList( data.roomid )}) );

					//通知其他人他上线
					socketHashList.distribute( data.roomid, {
						type:"on-line",
						data:socketHashList.getUserList( data.roomid )
					});

				});

				ws.send(JSON.stringify({type:"connection",data:null}));

			});

		});
	},
	distribute:function( roomid, data){
		console.log("distribute",roomid, data);
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