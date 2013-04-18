/*
	
	detail 一个post的详细信息
	
*/

var config = require("../../config");
var tools = require("../../lib/tools");
var UserModel = require("../../lib/UserModel");
var RoomModel = require('../../lib/RoomModel');
var ChatModel = require('../../lib/ChatModel');
var LogModel = require('../../lib/LogModel');
var WebStatus = require('../../lib/WebStatus');
var socketServer = require('../../lib/socketServer');
//var maxIndex = {};
var roomLimit = require("../sys/room_limit");
//http://www.renren.com/338096010

module.exports = {

		get:function(req, res){

			var _id = req.query._id;
			if( !_id  || tools.trim(_id).length != 24){

				res.status(404).render("404", new WebStatus("404") );
				return ;
			};



			ChatModel.findOne(_id, function( status ){

				res.write( status.toString() );
				res.end();

			});

			
		}
};