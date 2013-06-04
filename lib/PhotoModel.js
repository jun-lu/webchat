/**

	PhotoModel

		提供对 photo 集合的操作

*/
var WebStatus = require('./WebStatus');
var Photo = require('./Photo');
var MongodbModel = require('./MongodbModel');

var PhotoModel = module.exports = function(){
	this.collection = "photo";
};

PhotoModel.prototype = MongodbModel.prototype;
PhotoModel.prototype.constructor = PhotoModel;