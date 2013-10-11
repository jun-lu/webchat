/**

	RoomModel

		提供对 room 集合的操作

	
	webchat
		-user
		-room
			-- 请参看 ChatRoom 类
*/
var WebStatus = require("./WebStatus");
var Room = require('./Room');
var User = require('./User');
var MongodbModel = require('./MongodbModel');
var UserModel = require('./UserModel');

function RoomModel(){
	this.collection = "room";
};

RoomModel.prototype = Object.create( MongodbModel.prototype )


RoomModel.prototype.serialization = function( roomStatus, callback ){

	/**
	var room = roomStatus.result;
	if(roomStatus.code == "0" ){
		//console.log( "roomStatus", roomStatus );
		UserModel.find_id(room.masterId, function( status ){
			if(status.code == "0"){
				room.setMaster( status.result.getPublicInfo() );
			}else{
				room.setMaster(null);
			}

			callback( roomStatus );
		});
	}else{
		callback( roomStatus );	
	}
	*/



	var list = roomStatus.result;
	var ids = [];
	var masters = {};
	var isArray = list instanceof Array;

	if( !isArray ){
		list = [list];
	}

	if( roomStatus.code == "0" ){

		for(var i=0; i< list.length; i++){
			ids.push( this.objectId(list[i].masterId) );
		}

		UserModel.find({_id:{"$in":ids}}, function( status ){

			if( status.code == 0 ){

				for(var i=0; i<status.result.length; i++){

					masters[ status.result[i]._id ] = User.factory( status.result[i] ).getPublicInfo();
				};


				for(var i=0; i<list.length; i++){

					list[i].master = masters[ list[i].masterId ];
				}

				roomStatus.setResult( list );
			}

			callback( isArray ? roomStatus : roomStatus.setResult( roomStatus.result[0] ) );
		});


	}else{

		callback( roomStatus );
	}
};

RoomModel.prototype.findNewRoom = function( limit, callback){

	var self = this;
	this.findLimitSort({}, limit, {time:-1}, function( status ){
		if( status.code == "0" ){
			self.serialization( status, function( status ){
				callback && callback( status );
			} );
		}else{

			callback && callback( status )
		}

	});
};

RoomModel.prototype.getMultiple = function( ids, callback ){
	this.querys( {id:{"$in":ids}},  callback);
};

RoomModel.prototype.querys = function( selecter, callback){

	var self = this;
	this.find( selecter, function( status ){

		if( status.code == "0" ){
			self.serialization( status, function( status ){
				callback && callback( status );
			} );
		}else{

			callback && callback( status )

		}
	} );

};

RoomModel.prototype.inquire = function( selecter, callback){

	var roomModel = this;
	this.findOne( selecter, function( status ){

		if( status.code == "0" ){

			status.setResult( Room.factory( status.result ) );	
			//console.log("status", status);
			roomModel.serialization( status, function( status ){

				callback && callback( status );
			} );
		}else{

			callback( status )
		}

	} );
};


/**
	创建一个房间

**/


RoomModel.prototype.create = function( topic, des, masterid, masterName, callback ){

	var room = new Room( topic, des, masterid);
		room.setMasterName( masterName )

	this.insert( room.toJSON(), function( status ){
		status.setResult( Room.factory(status.result) );
		callback && callback( status );	
	} );

};
/**
	根据id或者房间名查询一个房间

	return 
*/
RoomModel.prototype.idOrNameFind = function( id, name , callback){
	this.inquire({"$or":[{id:id}, {name:name}]}, callback);
};

RoomModel.prototype.idFind = function( id , callback){
	this.inquire({id:id}, callback);
};

RoomModel.prototype.nameFind = function( name , callback){
	this.inquire({name:name}, callback);
};

/**
	修改房间信息
**/
RoomModel.prototype.updateInfo = function(id, name, topic, des, password, callback){



	this.update( {id:id}, {
		name:name,
		topic:topic,
		des:des,
		password:password
	}, callback );

};
RoomModel.prototype.remove = function( id , callback){



	this.remove({"id":id}, callback );
}



exports = module.exports = new RoomModel();

