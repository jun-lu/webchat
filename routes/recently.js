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
		var time = req.query.time || parseInt(Date.now()/1000);
		var a = req.query.a || "next";
		var query = {};
		var output = {
			user:user ? user.getInfo() : null,
			rooms:[],
			tool:tools,
			time:0
		};

		if(a == "next"){
			query = {"$lt":time};
		}else{
			query = {"$gt":time};
		}

		RoomModel.findLimitSort({time:query}, 10, {time:-1},function( status ){
			RoomModel.serialization( status, function( status ){
				//console.log("status", status);
				output.rooms = status.result;
				if( status.code == 0 ){
					output.time = output.rooms[output.rooms.length-1].time;
				}			
				res.render("recently", output);
			} );
			
		})

		//res.render("recently", output);
		
	},
	post:null

};