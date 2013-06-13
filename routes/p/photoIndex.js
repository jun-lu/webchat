
/**
	module
	photoIndex
*/
var fs = require("fs");
var tools = require("../../lib/tools");
var WebStatus = require("../../lib/WebStatus");
var Albums = require("../../lib/Albums.js");
var AlbumsModel = require("../../lib/AlbumsModel.js");
var albumsModel = new AlbumsModel();

module.exports = {
	get:function(req, res){
		var user = req.session.user || {};
		var output = {
			user:user,
			albums:[]
		};
		
		albumsModel.findLimitSort({}, 10, {time:-1}, function( status ){
			if(status.code == "0"){
				output.albums = status.result;
			}
			
			res.render("./p/index", output);
			res.end();
		
		});
		
		
	}
};
