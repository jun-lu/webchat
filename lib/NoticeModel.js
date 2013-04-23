/**

	只记录用户日志

	NoticeModel

		提供对 notice 集合的操作


*/
var WebStatus = require('./WebStatus');
var Notice = require('./Notice');
var DbModel = require('./DbModel');
var UserModel = require('./UserModel');


exports = module.exports = NoticeModel;

function arryaToObject( list ){

	var json = {};
	for(var i=0; i<list.length; i++){
		json[list._id] = list[i];
	}
	return json;
};

function NoticeModel(){
	this.collection = "notice";
};
//Object.create( events.EventEmitter )
NoticeModel.serialization = function( list, callback ){

	var ids = [];

	for(var i=0; i<list.length; i++){
		ids.push(list[i].form);
		ids.push(list[i].to);	
	}

	UserModel.getMultiple(ids, function( status ){
		if( status.code == "0" ){
			var userHashMap = arryaToObject(status.result);
			for(var i=0; i<list.length; i++){

				list.from = userHashMap[ list["from"] ];
				list.to = userHashMap[ list["to"] ];
					
			}
		}
		status.setResult( list );
		callback( status );
	});

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

NoticeModel.inquire = function( selecter, limit, callback){

	var model = new NoticeModel();
	model.on( model.onfindOne, function(err, data){
		var status = new WebStatus();
		if( err ){
			status.setCode( "601" );
			status.setResult( err );
		}else{
			NoticeModel.serialization( data, function( status ){

			})
		}
		callback( status );
	});
	model.findLimitSort( selecter, limit, {time:-1} );
};

NoticeModel.create = function( type, from, to, where, what, callback ){

	var notice = new Notice( type, from, to, where, what );
	var model = new NoticeModel();
	model.on( model.oninsert, function( err, data ){

		var status = new WebStatus();

		status.setCode( err ? "601" : "0");
		status.setResult( err || Notice.factory( data ) );
		
		callback && callback( status );

	});
	model.insert( notice.toJSON() );
};