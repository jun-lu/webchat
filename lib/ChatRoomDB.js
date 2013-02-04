/**

	ChatRoomDB

	
	webchat
		-user
		-room
*/

var ChatRoom = require('./ChatRoom');
var mongodb = require('mongodb');
var server = new mongodb.Server('127.0.0.1', 27017, {auto_reconnect:true});
var db = new mongodb.Db('webchat',server,{safe:true});



exports = module.exports = { //ChatRoomDB

	create:function( topic,  des, masterid){

		var topic = "周六骑行计划讨论小组";
		var des = "关于明天骑行，大家可以讨论下细节，组织者是鲁军";
		var masterid = 123456;

		var _this = this;
		var room = new ChatRoom( topic, des, masterid );

		room.onSave = function(){
			_this.save( this );
		};

		this.save( room );
		return room;
	},
	save:function( room ){

		// ** 存盘

		db.open(function(err,db){
		    if(err) { return console.dir(err); }

		    var roomjson = room.toString();
			var collection = db.collection('room');
			
			//collection 必须提供回调
			collection.insert( roomjson, function(err, result){} );
		 
		});
	},
	query:function( id, callback ){
		db.open(function(err,db){
			var collection = db.collection('room');
			collection.findOne({id:id}, function(err , item ){
				callback && callback( err, item );
			});
		})
	}

};