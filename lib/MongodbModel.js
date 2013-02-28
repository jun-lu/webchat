/**
	
	MongodbModel

*/
var EventEmitter = require('events').EventEmitter;
var mongodb = require("mongodb");

var server = new mongodb.Server("127.0.0.1", 27017, {});
var database = new mongodb.Db('webchat', server, {w: 1});



exports = module.exports = MongodbModel;


function MongodbModel() {

	this.oncount = "oncount";
	this.oninsert = "oninsert";
	this.onremove = "onremove";
	this.onupdate = "onupdate";
	this.onfind = "onfind";
	this.onfindOne = "onfindOne";
	this.onerror = "onerror";


};

MongodbModel.prototype = EventEmitter.prototype;

MongodbModel.prototype.constructor = MongodbModel;
//MongodbModel.prototype.database = database;
MongodbModel.client = null;


MongodbModel.prototype.getClient = function( callback ){

	var _this = this;
	//console.log('MongodbModel.client ', MongodbModel.client);
	if(MongodbModel.client == null){
		database.open(function( err,  client){
			MongodbModel.client = client;
			callback( err, client );
		});
	}else{

		callback( null, MongodbModel.client );
	}
};

MongodbModel.prototype.insert = function( json ){

	var _this = this;
	this.getClient(function(err, client ){

		//err && (throw err);

		var collection = new mongodb.Collection(client, _this.collection);
		collection.findOne( selecter , function(err, docs) {
				_this.emit( _this.onfindOne, err, docs );
		});
	})

};

MongodbModel.prototype.find = function( selecter ){

	var _this = this;
	this.getClient(function(err, client){

		var collection = new mongodb.Collection(client, _this.collection);
		collection.find( selecter ).sort({time:-1}).toArray(function(err , items ){
			_this.emit( _this.onfind, err, items);

		});


	})
};

MongodbModel.prototype.findLimit = function( selecter, limit ){


	var _this = this;
	this.getClient(function (error, client) {
		if (error) throw error;
		var collection = new mongodb.Collection(client, _this.collection);

		collection.find( selecter ).limit( limit ).toArray(function(err , items ){
			_this.emit( _this.onfind, err, items);
			
		});
	});

};

MongodbModel.prototype.findLimitSort = function( selecter, limit, sort ){

	var _this = this;
    this.getClient(function (error, client) {
      if (error) throw error;

      var collection = new mongodb.Collection(client, _this.collection);
      collection.find( selecter ).limit( limit ).sort( sort ).toArray(function(err , items ){
			_this.emit( _this.onfind, err, items);
			
		});
    });

};

MongodbModel.prototype.count = function( selecter ){

	var _this = this;
	var db = this.getDb();
	this.getClient(function(err, client){

      	var collection = new mongodb.Collection(client, _this.collection);
		collection.count( selecter, function(err, result){
			
			_this.emit( _this.oncount, err, result );

		});

	});

};

MongodbModel.prototype.update = function( selecter, object ){

	var _this = this;
	this.getClient(function(error, client){
		var collection = new mongodb.Collection(client, _this.collection);
		collection.update( selecter, {"$set":object} , function(err, data){

			_this.emit( _this.onupdate, err, data);
			
		});

	})

};