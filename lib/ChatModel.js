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
var MongodbModel = require('./MongodbModel');
var mongodb = require('mongodb');


function ChatModel(){
	this.collection = "chat";
};

ChatModel.prototype = Object.create( MongodbModel.prototype )
/**完善一个 chat list*/
ChatModel.prototype.serialization = function( status , callback ){

	var chatJsonList = status.result;
	var chatObjectIds = [];
	var chatObjects = [];

	for(var i=0; i<chatJsonList.length; i++){
		//console.log( chatJsonList[i].to );
		if(chatJsonList[i].to && chatJsonList[i].to.length == "24"){
			chatObjectIds.push( this.objectId(chatJsonList[i].to) );
			chatObjects.push( chatJsonList[i] );
		}
	}
	

	if( chatObjectIds.length ){
		this.inquire({_id:{"$in":chatObjectIds}}, function( status ){

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

ChatModel.prototype.inquire = function( selecter, callback){

	this.find( selecter, callback );

	/***
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
	*/
};

ChatModel.prototype.findReply = function( _id, callback ){

	this.inquire({to:_id}, callback);

};

/**查找一个*/
ChatModel.prototype.findChatOne = function( _id, callback ){

	var chatModel = this;
	this.find( this.objectId( _id ), function( status ){

		if( status.code == "0" ){

			chatModel.serialization( status, function( status ){

				status.setResult( status.result[0] );
				callback( status );

			});

		}else{

			callback && callback( status )
		}
	} );

	/**

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
				var status = new WebStatus();
					status.setResult( [data] );

				ChatModel.serialization( status, function( status ){
					status.setResult( status.result[0] );
					callback( status );
				});
			}
		}

		
	});
	model.findOne( mongodb.ObjectID( _id ) );
	*/
};

/**
	
	获取距离 time 最近的 10 条信息

*/
ChatModel.prototype.findMoreChats = function( roomid, time, callback ){


	this.findLimitSort( {roomid:roomid,  time:{"$lt":time}}, 10, {time:-1}, callback );

	/**

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
	*/
};
/**
	
	倒序输入 limit 条信息

*/
ChatModel.prototype.findChats = function( roomid, time, limit, callback ){



	this.findLimitSort({roomid:roomid, time:{"$lt":time}}, limit, {time:-1}, callback );

	/**

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

	model.findLimitSort({roomid:roomid, time:{"$lt":time}}, limit, {time:-1});
	
	*/
};

/**

	创建一条信息

	roomid
	text
	index
	user:{id: , name:}

	return chat
*/

ChatModel.prototype.create = function( roomid, text,  user,  to, callback){

	var chatModel = this;
	var chat = new Chat( roomid, text, user );
	to && chat.setTo( to );

	this.insert( chat, function( status ){
		status.setResult( [status.result] );

		chatModel.serialization(status, function( status ){
			callback && callback( status );
		});
		
	} );
	/**
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
	*/
};


/** 

	统计发言总量

 */
ChatModel.prototype.countChats = function( roomid, callback ){

	this.count( {roomid:roomid}, callback );
	/**
	var model = new ChatModel();
	model.on( model.oncount, function( err , data){
		var status = new WebStatus();


		status.setCode( err ? "601" : "0" );
		status.setResult( err || data );

		callback && callback( status );

	});
	model.count( {roomid:roomid} );

	*/
};




exports = module.exports = new ChatModel;

