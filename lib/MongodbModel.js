/**
	
	MongodbModel

*/
var setting = require('../settings');
var EventEmitter = require('events').EventEmitter;
var mongodb = require("mongodb");



var MongodbModel = module.exports = function() {

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


MongodbModel.prototype.db = function(){

	var server = new mongodb.Server(setting.db, setting.port, {});
	return new mongodb.Db('webchat', server, {w: 1});


};

MongodbModel.prototype.find = function( selecter ){

	var db = this.db();
	var collectionName = this.collectionName;
	db.open(function(err, client){

	    var collection = new mongodb.Collection(client, collectionName);
		collection.find( json, function(err, result){
			_this.emit( _this.oninsert, err, result );
			db.close();
		});

	});
};

MongodbModel.prototype.findKey = function( selecter, keys){

	var db = this.db();
	var collectionName = this.collectionName;
	var eventName = this.onfind;

	db.open(function(err, client){

	    var collection = new mongodb.Collection(client, collectionName);
		collection.find( json, keys, function(err, result){
			_this.emit( eventName, err, result );
			db.close();
		});

	});
};
