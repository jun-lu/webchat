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
var DbModel = require('./DbModel');
var mongodb = require('mongodb');
var UserModel = require('./UserModel');
exports = module.exports = RoomModel;

function RoomModel(){
	this.collection = "room";
};

RoomModel.prototype = Object.create( DbModel.prototype );


RoomModel.serialization = function( roomStatus, callback ){

	var room = roomStatus.result;
	if(roomStatus.code == "0" ){
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

};

RoomModel.findNewRoom = function( limit, callback){
	var model = new RoomModel();
	model.on( model.onfind, function(err, data){
		var status = new WebStatus();
		if( err ){
			status.setCode( "601" );
			status.setResult( err );
		}else{
			if( data == null ){
				status.setCode("404");
			}else{
				var list = [];
				//console.log("data", data);
				for(var i=0; i<data.length; i++){
					list.push( Room.factory(data[i]) );
				}
				status.setResult( list );
			}
		}
		callback && callback( status );
	});
	model.findLimitSort({}, limit, {time:-1} );
};

RoomModel.getMultiple = function( ids, callback ){
	this.querys( {id:{"$in":ids}},  callback);
};

RoomModel.querys = function( selecter, callback){
	var model = new RoomModel();
	model.on( model.onfind, function(err, data){
		var status = new WebStatus();
		if( err ){
			status.setCode( "601" );
			status.setResult( err );
		}else{
			if( data == null ){
				status.setCode("404");
			}else{
				var list = [];
				for(var i=0; i<data.length; i++){
					list.push( Room.factory(data[i]) );
				}
				status.setResult( list );

			}
		}
		callback && callback( status );
	});
	model.find( selecter );
};

RoomModel.inquire = function( selecter, callback){
	var model = new RoomModel();
	model.on( model.onfindOne, function(err, data){
		var status = new WebStatus();
		if( err ){
			status.setCode( "601" );
			status.setResult( err );
			callback && callback( status );
		}else{
			if( data == null ){
				status.setCode("404");
			}else{

				status.setResult( Room.factory(data) )
				//console.log("status.setResult( Room.factory(data) )", status.setResult( Room.factory(data) ))
				RoomModel.serialization( status, function( status ){

					callback && callback( status );

				} );
				

			}
		}
		
	});
	model.findOne( selecter );
};


/**
	创建一个房间

**/


RoomModel.create = function( topic, des, masterid, masterName, callback ){

	var room = new Room( topic, des, masterid);
		room.setMasterName( masterName )
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
RoomModel.update = function(id, name, topic, des, password, callback){

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
		des:des,
		password:password
	});

};
RoomModel.remove = function( id , callback){

	var model = new RoomModel();
	model.on( model.onremove, function(err, data){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0" );
		status.setResult( err || data );

		callback && callback( status );
	});

	model.remove( {"id":id} );
}


