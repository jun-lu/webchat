
/**
	定义各种api

*/


var CORS_OPTIONS = require("./cors-options");

module.exports = function( app ){
	
	//19
	app.get('/api/tmpl', require("./getTmpl"));
	
	//5
	app.get('/api/room-chat-get', require("./getChatMore"));
	//20
	app.post('/api/room-create', require("./createTopic"));
	app.get('/api/user-contact-get', require("./contactList"));
	
	//2
	app.post('/api/user-name-update', require("./setUserName"));
	
	//4
	app.post('/api/room-update', require("./roomUpdateInfo"));
	
	//3
	app.post('/api/user-mail-set', require("./userBindMail"));
	
	//6
	//app.get('/sys/ichats', require("./userHistory"));
	
	//7
	app.get('/api/user-mail-verify', require("./checkMailRepeat"));
	
	//8
	app.post('/api/user-avatar-update', require("./setUserAvatar"));
	
	//9
	app.get('/api/room-key-verify', require("./checkRoomKeyRepeat"));
	
	//10
	app.get('/api/room-visitors-get', require("./getRoomHistoryUser"));
	
	//11
	app.post('/api/user-summary-update', require("./updateUserSummary"));
	
	//12号接口
	app.get('/api/notice-count', require("./getUserNoticeCount"));
	
	//13号接口
	app.get('/api/notice-list', require("./getUserNoticeList"));
	//14号接口
	app.post('/api/notice-status', require("./setUserNoticeStatus"));
	//22号
	app.get('/api/room-search', require("./roomSearch"));
	//room-inviteh  23号
	app.get('/api/room-inviteh', require("./roomInviteh"));
	//room-set-close  24号
	app.post('/api/room-set-close', require("./room-set-close"));
	//room-set-close  25号
	app.post('/api/room-set-open', require("./room-set-open"));



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