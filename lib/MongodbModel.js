/**

	MongodbModel
	lujun
	https://github.com/jserme/node-mongoskin#quickstart


*/
var config = require('../config');
var WebStatus = require('./WebStatus');
var mongodb = require('mongodb');

var MongodbModel = module.exports = function(dbname, collection, dbserver, port ){
	this.collection = collection;
	this.dbserver = dbserver;
	this.port = port;
	//this.init();
};

MongodbModel.dbMap = {};

MongodbModel.prototype = {
	constructor:MongodbModel,
	mongodb:mongodb,
	dbname:config.dbname,
	/**  适合于有主从的服务器组
	init:function( callback ){
		
		var servers = [];
		var item = null;
		var dbname = this.dbname;
		console.log( "db.name", this, this.dbname );
		for(var i=0; i<config.dbs.length; i++){
			item = config.dbs[i];
			servers.push( new mongodb.Server( item.ip, item.port,  {auto_reconnect:true }) );
		}

		mongodbs = new mongodb.ReplSetServers( servers );
		db = new mongodb.Db( dbname, mongodbs ,  {auto_reconnect:true });
		db.open(function(err, db){

			console.log("open er", err)
			MongodbModel.dbMap[dbname] = db;
			callback && callback();
		});
	},
	*/
	init:function( callback ){
		
		var servers = [];
		//var item = null;
		var dbname = this.dbname;
		
		db = new mongodb.Db( dbname, new mongodb.Server( config.dbs[0].ip, config.dbs[0].port) ,  {auto_reconnect:true });
		db.open(function(err, db){

			console.log("open er", err)
			MongodbModel.dbMap[dbname] = db;
			callback && callback();
		});
	},
	objectId:function( id ){
		return new mongodb.ObjectID( String(id) );
	},
	opendb:function( callback ){

		console.log("opendb");
		var self = this;
		if( !this.db ){
			this.db = MongodbModel.dbMap[this.dbname];
		}

		if( this.db ){
			console.log("hello");
			callback( this.db.collection( this.collection ),{close:function(){}} );
		}else{
			this.init( function(){
				self.opendb( callback )
			})
		}

	},

	insert:function( json , callback ){
		this.opendb(function( collection, db ){
			collection.insert( json, function(err, result){
				if( err ){
					callback( new WebStatus("601") );
				}else{
					callback( new WebStatus().setResult(result[0]) );
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
					callback( new WebStatus().setResult(result || []) );
				}
				db.close();
			});
		});

	},
	
	findOneFilter:function( selecter, filter, callback ){

		this.opendb(function( collection, db ){
			collection.findOne( selecter , filter ,function(err, result){
				if( err ){
					callback( new WebStatus("601") );
				}else{
					callback( new WebStatus().setResult(result) );
				}
				db.close();
			});
		});

	},

	findFilter:function( selecter, filter, callback ){

		this.opendb(function( collection, db ){
			collection.find( selecter, filter ).toArray(function(err, result){
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
	findSort:function(selecter, sorter, callback){

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
	findLimitSkip:function(selecter, limiter, skip, callback){
		this.opendb(function( collection, db ){
			collection.find( selecter ).limit( limiter ).skip( skip ).toArray(function(err, result){
				if( err ){
					callback( new WebStatus("601") );
				}else{
					callback( new WebStatus().setResult(result) );
				}
				db.close();
			});
		});
	},
	findLimitSkipSort:function(selecter, limiter, skip, sort, callback){
		this.opendb(function( collection, db ){
			collection.find( selecter ).limit( limiter ).skip( skip ).sort( sort ).toArray(function(err, result){
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
				}else if(result){
					callback( new WebStatus().setResult(result) );
				}else{
					callback( new WebStatus("404") );	
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
		
		console.log('updater:   ',updater);
		
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
			collection.count( selecter , function(err, result){
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