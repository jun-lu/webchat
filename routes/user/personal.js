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

			//512081d4ff08ee5e51000001
			if(id.length != 24){

				status.setCode("-1");
				res.render("404", status.toJSON());

				return false;	
			};

			UserModel.find_id(id, function( status ){

				if(status.code == "0"){

					var accessUser = status.result;
					//console.log( accessUser );
					LogModel.getLog( accessUser._id, 1000, function( status ){

						//进入过
						var intos = [];
						//创建过
						var creates = [];

						if(status.code == "0"){

							var logs = status.result;
							for(var i=0; i< logs.length; i++){

								logs[i].info.time = logs[i].time;
								if(logs[i].location == "into_room"){

									intos.push( logs[i].info );
								}

								if(logs[i].location == "create_room"){

									creates.push( logs[i].info );
								}
							}

						}

						res.render("user/personal", status.toJSON({
							user:user ? user.getInfo() : user,
							accessUser:accessUser.getPublicInfo( 180 ),
							creates:creates,
							intos:tools.unique(intos, function(item){  return item.id; }),
							tool:tools
						}));
					} )


				}else{

					status.addMsg("没有找到用户");

					res.write("404", status.toJSON() );
				}

			});
		},
		
		post:function( req, res ){

		}


};