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

var Chat = require('./Chat');
var DbModel = require('./DbModel');

exports = module.exports = ChatModel;

function ChatModel(){
	DbModel.call( this );
	this.oncount = "oncount";
	this.collection = "chat";
};

//Object.create( events.EventEmitter )
ChatModel.prototype = Object.create(DbModel.prototype);

ChatModel.prototype.create = function( roomid, text,  index, user){

	var chat = new Chat( roomid, text, user );
	chat.setIndex( index );
	this.insert( chat.toJSON() );

	return chat;
};

ChatModel.prototype.count = function( roomid ){

	var _this = this;
	var db = this.getDb();
	db.open(function(err, db){
	    if(err) { db.close(); return _this.emit( _this.onerror, err, db ) }
		var collection = db.collection( _this.collection );
		//collection 必须提供回调
		collection.count( {roomid:roomid }, function(err, result){

			db.close();
			if(err) { return _this.emit( _this.onerror, err, db ) }
			_this.emit( _this.oncount, err, roomid, result );

		});

	});
}