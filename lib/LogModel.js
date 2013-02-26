/**

	只记录用户日志

	LogModel

		提供对 user_log 集合的操作


*/
var WebStatus = require('./WebStatus');
var Log = require('./Log');
var DbModel = require('./DbModel');


exports = module.exports = LogModel;

function LogModel(){
	this.collection = "user_log";
};
//Object.create( events.EventEmitter )
LogModel.prototype = Object.create( DbModel.prototype );
LogModel.prototype.findLog = function( selecter ){

	var _this = this;
	//console.log("findLog", selecter, _this.collection);
    this.getDb().open(function (error, client) {
      if (error) throw error;

      var collection = client.collection( _this.collection );

      collection.find( selecter ).limit(100).sort({time:-1}).toArray(function(err , items ){
      		client.close();
			_this.emit( _this.onfind, err, items);
			
		});
    });
}

LogModel.inquire = function( selecter, callback){

	var model = new LogModel();

	model.on( model.onfindOne, function(err, data){

		var status = new WebStatus();

		if( err ){

			status.setCode( "601" );
			status.setResult( err );

		}else{

			if( data && data.length ){

				var list = [];
				for(var i=0; i<data.length; i++){

					list.push( Log.factory(data[i]) );
				}
				
				status.setResult( list );

			}else{
				status.setCode("404");
			}
			
		}

		callback( status );


	});
	model.findLimitSort( selecter, 100, {time:-1} );
};

LogModel.create = function( id, location, info, callback ){

	var log = new Log( id, location, info );
	var model = new LogModel();
	model.on( model.oninsert, function( err, data ){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0");
		status.setResult( err || Log.factory( data ) );
		
		callback && callback( status );

	});
	model.insert( log.toJSON() );
};

LogModel.idFind = function( id, callback ){

	this.inquire( {id:id}, callback );

};

/**
	获取某个用户最近的活动记录

	return [log, log]
*/
LogModel.getLog = function( id, callback ){

	this.inquire({id:id}, callback);
}

