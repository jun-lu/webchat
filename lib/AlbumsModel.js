/**

	AlbumsModel

		提供对 albums 集合的操作

*/
var WebStatus = require('./WebStatus');
var Albums = require('./Albums');
var MongodbModel = require('./MongodbModel');

var AlbumsModel = module.exports = function(){
	this.collection = "albums";
};

AlbumsModel.prototype = MongodbModel.prototype;
AlbumsModel.prototype.constructor = AlbumsModel;