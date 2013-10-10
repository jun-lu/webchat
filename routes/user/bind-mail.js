/**
	
	chat
	
	对话页面
*/

var tools = require("../../lib/tools");
var UserModel = require("../../lib/UserModel");
var RoomModel = require('../../lib/RoomModel');
var ChatModel = require('../../lib/ChatModel');
var Promise = require('../../lib/Promise');
var LogModel = require('../../lib/LogModel');
var WebStatus = require('../../lib/WebStatus');



module.exports = {

		get:function(req, res){

			var user = req.session.user || null;
			var status = new WebStatus();
			var output = {
				user: user ? user.getInfo() : null
			};

			if( user == null ){
				res.redirect('/login');
				return false;
			}


			res.render("user/bind-mail", output);
		},

		
		post:function( req, res ){

		}


};