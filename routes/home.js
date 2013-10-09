/**
	
	home
	
	首页
*/
var LogModel = require("../lib/LogModel");
var RoomModel = require("../lib/RoomModel");
var tool = require("../lib/tools");
var recommendRoom = require("../config").recommendRooms;
module.exports = {

	get:function(req, res){
		var user = req.session.user;
		var output = {
			user:user ? user.getInfo() : null
		};
		if( user ){
			res.redirect("/user/home");
			res.end();
			return ;
		}

		res.render("index", output);
		
	},
	index:function(req, res){

		var user = req.session.user;
		var output = {
			user:user ? user.getInfo() : null
		};

		res.render("index", {});
	},
	post:null

};