/***

	 API


*/

WE.api = WE.api || {};


WE.api.ChatModel = function(){

	this.postUrl = "#";//直接提交到当前路径
	this.setUserNameURL = "/sys/set_user_name";
	this.updateRoomURL = "/sys/update_room";
};

WE.api.ChatModel.prototype = WE.BaseModel.prototype;

WE.api.ChatModel.prototype.postChat = function( roomid, text ){
	this.post(this.postUrl, { roomid:roomid, text:text });
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

}

