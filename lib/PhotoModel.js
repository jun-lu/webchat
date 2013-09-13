/**

	PhotoModel

		提供对 photo 集合的操作

*/
var URL = require('url');
var fs = require('fs');
var gm = require('gm')
var uploadDir = require('../config').uploadDir;
var WebStatus = require('./WebStatus');
var Promise = require('./Promise');
var Photo = require('./Photo');
var photoTools = require('./photoTools');
var MongodbModel = require('./MongodbModel');

var PhotoModel = module.exports = function(){
	this.collection = "photo";
};

PhotoModel.prototype = MongodbModel.prototype;
PhotoModel.prototype.constructor = PhotoModel;
/**
	保存一个网络图片到图册中
	parma:url, albumlid, callback
	
	return {
		code:0,
		msg:'ok',
		result:Photo
	}
*/ 
PhotoModel.prototype.getNetworkImage = function(url, callback){

	//允许的图片类型
	var imagesType = {
		"image/jpeg":".jpg",
		"image/jpg":".jpg",
		"image/png":".png",
		"image/gif":".gif"
	};
	
	
	//var url = "http://www.baidu.com/img/bdlogo.gif";
	var userID = "5125b7ac93a2f5dd48000005";
	var albumID = "5232706980be84f402000001";
	var promise = new Promise();
	var protocol = null;
	var urlOptions = URL.parse( url );
	
	if(urlOptions.protocol == "http:"){
		protocol = require("http");
	}
	
	if(urlOptions.protocol == "https:"){
		protocol = require("https");
	}
	
	if(!protocol){
		return new WebStatus(-1).toJSON();
	}
	
	promise.out = callback || function(){};
	
	//下载保存临时图片
	promise.then(function(){
		
		try{
			var c = protocol.get(url, function(res) {
			
				var status = new WebStatus();
				var _id = Date.now()+Math.random();
				var format = imagesType[res.headers["content-type"]];
				var chunks = new Buffer(parseInt(res.headers["content-length"]));
				var offset = 0;
				var photo = new Photo(url, format, userID, albumID, {});
				photo._id = _id;
				photo.subdirectory = "temp";//临时目录
				
				res.on('data', function(chunk){
					for(var i=0; i<chunk.length; i++){
						chunks[offset] = chunk[i];
						offset++;
					}

				});
				
				res.on("end", function(){
					if(format != undefined){
						status.setResult(photo);
						fs.writeFileSync(photo.getPath(uploadDir), chunks);
					}
					promise.out( status );

				});

			});
			c.on("error", function(){
				promise.out(new WebStatus("-3"));
			})
		}catch(e){
			promise.out(new WebStatus("-3"));
		}
	});
	
	promise.start();

};


/**
	拷贝一个图片到另外一个地址 原图不删除
		如果 options 有值生成2张缩略图 大小按照指定的
		
		path
		newPath: upload/($newPath$)/
		options:{
			s_w:
			s_h:
			
			m_w
			m_h
		}
	return Photo
*/
PhotoModel.prototype.copyPhoto = function( photo, newPath, options, callback ){
	
	
	var promise = new Promise();
	promise.out = callback || function(){};
	options = options || {
		s_w:170,
		s_h:170,
		m_w:960,
		m_h:10000
	};

	//读取文件特征
	promise.then(function(){
		promise.ok( photo, {size:{width:200,height:200}} );
		/**
		gm(photo.getPath(uploadDir)).identify(function(err, features){
			if(err){
				promise.out( new WebStatus("500").setMsg("服务器错误,无法读取文件信息") )
			}else{
				promise.ok( photo, features );
			}
		});
		*/
	});
	
	//计算图片
	promise.then(function( photo, features ){

		var width = features.size.width;
		var height = features.size.height;
		
		var s_w = Math.min(width, options.s_w);
		var s_h = Math.min(height, options.s_h);
		
		var m_w = Math.min(width, options.m_w);
		var m_h = Math.min(height, options.m_h);

		//小图缩放比例
		var s_scaling = photoTools.getScaling( width, height, s_w, s_h);
		
		//中图缩放比例 宽度优先
		var m_scaling = photoTools.getScaling( width, height, m_w, m_h);

		var feature = {

			width:width,
			height:height,

			s_w : parseInt(width/s_scaling), //小图大小
			s_h : parseInt(height/s_scaling),

			m_w : parseInt(width/m_scaling),//缩放以后的图片大小，也是网页上使用的大小
			m_h : parseInt(height/m_scaling)

		};

		var newphoto = new Photo(photo.fileName, photo.format, photo.masterId, photo.albumsId, feature);
		//newphoto._id = "123456";
		newphoto.subdirectory = newPath || newphoto.subdirectory;
		
		new PhotoModel().insert(newphoto.toJSON(), function( status ){
			if( status.code == 0 ){
				promise.ok(photo, Photo.Factory( status.result ));
			}else{
				promise.out(new WebStatus("500").setMsg("数据库写入错误"));
			}
		})

	});
	
	
	//建立目录
	promise.then(function( tempPhoto, newPhoto ){
		console.log(uploadDir+newPhoto.subdirectory)
		fs.exists(uploadDir+newPhoto.subdirectory, function( exists ){
			if(!exists){
				fs.mkdir(uploadDir+newPhoto.subdirectory, function(){
					promise.ok( tempPhoto, newPhoto );
				});
			}else{
				promise.ok(tempPhoto, newPhoto);
			}

		});

	});
	
	
	//移动图片
	promise.then(function( tempPhoto, newPhoto ){

		var tmpPath = tempPhoto.getPath( uploadDir );
		var targetPath = newPhoto.getPath( uploadDir );
		console.log(tmpPath, targetPath);
		fs.rename(tmpPath, targetPath, function(err){
			if(err){
				promise.out(new WebStatus("500").setMsg("移动图片出现错误"));
			}else{// throw err;
				promise.ok( newPhoto, tempPhoto );//开始裁剪图片
			}
		});

	});
	
	promise.then(function(newPhoto, tempPhoto){
		promise.ok( newPhoto );
		//完成
		callback(new WebStatus().setResult(newPhoto));
	})
	
	//裁切中图
	promise.add(function( photo ){
		photoTools.resize( 
			photo.getPath(uploadDir), 
			photo.getModeratePath(uploadDir), 
			photo.m_w, 
			photo.m_h, 
			function( status ){
				promise.ok();
			}
		);

	});
	
	// 裁剪小图
	promise.add(function( photo ){
		photoTools.resize( 
			photo.getPath(uploadDir), 
			photo.getSmallPath(uploadDir), 
			photo.s_w, 
			photo.s_h, 
			function( status ){
				promise.ok();
			}
		);
	});
	
	//删除临时图片
	promise.add(function( photo, tempPhoto ){

		fs.unlink(tempPhoto.getPath(uploadDir), function(){});

	});
	
	
	promise.start();
};

