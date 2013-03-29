/***

	 API


*/

WE.api = WE.api || {};


WE.api.ChatModel = function(){

	this.postUrl = "?1";//直接提交到当前路径
	this.setUserNameURL = "/sys/set_user_name";
	this.updateRoomURL = "/sys/room_update";
	this.updateAvatorURL = "/sys/set_avatar";
	this.historyListURL = "/sys/history";
	this.uniqueKeyURL = "/sys/check_room_key";
};

WE.api.ChatModel.prototype = WE.BaseModel.prototype;

WE.api.ChatModel.prototype.postChat = function( roomid, text, to ){
	this.post(this.postUrl, { roomid:roomid, text:text, to:to });
};

WE.api.ChatModel.prototype.updateUserName = function( name ){

	//需求创建验证， 容易收到恶意攻击
	this.post(this.setUserNameURL, {name:name});

};

WE.api.ChatModel.prototype.updateRoom = function( id, name, topic, des,password ){

	//需求创建验证， 容易收到恶意攻击
	this.post(this.updateRoomURL, {id:id, name:name, topic:topic, des:des,password:password});

};
WE.api.ChatModel.prototype.getMore = function(roomid, time){

	this.get("/sys/getmore", {roomid:roomid, time:time});

};
WE.api.ChatModel.prototype.updateMailPwd = function(mail, pwd){
	this.post("/sys/bindmail", {mail:mail, pwd:pwd});
};

WE.api.ChatModel.prototype.updateAvator = function(gravatarDefault){
	this.post(this.updateAvatorURL,{gravatarDefault:gravatarDefault});
}

WE.api.ChatModel.prototype.historyList = function(roomid){
	this.get(this.historyListURL,{roomid:roomid,size:24});
}

WE.api.ChatModel.prototype.uniqueKey = function(key){
	this.get(this.uniqueKeyURL,{key:key});
}

