
/**
	module
	photoIndex
*/

var fs = require("fs");
var tools = require("../../lib/tools");
var WebStatus = require("../../lib/WebStatus");
var Promise = require("../../lib/Promise");
var Albums = require("../../lib/Albums.js");
var AlbumsModel = require("../../lib/AlbumsModel.js");
var albumsModel = new AlbumsModel();

var PhotoModel = require("../../lib/PhotoModel.js");
var photoModel = new PhotoModel();

module.exports = {
		
	view:function( req, res ){
		
		var user = req.session.user || null;
		
		var output = {
			user:user,
			albums:null,
			photos:[]
		};
		
		
		var _id = req.params.albums;
		
		
		var promise = new Promise();
		
		promise.add(function(){
			albumsModel.findOne({_id:albumsModel.objectId(_id)}, function( status ){
				if(status.code == "0" && status.result){
					output.albums = status.result;
					promise.resolve( _id );
					//res.render('./p/albums', output);
				}else{
					res.render("./404", new WebStatus("404").setMsg("没有找到相册").toJSON());
				}
			});	
		});
		
		
		promise.then(function( albumsId ){
			photoModel.findLimitSort({albumsId:albumsId}, 100, {time:-1}, function( status ){
				if(status.code == "0" && status.result){
					output.photos = status.result;
				}
				promise.resolve();
			});	
		});
		
		promise.then(function(){
			res.render('./p/albums', output);
		});
		
		
		promise.start();

	},
	createView:function( req, res ){
		
		res.render('./p/create-albums');
		
	},
	create:function(req, res){
		
		var user = req.session.user || null;
		
		var status = new WebStatus();
		var output = {
			user:user
		};
		
		var name = tools.trim(req.body.name);
		var des = req.body.des;
		var permissions = parseInt(req.body.permissions);
		
		if(!(name && name.length >0 && name.length < 50)){
			status.setCode("-1");
			status.setMsg("相册名在1-50之间");
			res.write( status.toString() );
			res.end();
			return false;
		};
		
		if(!(des.length==0 || des.length < 50)){
			status.setCode("-1");
			status.setMsg("相册描述在0-500之间");
			res.write( status.toString() );
			res.end();
			return false;
		}
		
		if(!(permissions == 0 || permissions == 1)){
			status.setCode("-1");
			status.setMsg("权限只能是0或1");
			res.write( status.toString() );
			res.end();
			return false;
		}
		
		
		var albums = new Albums(name , user._id, des, permissions, {});
		albumsModel.insert( albums.toJSON(), function( status ){
			console.log("status",status);
			if(status.code == "0"){
				res.redirect('/p/r/'+ status.result[0]._id );
			};
			res.write(status.toString());
		});
		
	}

}
