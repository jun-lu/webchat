/*
 * notice Api
 */
WE.api = WE.api || {};

WE.api.NoticeModel = function(){
	this.noticeCountUrl = "/sys/notice_count";
	this.noticeListUrl = "/sys/notice_list";
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