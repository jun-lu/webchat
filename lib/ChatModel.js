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
var mongodb = require('mongodb');


exports = module.exports = ChatModel;

function ChatModel(){
	this.collection = "chat";
};

ChatModel.prototype = Object.create(DbModel.prototype);
/**完善一个 chat list*/
ChatModel.serialization = function( status , callback ){

	var chatJsonList = status.result;
	var chatObjectIds = [];
	var chatObjects = [];

	for(var i=0; i<chatJsonList.length; i++){
		//console.log( chatJsonList[i].to );
		if(chatJsonList[i].to){
			chatObjectIds.push( mongodb.ObjectID(chatJsonList[i].to) );
			chatObjects.push( chatJsonList[i] );
		}
	}
	

	if( chatObjectIds.length ){
		ChatModel.inquire({_id:{"$in":chatObjectIds}}, function( status ){

			if(status.code == "0"){
				var chats = status.result;
				var ObjectJSON = {};

				for(var i=0; i<chats.length; i++){
					ObjectJSON[chats[i]._id] = chats[i];
				}
				//console.log("chatJsonList.length",chatJsonList.length );
				for(i=0; i<chatJsonList.length; i++){
					chatJsonList[i].to = ObjectJSON[chatJsonList[i].to];
				}	
			}

			status.setResult( chatJsonList );
			callback && callback( status );

		});
	}else{

		callback && callback( status );
	}


};


/*查找chat表*/

ChatModel.inquire = function( selecter, callback){

	var model = new ChatModel();
	model.on( model.onfindOne, function(err, data){
		var status = new WebStatus();
		if( err ){
			status.setCode( "601" );
			status.setResult( err );
		}else{
			if( data == null ){
				status.setCode("404");
			}else{
				status.setResult( data );
			}
		}
		callback && callback( status );
	});
	model.find( selecter );
};


/**查找一个*/
ChatModel.findOne = function( _id, callback ){

	var model = new ChatModel();

	model.on( model.onfindOne, function(err, data){
		var status = new WebStatus();
		if( err ){
			status.setCode( "601" );
			status.setResult( err );
		}else{
			if( data == null ){
				status.setCode("404");
			}else{

				status.setResult( Chat.factory(data) );
			}
		}

		callback( status );
	});
	model.findOne( _id );
};

/**
	
	获取距离 time 最近的 10 条信息

*/
ChatModel.findMoreChats = function( roomid, time, callback ){

	var model = new ChatModel();
	model.on( model.onfind, function( err, data ){

		var status = new WebStatus();
		
		if( data ){

			status.setResult( data );
			ChatModel.serialization( status, callback );

		}else{

			if(err){
				status.setCode("601");
			}
			callback( status )
		}


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
		
		if( data ){

			status.setResult( data );
			ChatModel.serialization( status, callback );

		}else{

			if(err){
				status.setCode("601");
			}

			callback( status )
		}
		
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

ChatModel.create = function( roomid, text,  user,  to, callback){

	var chat = new Chat( roomid, text, user );
	to && chat.setTo( to );
	var model = new ChatModel();
	model.on(model.oninsert, function(err, data){

		var status = new WebStatus();
		
		if( data ){

			status.setResult( [data] );
			ChatModel.serialization( status, callback );

		}else{

			if(err){
				status.setCode("601");
			}
			callback && callback( status )
		}


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
};


