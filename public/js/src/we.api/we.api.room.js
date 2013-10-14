/***

	 API


*/

WE.api = WE.api || {};


WE.api.RoomModel = function(){

	this.postUrl = "/api/post";//直接提交到当前路径
	
	this.updateRoomURL = "/api/room-update";
	this.historyListURL = "/api/room-visitors-get";
	this.uniqueKeyURL = "/api/room-key-verify";
	this.getMoreURL = '/api/room-chat-get';
	this.createRoomURL = '/api/room-create';
	this.searchRoomURL = '/api/room-search';

	this.inviteRoomURL = '/api/room-inviteh';
};

WE.api.RoomModel.prototype = WE.BaseModel.prototype;

// 手机post
WE.api.RoomModel.prototype.mpostChat = function( roomid, text, aim ){
	var param = { roomid:roomid, text:text};
	if(aim){
		param.aim = aim;
	}
	param.to = "*";

	this.post(this.postUrl,  param);
};

WE.api.RoomModel.prototype.postChat = function( roomid, text, aim ){
	this.post(this.postUrl, { roomid:roomid, text:text, to:"*", aim:aim });
};

WE.api.RoomModel.prototype.create = function( topic, des, pwd ){
	this.post( this.createRoomURL,{ topic:topic, des:des, pwd:pwd });
};

WE.api.RoomModel.prototype.updateRoom = function( id, name, topic, des,password ){

	//需求创建验证， 容易收到恶意攻击
	this.post(this.updateRoomURL, {id:id, name:name, topic:topic, des:des,password:password});

};
WE.api.RoomModel.prototype.getMore = function(roomid, time){

	this.get(this.getMoreURL, {roomid:roomid, time:time});

};

WE.api.RoomModel.prototype.historyList = function(roomid){
	this.get(this.historyListURL,{roomid:roomid,size:24});
}

WE.api.RoomModel.prototype.uniqueKey = function(key){
	this.get(this.uniqueKeyURL,{key:key});
}

WE.api.RoomModel.prototype.search = function(key){
	this.get(this.searchRoomURL,{key:key});
}


WE.api.RoomModel.prototype.inviteChat = function(_ids, mails, roomid){
	this.get(this.inviteRoomURL,{_ids:_ids, mails:mails, roomid:roomid})
}

