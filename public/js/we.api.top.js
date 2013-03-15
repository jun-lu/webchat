/*
 * top Api
 */
WE.api = WE.api || {};

WE.api.TopModel = function(){

	this.historyChatsUrl = "/sys/ichats";
}

WE.api.TopModel.prototype = WE.BaseModel.prototype;

WE.api.TopModel.prototype.historyChats = function(){
	this.get( this.historyChatsUrl );
}