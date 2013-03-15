/***

	 API


*/

WE.api = WE.api || {};


WE.api.ChatModel = function(){

	this.postUrl = "?1";//直接提交到当前路径
	this.setUserNameURL = "/sys/set_user_name";
	this.updateRoomURL = "/sys/update_room";
	this.updateAvatorURL = "/sys/set_avatar";
};

WE.api.ChatModel.prototype = WE.BaseModel.prototype;

WE.api.ChatModel.prototype.postChat = function( roomid, text, to ){
	this.post(this.postUrl, { roomid:roomid, text:text, to:to });
};

WE.api.ChatModel.prototype.updateUserName = function( name ){

	//需求创建验证， 容易收到恶意攻击
	this.post(this.setUserNameURL, {name:name});

};

WE.api.ChatModel.prototype.updateRoom = function( id, name, topic, des ){

	//需求创建验证， 容易收到恶意攻击
	this.post(this.updateRoomURL, {id:id, name:name, topic:topic, des:des});

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

