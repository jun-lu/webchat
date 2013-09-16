
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
var RoomModel = require("../../lib/RoomModel");
var albumsModel = new AlbumsModel();

module.exports = {
	get:function(req, res){
		var user = req.session.user;
		var roomId = req.params.roomId;
		var output = {
			user:user ? user.getInfo() : null,
			albums:[],
			room:null
		};


		var promise = new Promise();

		promise.add(function(){

			RoomModel.idFind( roomId, function( status ){

				if( status.code == "0" ){
					output.room = status.result;
					promise.ok();	

				}else{

					res.status("404", new WebStatus("404").setMsg("对话不存在"));
				}

			});

		});

		promise.then(function(){

			albumsModel.findSort({roomId:roomId}, {time:-1}, function( status ){
				if(status.code == "0"){
					output.albums = status.result;
				}
				
				//promise.ok();
				res.render("./p/index", output);
				//res.end();
			
			});

		});

		promise.start();
	}
};
