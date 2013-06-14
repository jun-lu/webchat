
/**
	module
	photoIndex
*/
var fs = require("fs");
var gm = require("gm");
var config = require("../../config");
var WebStatus = require("../../lib/WebStatus");
var Promise = require("../../lib/Promise");
var Photo = require("../../lib/Photo.js");
var photoTools = require("../../lib/photoTools");
var PhotoModel = require("../../lib/PhotoModel.js");
var AlbumsModel = require("../../lib/AlbumsModel.js");
var photoModel = new PhotoModel();
var albumsModel = new AlbumsModel();

module.exports = {

	//查看图片的页面
	view:function( req, res ){
		
		var user = req.session.user || {};
		var photoId = req.params.photo;
		var albumId = req.params.albums;
		var output = {
			user:user,
			albums:null,
			photo:null
		};
		

		var promise = new Promise();

		//图片
		promise.add(function(){
			photoModel.findOne( {_id: photoModel.objectId(photoId) }, function( status ){
				if(status.code == "0"){
					//console.log(status.result);
					//console.log("photo",  new Photo(null, null, null, null, status.result));
					output.photo = new Photo(null, null, null, null, status.result).getInfo();
				};
				promise.ok();
			});
		});
		//相册
		promise.add(function(){
			albumsModel.findOne( {_id: albumsModel.objectId(albumId) }, function( status ){
				if(status.code == "0"){
					output.albums = status.result;
				};
				promise.ok();
			});
		});
		//返回
		promise.then(function(){
			//res.write("");
			res.render("./p/view-photo", output);
			res.end();

		});
		console.log( promise );
		promise.start();
		

	},
	//返回图片
	image:function(req, res){
		
		
		//var albums = req.params[0];
		//var photo = req.params[1];
		//var suffix = req.params[2];

		var albums = req.params.albums;
		var dir = req.params.dir;
		var photo = req.params.photo;
		var photoId = photo.replace(/\.\w+$/, '').replace(/_\w+$/,'');
		console.log(albums,dir,photo);
		
		var output = {
			photo:null
		};
		
		
		if( !(albums && photo && dir) ){
			res.status(404);
			res.end();
			return ;
		}
		
		
		photoModel.findOne({_id:photoModel.objectId(photoId)}, function(status){
			if(status.code == "0"){
				var result = status.result;
				res.sendfile(config.uploadDir+dir+"/"+photo);
			}else{
				res.status(404);
				res.end();
			}
		});
		
	},
	
	createView:function( req, res ){
		
		var user = req.session.user || null;
		var albumsId = req.params.albums;
		var output = {
			user:user,
			albums:null
		};
		
		albumsModel.findOne({_id:albumsModel.objectId(albumsId)}, function( status ){
			if(status.code == "0" && status.result){
				output.albums = status.result;
				res.render('./p/create-photo', output);
			}else{
				res.render("./404", new WebStatus("404").setMsg("找不到相关相册").toJSON());
			}
		})
		
	},
	create:function(req, res){
		var user = req.session.user || null;
		
		var output = {
			user:user,
		};
		
		var albumsId = req.body.albumsId;
		var file = req.files.photo;
		
		var promise = new Promise();

		//判断是否有文件
		promise.add(function(){

			if(file && file.size != 0){
				promise.ok();
			}else{
				res.end( new WebStatus("-1").setMsg("选择上传文件").toString() );
			}

		});

		//读取文件特征
		/*****/
		promise.then(function(){
			
			//var filename = file.path.match(/\w+\.\w+$/)[0];

			//gm.
			//im.identify.path = config.uploadDir;
			gm(file.path).identify(function(err, features){
				//console.log(err, features);
				if(err){
					res.end( new WebStatus("500").setMsg("服务器错误,无法读取文件信息").toString()  );
				}else{
					console.log("features", features);
					promise.ok( features );
				}
			});
		});
		
		//移动文件到对应目录
		//upload/photo.subdirectory/filename

		//插入数据库
		promise.then(function( features ){

			var width = features.size.width;
			var height = features.size.height

			//小图缩放比例
			var s_scaling = photoTools.getScaling( width, height, 170, 170);
			//中图缩放比例 宽度优先
			var m_scaling = photoTools.getScaling( width, height, 960, height);

			var options = {

				width:width,
				height:height,

				s_w : parseInt(width/s_scaling), //小土大小
				s_h : parseInt(height/s_scaling),

				m_w : parseInt(width/m_scaling),//缩放以后的图片大小，也是网页上使用的大小
				m_h : parseInt(height/m_scaling)

			};

			var format = file.path.match(/\.(\w+)/)[0]; 
			var photo = new Photo(file.name, format, user._id, albumsId, options);

			photoModel.insert(photo, function( status ){
				if(status.code == "0"){
					photo._id = status.result[0]._id;
					promise.ok( photo );//status.result[0]
				}else{

					res.end( new WebStatus("500").setMsg("写入数据库错误").toString() );
				}
			});

		});

		//设定目录
		promise.then(function( photo ){

			//var tmpPath = file.path;
			//var targetPath = config.uploadDir+photo.subdirectory+"/"+String(photo._id)+".jpg";

			fs.exists(config.uploadDir+photo.subdirectory, function( exists ){
				if(!exists){
					fs.mkdir(config.uploadDir+photo.subdirectory, function(){
						promise.ok( photo);
					});
				}else{
					promise.ok( photo);
				}

			});

		});

		//移动图片
		promise.then(function( photo){

			var tmpPath = file.path;
			var targetPath = photo.getPath( config.uploadDir );

			fs.rename(tmpPath, targetPath, function(err){
				if(err) throw err;
				res.redirect("/p/r/"+photo.albumsId+"/"+String(photo._id));
				promise.ok( photo );//开始裁剪图片
			});

		});

		// 裁剪小图
		promise.add(function( photo ){

			//小图
			photoTools.resize( 
				photo.getPath(config.uploadDir), 
				photo.getSmallPath(config.uploadDir), 
				photo.s_w, 
				photo.s_h, 
				function( status ){}
			);

			//中图
			photoTools.resize( 
				photo.getPath(config.uploadDir), 
				photo.getModeratePath(config.uploadDir), 
				photo.m_w, 
				photo.m_h, 
				function( status ){}
			);
		});

		promise.start();

	}

}
