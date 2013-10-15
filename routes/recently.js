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
		var time = parseInt(req.query.time) || parseInt(Date.now()/1000);
		var page = parseInt(req.query.page) || 1;
		var pageSize = 10;

		var output = {
			user:user ? user.getInfo() : null,
			rooms:[],
			tool:tools,
			prevPage: page - 1 > 0 ? page -1 : -1,
			nextPage: page + 1
		};


		RoomModel.findLimitSkipSort({}, 10, (page-1) * pageSize, {time:-1},function( status ){
			RoomModel.serialization( status, function( status ){
				console.log( "status", status );
				output.rooms = status.result;
				if( status.result.length < pageSize ){
					output.nextPage = -1;
				}

				res.render("recently", output);
			} );
			
		})

		//res.render("recently", output);
		
	},
	post:null

};