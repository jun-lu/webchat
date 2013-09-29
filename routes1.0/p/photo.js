
/**
	module
	photoIndex
*/
var fs = require("fs");
var gm = require("gm");
var config = require("../../config");
var WebStatus = require("../../lib/WebStatus");
var UserModel = require("../../lib/UserModel");
var Promise = require("../../lib/Promise");
var Photo = require("../../lib/Photo");
var photoTools = require("../../lib/photoTools");
var PhotoModel = require("../../lib/PhotoModel");
var AlbumsModel = require("../../lib/AlbumsModel");
var photoModel = new PhotoModel();
var albumsModel = new AlbumsModel();

module.exports = {

	//查看图片的页面
	view:function( req, res ){
		
		var user = req.session.user;
		var photoId = req.params.photo;
		var albumsId = req.params.albums;
		var output = {
			user:user ? user.getInfo() : null,
			albums:null,
			photo:null,
			nextPhoto:null,
			prevPhoto:null,
			photoMaster:null,//当前图片的创建者
			index:0 //当前图片 位置
		};
		

		var promise = new Promise();

		//相册
		promise.add(function(){
			albumsModel.findOne( {_id: albumsModel.objectId(albumsId) }, function( status ){
				if(status.code == "0"){
					output.albums = status.result;
				};
				promise.ok();
			});
		});

		promise.then(function(){

			//这里可能存在性能问题，需要优化
			photoModel.findSort( {albumsId:albumsId}, {_id:-1}, function( status ){

				if( status.code == "0" ){

					for(var i=0, data = status.result, len = data.length ; i<len; i++){
						if(data[i]._id == photoId){
							output.index = i+1;
							output.photo = Photo.Factory( data[i] ).getInfo();
							if( i+1 < len){
								output.nextPhoto = Photo.Factory( data[i+1] ).getInfo();
							}
							if( i > 0){
								output.prevPhoto = Photo.Factory( data[i-1] ).getInfo();
							}

							break;
						}
					}


					if( output.photo ){

						promise.ok( output.photo );
					}else{

						res.status(404).render("404", new WebStatus("404").setMsg("不存在"));
					}

				}else{
					res.end( status.toString() );
					//throw status.result;
				}


			});

		});

		

		//获取图片创建者信息
		promise.then(function( photo ){
			console.log( photo );
			UserModel.find_id( photo.masterId, function( status ){

				if( status.code == "0" ){
					output.photoMaster = status.result.getPublicInfo();
				}

				promise.ok();

			});
		});


		//返回
		promise.then(function(){
			//res.write("");
			res.render("./p/view-photo", output);
			//res.end();

		});
		//console.log( promise );
		promise.start();
		

	},
	//返回图片
	image:function(req, res){
		
		
		//var albums = req.params[0];
		//var photo = req.params[1];
		//var suffix = req.params[2];

		//var albums = req.params.albums;
		var dir = req.params.dir;
		var photo = req.params.photo;
		var photoId = photo.replace(/\.\w+$/, '').replace(/_\w+$/,'');
		//console.log(albums,dir,photo);
		
		var output = {
			photo:null
		};
		
		
		if( !( photo && dir) ){
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
	
	//上传图片页面
	createView:function( req, res ){
		
		var user = req.session.user;
		var albumsId = req.params.albums;
		var output = {
			user:user ? user.getInfo() : null,
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

	//普通的文件上传方式
	createView2:function( req, res ){
		
		var user = req.session.user;
		var albumsId = req.params.albums;
		var output = {
			user:user ? user.getInfo() : null,
			albums:null
		};

		if( !user ){
			res.render('./error', new WebStatus("304").setMsg("请先登录以后再上传图片"));
			return ;
		}
		
		albumsModel.findOne({_id:albumsModel.objectId(albumsId)}, function( status ){
			if(status.code == "0" && status.result){
				output.albums = status.result;
				res.render('./p/create-photo2', output);
			}else{
				res.render("./404", new WebStatus("404").setMsg("找不到相关相册").toJSON());
			}
		})
		
	},

	//上传图片  api
	create:function(req, res){
		var user = req.session.user;
		
		var output = {
			user:user ? user.getInfo() : null,
		};
		
		var uploadType = req.body.uploadType;
		var albumsId = req.body.albumsId;
		var file = req.files.photo;
		var promise = new Promise();

		if( !user ){

			res.end("error", new WebStatus("304").toString());
			return ;
		}
		
		//判断是否有文件
		promise.add(function(){

			if(file && file.size != 0){
				if( file.type.indexOf("image") != -1 ){
					promise.ok();
				}else{
					res.end( new WebStatus("-1").setMsg("文件格式不正确").toString() );
				}
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
					//console.log("features", features);
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
					photo._id = status.result._id;
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
						promise.ok( photo );
					});
				}else{
					promise.ok( photo );
				}

			});

		});

		//移动图片
		promise.then(function( photo){

			var tmpPath = file.path;
			var targetPath = photo.getPath( config.uploadDir );

			fs.rename(tmpPath, targetPath, function(err){
				if(err){
					res.end(new WebStatus("500").setMsg("移动图片出现错误").toString() );
				}else{// throw err;
					promise.ok( photo );//开始裁剪图片
				}
			});

		});

		//裁切中图
		promise.add(function( photo ){


			//中图
			photoTools.resize( 
				photo.getPath(config.uploadDir), 
				photo.getModeratePath(config.uploadDir), 
				photo.m_w, 
				photo.m_h, 
				function( status ){
					//使用from 表单上传
					if( uploadType ){
						res.redirect("/p/r/"+albumsId+"/"+photo._id);
						res.end();
					}else{
						res.write( new WebStatus().setResult( photo ).toString(), "utf-8" );
						res.end();
					}
				}
			);

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

			
		});
		//删除临时图片
		promise.add(function( photo ){

			fs.unlink(file.path, function(){});

		});

		//photoCount 
		promise.add(function( photo ){

			albumsModel.photoCount( photo.albumsId );
			

		});

		promise.start();

	},
	//删除图片
	deletePhoto:function( req, res){

		var user = req.session.user;

		var photoIds = req.body.ids;
		var promise = new Promise();
		var output = {
			success:[],
			error:[]
		};

		promise.add(function(){

			var ids = null;
			var objectIds = [];
			if( ! user ){
				res.end(new WebStatus("403").toString());
				return ;
			}
			//console.log("photoIds", photoIds);
			if( photoIds && (ids = photoIds.split(',')) ){
				for(var i=0; i< ids.length; i++){
					objectIds.push( photoModel.objectId( ids[i] ) )	;
				}
				promise.ok( objectIds );
			}else{
				res.end(new WebStatus("-1").setMsg("缺少photoIds,多个id用逗号分割").toString());
			}

		});

		//确认所有要删除的图片在同一个相册中
		promise.then(function( objectIds ){



			photoModel.find({ _id:{"$in":objectIds}}, function( status ){

				//console.log( "status", status );
				if( status.code == "0" && status.result.length ){
					
					var data = status.result;
					var albumsId = data[0].albumsId;

					var photos = [];
					//console.log("data", data );
					//var error = [];
					for(var i=0; i< data.length; i++){

						if( data[i].albumsId == albumsId ){
							photos.push( data[i] );
						}

					};

					//console.log( "albumsId", albumsId );
					promise.ok( albumsId, photos );


				}else{
					res.end(new WebStatus("404").setMsg("没有发现要删除的图片，请确认id").toString());
				}
			});

		});

		//获取相册信息
		promise.then(function( albumsId, photos ){

			//var currentUserId = user._id;
			//var albumsMasterId = null;

			albumsModel.findOne({_id:albumsModel.objectId( albumsId )  }, function( status ){

				if( status.code == "0" ){
					promise.ok( status.result, photos );
					//albumsMasterId = 
				
				}else{

					res.end( new WebStatus("-2").setMsg("图片所在相册不存在，可能已经被删除").toString() );
				
				}

			})

		});

		//确认图片删除权限
		promise.then(function( albums, photos ){

			var ids = [];
			var currentUserId = user._id;
			var albumsMasterId = albums.masterId;
			var myPhotos = [];
			//如果当前用户是相册创建者
			if( currentUserId == albumsMasterId ){
				promise.ok( photos, albums );
				return ;
			}
			//图片创建者id与当前用户ID一致	
			for(var i=0; i< photos.length; i++){
				if( photos[i].masterId == currentUserId){
					myPhotos.push( photos[i] );
				}
			};

			promise.ok( myPhotos, albums );

		});

		//删除图片
		promise.then(function( photos, albums ){

			var ids = [];
			//console.log( "photos", photos );
			for(var i=0; i<photos.length; i++){

				ids.push( photos[0]._id );

			};

			photoModel.remove({_id:{"$in":ids}}, function( status ){

				res.end( status.toString() );
				promise.ok( albums );
			});


		});

		//更新相册
		promise.then(function( albums ){
			albumsModel.photoCount( String(albums._id) );
		});

		promise.start();

	}

}
