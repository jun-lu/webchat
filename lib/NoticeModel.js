/**

	只记录用户日志

	NoticeModel

		提供对 notice 集合的操作


*/
var WebStatus = require('./WebStatus');
var Notice = require('./Notice');
var DbModel = require('./DbModel');
var UserModel = require('./UserModel');
var RoomModel = require('./RoomModel');
var Promise = require('./Promise');
var ObjectID = require('mongodb').ObjectID;


exports = module.exports = NoticeModel;

function arryaToObject( list, key ){

	var json = {};
	for(var i=0; i<list.length; i++){
		json[key(list[i])] = list[i];
	}
	return json;
};

function NoticeModel(){
	this.collection = "notice";
};
//Object.create( events.EventEmitter )
NoticeModel.serialization = function( status, callback ){

	var list = status.result;
	var userids = [];
	var roomids = [];

	for(var i=0; i<list.length; i++){

		roomids.push( list[i].where );
		userids.push( list[i].from );
		userids.push( list[i].to );	
	}

	var promise = new Promise();

	promise.add(function(){
		UserModel.getMultiple(userids, function( status ){
			if( status.code == "0" ){
				var userHashMap = arryaToObject(status.result, function(item){ 
					delete item.summary;
					delete item.hexMail; 
					return String(item._id) 
				});

				for(var i=0; i<list.length; i++){

					list[i].from = userHashMap[ list[i]["from"] ];
					list[i].to = userHashMap[ list[i]["to"] ];
						
				}
			}
			promise.resolve();
		});
	});

	promise.add(function(){
		RoomModel.getMultiple(roomids, function( status ){

			if( status.code == "0" ){
				var roomHashMap = arryaToObject(status.result, function(item){ 

					delete item.des;
					delete item.masterId;
					delete item.masterName;
					delete item.password;
					
					return String(item.id) 
				});

				for(var i=0; i<list.length; i++){

					list[i].where = roomHashMap[ list[i]["where"] ];
						
				}
			}

			promise.resolve();
			//status.setResult( list );
			
		});
	});

	promise.then(function(){

		callback( status );

	});

	promise.start();

};
NoticeModel.prototype = Object.create( DbModel.prototype );
NoticeModel.prototype.findNotice = function( selecter ){

	var _this = this;
    this.getDb().open(function (error, client) {
      if (error) throw error;

      var collection = client.collection( _this.collection );

      collection.find( selecter ).toArray(function(err , items ){
      		client.close();
			_this.emit( _this.onfind, err, items);
			
		});
    });
}

NoticeModel.findUnread = function( to, time, limit, callback){

	var model = new NoticeModel();
	model.on( model.onfind, function(err, data){
		var status = new WebStatus();
		if( err ){
			status.setCode( "601" );
			status.setResult( err );
			callback( status );
		}else{
			status.setResult( data );
			//console.log( "status", status );
			NoticeModel.serialization( status, function( status ){
				callback( status );
			});
			
		}
		
	});
	model.findLimit( {to:to, time:{"$lt":time}, status:{"$in":[0,1]}}, limit, {time:-1} );
};

NoticeModel.create = function( type, from, to, where, what, response, callback ){

	var notice = new Notice( type, from, to, where, what , response);
	var model = new NoticeModel();
	model.on( model.oninsert, function( err, data ){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0");
		status.setResult( err || Notice.factory( data ) );
		
		callback && callback( status );

	});
	model.insert( notice.toJSON() );
};

NoticeModel.countStatus = function( to, status, callback ){

	var model = new NoticeModel();
	model.on( model.oncount, function( err, data ){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0");
		status.setResult( err || data );
		
		callback && callback( status );

	});
	model.count({to:to, status:{"$in":status}});
};


NoticeModel.updateStatus = function( _id, status, callback ){
	var model = new NoticeModel();
	model.on( model.onupdate, function( err, data ){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0");
		status.setResult( err || data );
		
		callback && callback( status );

	});
	model.update({"_id":new ObjectID(_id)}, {status:status});
}

NoticeModel.updateMoreStatus = function( _ids, status, callback ){
	var model = new NoticeModel();

	for(var i=0; i<_ids.length; i++){
		_ids[i] = new ObjectID( _ids[i] );
	}

	model.on( model.onupdate, function( err, data ){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0");
		status.setResult( err || data );
		
		callback && callback( status );

	});
	console.log( "_ids", _ids );
	model.update({"_id":{"$in":_ids}}, {status:1});
}

