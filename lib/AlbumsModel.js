/**

	AlbumsModel

		提供对 albums 集合的操作

*/
var WebStatus = require('./WebStatus');
var Albums = require('./Albums');
var Photo = require('./Photo');
var MongodbModel = require('./MongodbModel');
var PhotoModel = require('./PhotoModel');

var AlbumsModel = module.exports = function(){
	this.collection = "albums";
};

AlbumsModel.prototype = Object.create( MongodbModel.prototype );
AlbumsModel.prototype.constructor = AlbumsModel;


/**
	重新统计当前相册的照片数量
*/
AlbumsModel.prototype.photoCount = function( _id, callback ){

	callback = callback || function(){};
	var albumsModel = this;
	var photoModel = new PhotoModel();
	photoModel.count({albumsId: _id }, function( status ){

		if( status.code == "0"){
			albumsModel.updateOne({_id: albumsModel.objectId( _id ) }, {photoCount: status.result}, callback);
		};

		//把第一张照片设置为封面
		if( status.result == 1 ){
			photoModel.findOne( {albumsId: _id}, function( status ){
				var photo = new Photo(null, null, null, null, status.result);
				albumsModel.setFacePhoto( _id, photo.getSmallPath() );

			});
		}

	});

};

AlbumsModel.prototype.setFacePhoto = function(_id, path, callback ){
	callback = callback || function(){}
	this.updateOne({ _id: this.objectId( _id ) }, { facePhoto:path }, callback);
};
