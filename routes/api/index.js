
/**
	定义各种api

*/


var CORS_OPTIONS = require("./cors-options");

module.exports = function( app ){
	
	//19
	app.get('/sys/tmpl', require("./getTmpl"));
	
	//5
	app.get('/sys/getmore', require("./getChatMore"));
	
	//2
	app.post('/sys/set_user_name', require("./setUserName"));
	
	//4
	app.post('/sys/room_update', require("./roomUpdateInfo"));
	
	//3
	app.post('/sys/bindmail', require("./userBindMail"));
	
	//6
	app.get('/sys/ichats', require("./userHistory"));
	
	//7
	app.get('/sys/checkmail', require("./checkMailRepeat"));
	
	//8
	app.post('/sys/set_avatar', require("./setUserAvatar"));
	
	//9
	app.get('/sys/check_room_key', require("./checkRoomKeyRepeat"));
	
	//10
	app.get('/sys/history', require("./getRoomHistoryUser"));
	
	//11
	app.post('/sys/user_summary', require("./updateUserSummary"));
	
	//12号接口
	app.get('/sys/notice_count', require("./getUserNoticeCount"));
	
	//13号接口
	app.get('/sys/notice_list', require("./getUserNoticeList"));
	//14号接口
	app.post('/sys/notice_status', require("./setUserNoticeStatus"));

	app.get('/sys/contact-list', require("./contactList"));
	
	app.options('/sys/vchat-create', CORS_OPTIONS);
	app.options('/sys/vchat-login', CORS_OPTIONS);
	app.options('/sys/vchat-history', CORS_OPTIONS);

	//17号接口
	app.post('/sys/vchat-create', require("./chatjsCreate"));
	//18号接口
	app.post('/sys/vchat-login', require("./chatjsLogin"));
	//19号接口
	app.get('/sys/vchat-history', require("./chatjsGetChatHistory"));
	
	
}