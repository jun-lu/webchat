
/**
	module
	photoIndex
*/
var fs = require("fs");
var im = require("imagemagick");
var config = require("../../config");
var WebStatus = require("../../lib/WebStatus");
var Promise = require("../../lib/Promise");
var Photo = require("../../lib/Photo.js");
var PhotoModel = require("../../lib/PhotoModel.js");
var AlbumsModel = require("../../lib/AlbumsModel.js");
var photoModel = new PhotoModel();
var albumsModel = new AlbumsModel();

module.exports = {

	view:function( req, res ){
		
		var user = req.session.user || {};
		var photoId = req.params.photo;
		var albumId = req.params.albums;
		var output = {
			user:user,
			photoId:photoId,
			albumId:albumId
		};
		
		res.render("./p/view-photo", output);
		res.end();
		//res.sendfile(config.uploadDir+"/"+result.subdirectory+"/"+photo+".jpg");
		
		/**
		photoModel.findOne({_id:photoModel.objectId(photo)}, function(status){
			if(status.code == "0"){
				var result = status.result;
				res.sendfile(config.uploadDir+"/"+result.subdirectory+"/"+photo+".jpg");
			}else{
				res.status(404).render("404", status.toJSON() );
			}
		});
		
		*/

	},
	image:function(req, res){
		
		
		var albums = req.params[0];
		var photo = req.params[1];
		var suffix = req.params[2];
		
		var output = {
			photo:null
		};
		
		
		//console.log("req", req);
		//console.log("albums photo suffix", albums, photo, suffix);

		if( !(albums && photo && suffix) ){
			res.status(404);
			res.end();
			return ;
		}
		
		
		photoModel.findOne({_id:photoModel.objectId(photo)}, function(status){
			if(status.code == "0"){
				var result = status.result;
				res.sendfile(config.uploadDir+"/"+result.subdirectory+"/"+photo+".jpg");
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

			if(file.size != 0){
				promise.ok( );
			}else{
				res.end( new WebStatus("-1").setMsg("选择上传文件").toString() );
			}

		});

		//读取文件特征
		/*****/
		promise.then(function(){
			
			var filename = file.path.match(/\w+\.\w+$/)[0];
			im.identify.path = config.uploadDir;
			im.identify(filename, function(err, features){
				console.log(err, features);
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

			features = features || {};
			features.size = file.size;
			var photo = new Photo(file.name, user._id, albumsId, features);

			photoModel.insert(photo, function( status ){
				if(status.code == "0"){
					console.log("status", status);
					promise.ok( status.result[0]);
				}else{

					res.end( new WebStatus("500").setMsg("写入数据库错误").toString() );
				}
			});

		});

		//设定目录
		promise.then(function( photo ){


			var tmpPath = file.path;
			var targetPath = config.uploadDir+photo.subdirectory+"/"+String(photo._id)+".jpg";

			fs.exists(config.uploadDir+photo.subdirectory, function( exists ){

				if(!exists){
					fs.mkdir(config.uploadDir+photo.subdirectory, function(){

						promise.ok(tmpPath, targetPath, photo);
					});
				}else{

					promise.ok(tmpPath, targetPath, photo);
				}

			});

			

		});

		promise.then(function(tmpPath, targetPath, photo){

			fs.rename(tmpPath, targetPath, function(err){
				if(err) throw err;
				res.redirect("/p/r/"+photo.albumsId+"/"+String(photo._id));
				//fs.unlink(tmpPath, function(){});
			});

		});

		promise.start();

	}

}
