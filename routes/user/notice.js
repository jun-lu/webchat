/**
	
	chat
	
	对话页面
*/

var tools = require("../../lib/tools");
var UserModel = require("../../lib/UserModel");
var RoomModel = require('../../lib/RoomModel');
var ChatModel = require('../../lib/ChatModel');
var LogModel = require('../../lib/LogModel');
var WebStatus = require('../../lib/WebStatus');
var socketServer = require('../../lib/socketServer');
//var maxIndex = {};
var roomLimit = require("../sys/room_limit");



module.exports = {

		get:function(req, res){

			var user = req.session.user || null;
			var id = req.params.key;
			var status = new WebStatus();

			if(!user){
				res.redirect('/sys/login');
			}

			
		},
		
		post:function( req, res ){

		}


};