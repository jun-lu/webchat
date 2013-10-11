/**
	
	home
	
	首页
*/
var LogModel = require("../lib/LogModel");
var RoomModel = require("../lib/RoomModel");
var tools = require("../lib/tools");
var recommendRoom = require("../config").recommendRooms;
module.exports = {

	get:function(req, res){
		var user = req.session.user;
		var output = {
			user:user ? user.getInfo() : null,
			rooms:[],
			tool:tools
		};
		RoomModel.getMultiple(recommendRoom, function( status ){

			output.rooms = status.result;
			/***
			res.write( JSON.stringify( output, "", "    " ));
			res.end();
			**/
			res.render("recommend", output);
		})
		//res.render("recommend", output);
		
	},
	post:null

};