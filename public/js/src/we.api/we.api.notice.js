/*
 * notice Api
 */
WE.api = WE.api || {};

WE.api.NoticeModel = function(){
	this.noticeCountUrl = "/api/notice-count";
	this.noticeListUrl = "/api/notice-list";
	this.noticeStatusUrl = "/api/notice-status";
};

WE.api.NoticeModel.prototype = WE.BaseModel.prototype;

WE.api.NoticeModel.prototype.noticeCount = function(){
	this.get( this.noticeCountUrl );
}

WE.api.NoticeModel.prototype.noticeList = function(){
	this.get( this.noticeListUrl )
}

WE.api.NoticeModel.prototype.noticeStatus = function( mid ){
	this.post( this.noticeStatusUrl,{ _id:mid })
}