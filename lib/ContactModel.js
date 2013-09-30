/**

	只记录用户日志

	Contact

		提供对 contact 集合的操作


*/
var WebStatus = require('./WebStatus');
var MongodbModel = require('./MongodbModel');
var Contact = require('./Contact');
var UserModel = require('./UserModel');
var Promise = require('./Promise');


function ContactModel(){
	this.collection = "contact";
};
ContactModel.prototype = Object.create( MongodbModel.prototype )

ContactModel.prototype.serialization = function( status, callback ){

	var result = status.result;
	var _ids = [];
	var isArray = result instanceof Array;
	if( !isArray ){
		result = [result];
	}

	//console.log(" status ", status);
	_ids.push( this.objectId(result[0].from) );

	if( result instanceof Array ){
		for(var i=0; i<result.length; i++){
			//_ids.push( this.objectId( result[i].sid ) );
			_ids.push( this.objectId( result[i].to ) );
		}
	}

	//console.log("_ids", _ids);

	UserModel.inquire({_id:{"$in":_ids}}, function( status ){

		var ret = status.result;
		var _idsMap = {};
		var from = null;
		var to = null;

		if( status.code == 0 ){

			for(var i=0; i< ret.length; i++){
				_idsMap[ret[i]._id] = ret[i];
			}

			for(var i=0; i<result.length; i++){

				from = _idsMap[ result[i].from ];
				to = _idsMap[ result[i].to ];

				if(from && to){
					result[i].from = _idsMap[ result[i].from ];
					result[i].to = _idsMap[ result[i].to ];
				}else{
					result.splice(i, 1);
					i--;	
				}
				
					
			}
		}

		isArray ? status.setResult( result ) : status.setResult( result[0] );

		callback( status );

	});

};

ContactModel.prototype._idFind = function( _id, callback){

	var self = this;
	callback = callback || this.empty;
	this.findOne({_id: this.objectId(_id)}, function( status ){

		self.serialization( status, function( status ){

			callback( status );
		});

	});

	
};

ContactModel.prototype.fromToFind = function( from, to, callback ){

	var self = this;
	callback = callback || this.empty;
	this.findOne({from:from, to:to}, function( status ){

		self.serialization( status, function( status ){

			callback( status );
		});

	});

};

ContactModel.prototype.fromFind = function( from, callback ){

	var self = this;
	callback = callback || this.empty;
	this.find({from:from}, function( status ){

		self.serialization( status, function( status ){

			callback( status );
		});

	});

};

ContactModel.prototype.updateThermograph = function( from, to, thermograph, callback ){

	this.update({ from:from, to:to }, { thermograph:thermograph }, callback);

};

ContactModel.prototype.addThermograph = function( from, to, thermograph, callback ){

	var self = this;
	this.findOne( {from:from, to:to}, function( status ){
		if( status.code == 404 ){
			self.create( from, to, 1, callback );
		}else{
			self.updateThermograph( from, to, status.result.thermograph+thermograph, callback);
		}
	});

}



ContactModel.prototype.create = function( from, to, thermograph, callback){

	var contact = new Contact( from, to, thermograph );

	this.insert( contact.toJSON(), callback || this.empty);

	
};

exports = module.exports = new ContactModel();

