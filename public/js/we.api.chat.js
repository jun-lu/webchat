/***

	 API


*/

WE.api = WE.api || {};


WE.api.ChatModel = function(){

	this.postUrl = "#";//直接提交到当前路径
};

WE.api.ChatModel.prototype = WE.BaseModel.prototype;

WE.api.ChatModel.prototype.postChat = function( roomid, text ){
	this.post(this.postUrl, { roomid:roomid, text:text });
};

