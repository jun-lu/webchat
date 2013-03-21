/**
	为对话房间提供 socket 支持
	socket
*/

var WebStatus = require('./WebStatus');
 
var socketHashList = {

	add:add,
	remove:remove,
	distribute:distribute
};

var userHashList = {
	add:add,
	remove:remove
}

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
function distribute( id, event, chat ){

	var list = this[id];

	for(var i=0; list && i<list.length; i++){

		list[i].emit(event, chat);//.toString()

	}


}


//----
module.exports = {

	onConnection:function( socket ){

		if(socket.handshake.sessionUser ){

			var roomid = null;

			//console.log("onConnection", socket.handshake.sessionUser );
			//console.log( "onConnection", socket.handshake );

			//连接到固定房间
			socket.on("setting", function(data){

				roomid = data.roomid;
				socketHashList.add(roomid, this);
				userHashList.add(roomid, socket.handshake.sessionUser);

				//在线用户列表
				//console.log( "userHashList",  userHashList[roomid].length );
				socket.emit("userlist", userHashList[roomid]);

				//上线通知
				socketHashList.distribute( roomid, "online", socket.handshake.sessionUser);

			});


			//disconnect 中断连接
			socket.on("disconnect", function(){

				socketHashList.remove(roomid, this);
				userHashList.remove(roomid, socket.handshake.sessionUser);
				socketHashList.distribute(roomid, "offline", socket.handshake.sessionUser)

			});

		}else{
			//通知连接用户无法验证，并退出socket
			socket.emit("discard", userHashList[roomid]);
			console.log("socektServer,无法验证当前用户信息，跳出");

		}

	},
	//分发
	newChat:function( chat ){
		socketHashList.distribute(chat.roomid, "newChat", chat);

	},
	roomUpdate:function( room ){

		socketHashList.distribute(room.id, "roomUpdate", room);
	}
};
