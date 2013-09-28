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
				intos:[], //进入过的话题
				creates:[],//我创建过的话题
				accessUser:null, //被访问者信息
				tool:tools
			}

			//512081d4ff08ee5e51000001
			if(id.length != 24){

				status.setCode("-1");
				res.status(404).render("404", status.toJSON());

				return false;	
			};

			var promise = new Promise();
			//查询被访问者信息
			promise.add(function() {

				UserModel.find_id(id, function( status ){

					if(status.code == "0"){
						output.accessUser = status.result;
						promise.ok( status.result );	
					}else{
						status.addMsg("没有找到用户");
						res.status(404).render("404", status.toJSON() );
					}

				});
			});

			promise.then(function( user ) {
				RoomModel.querys({masterId:String(user._id)}, function( status ) {
					if( status.code == 0 ){

						output.creates = status.result;

					}
					promise.ok();
				});
			});

			promise.add(function ( user ) {
				LogModel.getLog( user._id, 1000, function( status ) {
					//进入过
					var intos = output.intos;
					if(status.code == "0"){

						var logs = status.result;
						for(var i=0; i< logs.length; i++){
							logs[i].info.time = logs[i].time;
							if(logs[i].location == "into_room"){
								intos.push( logs[i].info );
							}
						}

					};

					promise.ok();	
				});
			});

			promise.then(function() {
				res.render("user/personal", output);
			});


			promise.start();
		},

		
		post:function( req, res ){

		}


};