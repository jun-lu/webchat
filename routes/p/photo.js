
/**
	module
	photoIndex
*/

var fs = require("fs");
var Photo = require("../../lib/Photo.js");
var PhotoModel = require("../../lib/PhotoModel.js");
var AlbumsModel = require("../../lib/AlbumsModel.js");
var photoModel = new PhotoModel();
var albumsModel = new AlbumsModel();
module.exports = {

	view:function( req, res ){
		
		var user = req.session.user || {};
		var photo = req.params.photo;
		var albums = req.params.albums;
		var output = {
			user:user,
			photo:null
		};
		console.log("photo", photo);
		res.sendfile("d:/github/upload/"+photo+".jpg");

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
				res.render("./404", new WebStatus("404").setMsg("没有找到相册").toJSON());
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
		
		if( file.size != 0 ){
		
			var photo = new Photo(file.name, user._id, albumsId, {
				size:file.size
			});
			
			photoModel.insert(photo, function( status ){
				var oldPath = file.path;
				var newPath = file.path.replace(/\w+(\.jpg)$/, String(status.result[0]._id)+"$1");
				console.log(oldPath, newPath);
				fs.rename(oldPath, newPath, function(){
					res.redirect("/p/r/"+String(status.result[0]._id));
				});
			});
		
		}else{
			res.end();
		}
	}

}
