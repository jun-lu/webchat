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
var User = require("./User");
var UserModel = require('./UserModel');
var Promise = require('./Promise');


function ChatModel(){
	this.collection = "chat";
};

ChatModel.prototype = Object.create( MongodbModel.prototype )
/**完善一个 chat list*/
ChatModel.prototype.serialization = function( status , callback ){


	//console.log( "result", status.result );


	var chatModel = this;
	var userModel = UserModel;
	var result = status.result;
	var promise = new Promise();

	var aims = [];
	var users = [];

	var chatObjectMap = {};
	var userObjectMap = {
		"*":"*"
	};

	promise.then(function(){

		if( status.code == "0" && result.length ){

			for(var i=0; i< result.length; i++){
				if( result[i].to != "*" ){
					users.push( chatModel.objectId( result[i].to ) );
				}

				users.push( chatModel.objectId( result[i].from ) );

				if( result[i].aim ){
					aims.push( chatModel.objectId( result[i].aim ) );
				}

			}
			
		}	
		promise.ok();
	});

	//查询 aim
	promise.add(function(){
		if( aims.length ){
			chatModel.findFilter({_id:{"$in":aims}}, {text:1, to:1, from:1, aim:1}, function( status ){

				if( status.code == "0" && status.result.length ){

					for(var i=0, chats = status.result; i<chats.length; i++){
						chatObjectMap[chats[i]._id] = chats[i];
					}
				}
				promise.ok();
			});
		}else{
			promise.ok();
		}

	});

	// to  from
	promise.add(function(){

		if( users.length ){
			userModel.find({_id:{"$in":users} }, function( status ){
				if( status.code == "0" && status.result.length ){

					for(var i=0, users = status.result; i<users.length; i++){
						userObjectMap[users[i]._id] = User.factory(users[i]).getPublicInfo( 30 );
					}
				}
				promise.ok();

			});
		}else{

			promise.ok();
		}
	});


	promise.then(function(){

		for(var i=0; i<result.length; i++){
			result[i].from = userObjectMap[result[i].from];
			result[i].to != "*" && (result[i].to = userObjectMap[result[i].to]);
			result[i].aim && (result[i].aim = chatObjectMap[result[i].aim]); 
		}

		callback && callback( status );
	});

	promise.start();


};


/*查找chat表*/

ChatModel.prototype.inquire = function( selecter, callback){

	this.find( selecter, callback );
};

ChatModel.prototype.findReply = function( _id, callback ){

	this.inquire({aim:_id}, callback);

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


};

/**
	
	获取距离 time 最近的 10 条信息

*/
ChatModel.prototype.findMoreChats = function( roomid, time, callback ){

	var _this = this;
	this.findLimitSort( {roomid:roomid, to:"*", time:{"$lt":time}}, 10, {time:-1} , function( status ){

		_this.serialization( status, callback )

	} );


};
/**
	
	倒序输入 limit 条信息

*/
ChatModel.prototype.findChats = function( roomid, time, limit, callback ){


	var _this = this;
	this.findLimitSort({roomid:roomid, to:"*",time:{"$lt":time}}, limit, {time:-1}, function( status ){

		_this.serialization( status, callback )

	});


};

/**

	创建一条信息

	roomid
	text
	index
	user:{id: , name:}

	return chat
*/

ChatModel.prototype.create = function( roomid, text, to, from, aim, callback){

	var chatModel = this;
	var chat = new Chat( roomid , text, to, from, aim );
	to && chat.setTo( to || "*" );

	this.insert( chat, function( status ){
		status.setResult( [status.result] );

		chatModel.serialization(status, function( status ){
			callback && callback( status );
		});
		
	} );
};


/** 

	统计发言总量

 */
ChatModel.prototype.countChats = function( roomid, callback ){

	this.count( {roomid:roomid}, callback );

};




exports = module.exports = new ChatModel;

