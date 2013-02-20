/**

	数据库操作类 DbModel
		对 mongodb 的 27017 端口  webchat 库操作
	
	https://github.com/jserme/node-mongoskin#quickstart


*/

var events = require('events');
var mongodb = require('mongodb');
//var server = new mongodb.Server("127.0.0.1", 27017, {});

exports = module.exports = DbModel;

function DbModel( collection ){

	this.collection = collection;// 必须提供集合名称
	//this.server = server;

	this.oninsert = "oninsert";
	this.onremove = "onremove";
	this.onupdate = "onupdate";
	this.onfind = "onfind";
	this.onfindOne = "onfindOne";
	this.onerror = "onerror";
	//this.onupdate = "onupdate";



};


DbModel.prototype = events.EventEmitter.prototype;
DbModel.prototype.getDb = function(){

	var server = new mongodb.Server("127.0.0.1", 27017, {});
	return new mongodb.Db('webchat', server, {w: 1});

};
DbModel.prototype.constructor = DbModel;
//DbModel.prototype.events = DbModel.EVENTS;

//插入数据
DbModel.prototype.insert = function( json ){

	// ** 存盘
	var _this = this;
	//var db = this.getDb();
	this.getDb().open(function(err, client){
	    if(err) throw err;

	    var collection = new mongodb.Collection(client, _this.collection);
		//collection 必须提供回调
		collection.insert( json, function(err, result){
			client.close();
			_this.emit( _this.oninsert, err, json );

		});

	});

};
DbModel.prototype.findOne = function( selecter ){

	var _this = this;
    this.getDb().open(function (error, client) {
      if (error) throw error;
      var collection = new mongodb.Collection(client, _this.collection);
      collection.findOne( selecter , function(err, docs) {
      		client.close();
      		_this.emit( _this.onfindOne, err, docs );
      });
    });

};

DbModel.prototype.find = function( selecter ){

	var _this = this;
	//var mongodb = require('mongodb');
    //var server = new mongodb.Server("127.0.0.1", 27017, {});
    this.getDb().open(function (error, client) {
      if (error) throw error;
      var collection = new mongodb.Collection(client, _this.collection);

      collection.find( selecter ).sort({time:-1}).toArray(function(err , items ){
      		client.close();
			_this.emit( _this.onfind, err, items);
			
		});
    });

};


//修改数据
DbModel.prototype.update = function( selecter, object ){

	var _this = this;
	var db = this.getDb();
	db.open(function(error, client){
		if (error) throw error;
		
		var collection = new mongodb.Collection(client, _this.collection);
		console.log("update", selecter._id);
		selecter._id && (selecter._id = mongodb.ObjectID.createFromHexString(selecter._id));
		console.log("update", selecter._id);
		collection.update( selecter, {"$set":object} , function(err, data){
			client.close();
			_this.emit( _this.onupdate, err, data);
			
		});

	})

};

// 删除
DbModel.prototype.remove = function( selecter ){


};

