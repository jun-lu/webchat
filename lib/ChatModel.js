/**

	ChatModel

		提供对room集合的操作

	
	webchat
		-user
		-room
			-- 请参看Room类
		-chat
			-- 请参看Chat类
*/
var WebStatus = require('./WebStatus');
var Chat = require('./Chat');
var DbModel = require('./DbModel');

exports = module.exports = ChatModel;

function ChatModel(){
	this.collection = "chat";
};

ChatModel.prototype = Object.create(DbModel.prototype);

/**
	
	获取距离 time 最近的10 条信息

*/
ChatModel.findMoreChats = function( roomid, time, callback ){

	var model = new ChatModel();
	model.on( model.onfind, function( err, data ){

		var status = new WebStatus();
		if( err ){
			status.setCode("601");
		}else{

			status.setResult( data );

		}

		callback && callback( status );

	} );

	model.findLimitSort({roomid:roomid,  time:{"$lt":time}}, 10, {time:-1});

};
/**
	
	倒序输入 limit 条信息

*/
ChatModel.findChats = function( roomid, limit, callback ){

	var model = new ChatModel();
	model.on( model.onfind, function( err, data ){

		var status = new WebStatus();
		if( err ){
			status.setCode("601");
		}else{
			status.setResult( data );
		}

		callback && callback( status );

	} );

	model.findLimitSort({roomid:roomid}, limit, {time:-1});

};

/**

	创建一条信息

	roomid
	text
	index
	user:{id: , name:}

	return chat
*/

ChatModel.create = function( roomid, text,  index, user, callback){

	var chat = new Chat( roomid, text, user );

	chat.setIndex( index );
	var model = new ChatModel();
	model.on(model.oninsert, function(err, data){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0");
		status.setResult( err || Chat.factory( data ) );
		
		callback && callback( status,  data);


	});

	model.insert( chat.toJSON() );

};


/** 

	统计发言总量

 */
ChatModel.countChats = function( roomid, callback ){

	var model = new ChatModel();
	model.on( model.oncount, function( err , data){
		var status = new WebStatus();
		status.setCode( err ? "601" : "0" );
		status.setResult( err || data );

		callback && callback( status );

	});
	model.count( {roomid:roomid} )
}