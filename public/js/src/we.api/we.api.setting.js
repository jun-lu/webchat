/***

	API


*/

WE.api = WE.api || {};


WE.api.SettingModel = function() {
	
	this.updateSummaryUrl = "/sys/user_summary";
};

WE.api.SettingModel.prototype = WE.BaseModel.prototype;

WE.api.SettingModel.prototype.updateUserSummery = function( summery ){

	this.post(this.updateSummaryUrl,{summary:summery});
}