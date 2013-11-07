/**
	为vchat.co提供视频服务	
	vchat-rtc.js
*/




var WebSocketServer = require('ws').Server;
var config = require("./config");
var UserModel = require("./lib/UserModel");
var User = require("./lib/User");
var session = require("./routes/session");
var Promise = require("./lib/Promise");
var wss = null;
var socketHashList = {
	list:{},
	//添加到队列
	add:function(roomid, socket){
		var list = this[roomid];
		if( list ){
			list.push( socket );
		}else{
			this[roomid] = [socket];
		}
	},

	//从队列中删除
	remove:function(roomid, socket){
		var list = this[roomid];
		for(var i=0; list && i<list.length; i++){

			if(list[i] == socket){
				list.splice(i, 1);
				break;
			}
		}
	},


	//消息分发
	//发给指定房间的某个人，如果id为空 发给房间的所有人
	distribute:function( roomid, data, id ){

		var list = this[roomid];
		//console.log("distribute start", roomid, id)
		for(var i=0; list && i<list.length; i++){
			if( id == undefined || String(list[i].session.user._id) == id){
				//console.log("distribute ok", roomid, id)
				list[i].send( JSON.stringify(data) );//.toString()
			}
		}

	},
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

wss = new WebSocketServer({
	port:8001
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
	ws.roomid = null;
	ws.on("error", function(){});
	ws.on("close", function(){

		console.log('Close tab',ws.roomid );
		socketHashList.remove( ws.roomid, ws );
		socketHashList.distribute( ws.roomid, {
			type:"offline",
			data:ws.session.user.getPublicInfo(36)
		});
	});

	ws.on("message", function( message ){

		console.log("onmessage", message);
		var socketMessage = JSON.parse( message );
		this.emit( socketMessage.type, socketMessage.data);
		

	});

	ws.on("login", function( data ){
		/**
			data = {
				sid:
				roomid
			}	
		*/
		var sid = data.sid;
		var roomid = data.roomid;
		var promise = new Promise();

		ws.roomid = roomid;
		//验证用户
		promise.then(function(){

			session.verificationSID( sid, function( status ){
			
				if( status.code == 0 ){

					var user = User.factory(status.result);
					ws.id = status.result._id;
					ws.session = {
						user:user
					};

					socketHashList.add( roomid, ws );//加入到在线列表

					ws.send( JSON.stringify(data) );
					promise.ok( user );
				}else{
					ws.send( JSON.stringify({
						type:"login",
						data:null
					}) );
					//ws.setClose();
				}
			});

		});
		//发送在线用户
		promise.then(function( user ){
			//通知所有人，我上线
			socketHashList.distribute(ws.roomid, {
				"type":"online",
				"data":user.getPublicInfo(36)
			});

			ws.send(JSON.stringify({
				type:"onlines",
				data:{
					"connections":socketHashList.getUserList( roomid ),
					"me":user.getPublicInfo(36)
				}
			}));
		});

		promise.start();
	});
	//有人报告offer
	ws.on("send_offer", function( data ){
		var id = data.id;
		//报告给对方我的 对外端口于ip
		socketHashList.distribute(ws.roomid, {
			"type":"receive_offer",
			"data":{
				"sdp":data.sdp,
				"id":ws.id
			}
		}, id);
	});
	//对方受到offer，再报告回来
	ws.on("send_answer", function( data ){
		var id = data.id;
		socketHashList.distribute(ws.roomid, {
			"type":"receive_answer",
			"data":{
				"sdp":data.sdp,
				"id":ws.id
			}
		}, id);
	});

	

	ws.on("send_ice_candidate", function( data ){

		var id = data.id;
		//报告给对方我的 对外端口于ip
		socketHashList.distribute(ws.roomid, {
			"type":"receive_ice_candidate",
			"data":{
				"label":data.label,
				"candidate":data.candidate,
				"id":ws.id
			}
		}, id);

	});

});