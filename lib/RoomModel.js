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
var MongodbModel = require('./MongodbModel');
var UserModel = require('./UserModel');

function RoomModel(){
	this.collection = "room";
};

RoomModel.prototype = Object.create( MongodbModel.prototype )


RoomModel.prototype.serialization = function( roomStatus, callback ){

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

};

RoomModel.prototype.findNewRoom = function( limit, callback){

	this.findLimitSort({}, limit, {time:-1}, function( status ){

		if( status.code == "0" ){
			var list = [];
			var data = status.result;
			//console.log("data", data);
			for(var i=0; i<data.length; i++){
				list.push( Room.factory(data[i]) );
			}
			status.setResult( list );
		}

		callback && callback( status )

	});
	/**

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
	*/
};

RoomModel.prototype.getMultiple = function( ids, callback ){
	this.querys( {id:{"$in":ids}},  callback);
};

RoomModel.prototype.querys = function( selecter, callback){

	this.find( selecter, function( status ){

		if( status.code == "0" ){
			var list = [];
			var data = status.result;
			for(var i=0; i<data.length; i++){
				list.push( Room.factory(data[i]) );
			}
			status.setResult( list );
		}

		callback && callback( status )

	} );

	/**	
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
	*/
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
	/**
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
				callback && callback( status );
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
	*/
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

	/**

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
	*/
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

	/**
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
	*/
};
RoomModel.prototype.remove = function( id , callback){



	this.remove({"id":id}, callback );
	/**

	var model = new RoomModel();
	model.on( model.onremove, function(err, data){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0" );
		status.setResult( err || data );

		callback && callback( status );
	});

	model.remove( {"id":id} );

	*/
}



exports = module.exports = new RoomModel();

