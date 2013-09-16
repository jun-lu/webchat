/**
	
	login
	
	登录
*/
var config = require("../../config");
var User = require("../../lib/User");
var WebStatus = require("../../lib/WebStatus");
var UserModel = require("../../lib/UserModel");
var RoomModel = require("../../lib/RoomModel");

module.exports = {

	
		get:function( req, res ){
			var user = req.session.user || null;
			var roomid =req.query.roomid;
			if( user._id == "5125b7ac93a2f5dd48000005" || user._id == "512ad3246fb183bd0f00009f"){

				

					RoomModel.idOrNameFind( roomid, roomid, function( status ){

						//console.log("status", status );
						if( status.code == "0" ){

							res.render("admin", {room:status.result,delete:0});

						}else{

							res.write("没找到房间");
							res.end();
						}

					});

			}else{

				res.status(404).render("404", new WebStatus("404"));
			}
		},
		// 登录
		post:function(req, res ){

			var user = req.session.user || null;
			var roomid =req.body.roomid;

			if( user._id == "5125b7ac93a2f5dd48000005" || user._id == "512ad3246fb183bd0f00009f"){

				RoomModel.remove( roomid, function( status ){

					res.render("admin", status.toJSON({room:null, delete:1}) );

				} );

			}else{

				res.render("error", new WebStatus("403"));
			}
		}
};