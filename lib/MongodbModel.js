/**

	数据库操作类 DbModel
		对 mongodb 的 27017 端口  webchat 库操作
	
	https://github.com/jserme/node-mongoskin#quickstart


*/

var config = require('../config');
var WebStatus = require('./WebStatus');
var mongodb = require('mongodb');

var MongodbModel = module.exports = function( collection ){
	this.collection = collection;
};

MongodbModel.prototype = {
	constructor:MongodbModel,
	mongodb:mongodb,
	objectId:function( id ){
		return new mongodb.ObjectID(id);
	},
	opendb:function( callback, w ){
	
		var server = new mongodb.Server(config.db, config.port, {});
		var db = new mongodb.Db('webchat', server, {w:w||1});
		var collection = this.collection;
		
		db.open(function( err, client ){
			callback(new mongodb.Collection(client, collection), db );
		});
	},
	
	insert:function( json , callback ){
		this.opendb(function( collection, db ){
			collection.insert( json, function(err, result){
				if( err ){
					callback( new WebStatus("601") );
				}else{
					callback( new WebStatus().setResult(result) );
				}
				db.close();
			});
		});
	},
	
	find:function( selecter, callback ){
	
		this.opendb(function( collection, db ){
			collection.find( selecter ).toArray(function(err, result){
				if( err ){
					callback( new WebStatus("601") );
				}else{
					callback( new WebStatus().setResult(result) );
				}
				db.close();
			});
		});
		
	},
	findLimit:function(selecter, limit){
		this.opendb(function( collection, db ){
			collection.find( selecter ).limit( limit ).toArray(function(err, result){
				if( err ){
					callback( new WebStatus("601") );
				}else{
					callback( new WebStatus().setResult(result) );
				}
				db.close();
			});
		});
	},
	findSort:function(selecter, sorter){
	
		this.opendb(function( collection, db ){
			collection.find( selecter ).sort( sorter ).toArray(function(err, result){
				if( err ){
					callback( new WebStatus("601") );
				}else{
					callback( new WebStatus().setResult(result) );
				}
				db.close();
			});
		});
		
	},
	findLimitSort:function(selecter, limiter, sorter, callback){
		this.opendb(function( collection, db ){
			collection.find( selecter ).limit( limiter ).sort( sorter ).toArray(function(err, result){
				if( err ){
					callback( new WebStatus("601") );
				}else{
					callback( new WebStatus().setResult(result) );
				}
				db.close();
			});
		});
	},
	findOne:function( selecter ,callback){
	
		this.opendb(function( collection, db ){
			collection.findOne( selecter , function(err, result){
				if( err ){
					callback( new WebStatus("601") );
				}else{
					callback( new WebStatus().setResult(result) );
				}
				db.close();
			});
		});
		
	},
	update:function( selecter, updater , callback){

		this.opendb(function( collection, db ){
			collection.update( selecter , {"$set":updater}, {multi:true}, function(err, result){
				if( err ){
					callback( new WebStatus("601") );
				}else{
					callback( new WebStatus().setResult(result) );
				}
				db.close();
			});
		});
		
	},
	updateOne:function(selecter, updater, callback){
		this.opendb(function( collection, db ){
			collection.update( selecter , {"$set":updater}, function(err, result){
				if( err ){
					callback( new WebStatus("601") );
				}else{
					callback( new WebStatus().setResult(result) );
				}
				db.close();
			});
		});
	},
	remove:function(selecter, callback){
		this.opendb(function( collection, db ){
			collection.remove( selecter , function(err, result){
				if( err ){
					callback( new WebStatus("601") );
				}else{
					callback( new WebStatus().setResult(result) );
				}
				db.close();
			});
		});
	},
	count:function( selecter,  callback){
		this.opendb(function( collection, db ){
			collection.update( selecter , {"$set":updater}, function(err, result){
				if( err ){
					callback( new WebStatus("601") );
				}else{
					callback( new WebStatus().setResult(result) );
				}
				db.close();
			});
		});
	}
	
}

