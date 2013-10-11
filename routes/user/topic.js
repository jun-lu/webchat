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
			var id = req.params.key;
			var status = new WebStatus();

			var output = {
				user:user ? user.getInfo() : user,
				joins:[], //进入过的话题
				creates:[],//我创建过的话题
				tool:tools
			}


			if( user == null){
				res.redirect('/login');
				return false;
			}


			var promise = new Promise();


			promise.then(function( ) {
				RoomModel.querys({masterId:String(user._id)}, function( status ) {
					if( status.code == 0 ){

						output.creates = status.result;

					}
					promise.ok();
				});
			});

			promise.add(function( ) {
				LogModel.getLog( user._id, 100, function( status ) {
					var log = {};
					var joins = [];
					if(status.code == "0"){
						var logs = status.result;
						for(var i=0; i< logs.length; i++){

							if(log[logs[i].info.id] == undefined){
								log[logs[i].info.id] = 1;//logs[i].info;
								joins.push( logs[i].info );
							}
						}
						output.joins = joins;
					}

					promise.ok();	
				});
			});

			promise.then(function() {
				res.render("user/topic", output);
			});


			promise.start();
		},

		
		post:function( req, res ){

		}


};