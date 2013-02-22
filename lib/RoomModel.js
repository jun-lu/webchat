/**

	RoomModel

		提供对room集合的操作

	
	webchat
		-user
		-room
			-- 请参看ChatRoom类
*/
var WebStatus = require("./WebStatus");
var Room = require('./Room');
var DbModel = require('./DbModel');


exports = module.exports = RoomModel;

function RoomModel(){
	this.collection = "room";
};

RoomModel.prototype = Object.create( DbModel.prototype );



RoomModel.inquire = function( selecter, callback){

	var model = new RoomModel();

	model.on( model.onfindOne, function(err, data){

		var status = new WebStatus();

		if( err ){

			status.setCode( "601" );
			status.setResult( err );

		}else{

			if( data == null ){
				status.setCode("404");
			}else{
				status.setResult( Room.factory(data) );

			}
		}

		callback && callback( status );


	});
	model.findOne( selecter );
};


/**
	创建一个房间

**/


RoomModel.create = function( topic, des, masterid, callback ){

	var room = new Room( topic, des, masterid);
	var model = new RoomModel();

	model.on( model.oninsert , function(err, data){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0");
		status.setResult( err || Room.factory( data ) );
		
		callback( status );

	});

	model.insert( room.toJSON() );

};
/**
	根据id或者房间名查询一个房间

	return 
*/
RoomModel.idOrNameFind = function( id, name , callback){
	this.inquire({"$or":[{id:id}, {name:name}]}, callback);
};

RoomModel.idFind = function( id , callback){
	this.inquire({id:id}, callback);
};

RoomModel.nameFind = function( name , callback){
	this.inquire({name:name}, callback);
};

/**
	修改房间信息
**/
RoomModel.update = function(id, name, topic, des, callback){

	var model = new RoomModel();
	model.on( model.onupdate, function(err, data){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0" );
		status.setResult( err || data );

		callback && callback( status );
	});

	model.update( {id:id}, {
		name:name,
		topic:topic,
		des:des
	});

};


