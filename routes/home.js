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

		res.render("index", {});
		
	},
	post:null

};