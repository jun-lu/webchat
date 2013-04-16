/**
	
	into
	
	登陆
*/
var tools = require("../../lib/tools");
var RoomModel = require("../../lib/RoomModel");
var UserModel = require("../../lib/UserModel");
var WebStatus = require("../../lib/WebStatus"); 

module.exports = {

	get:function( req, res ){

		var roomid = req.query.roomid;
		var user = req.session.user || user;
		var roomid = req.query.roomid;
		var status = new WebStatus();

		if( !roomid ){
			status.setCode("-1");
			res.status(404).render("404", status.toJSON());
			return ;
		}

		RoomModel.idOrNameFind( roomid, roomid, function( status ){
			if( status.code == "0" ){
				var data = status.toJSON({user:user.getInfo(), room:status.result.toJSON()})
				res.render("sys/room_limit", data);
			}else{
				res.status(404).render("404", status.toJSON());
			}

		});

		

	},
	post:function(req, res){
		
		var user = req.session.user || null;
		var roomid = tools.trim(req.body.roomid);
		var password = tools.trim(req.body.password);
		var status = new WebStatus();

		if( user == null ){
			status.setCode("403");
			status.addMsg("没有权限访问资源");
			res.status(403).render("error", status.toJSON());
			return ;
		};
		
		RoomModel.idOrNameFind( roomid, roomid, function( status ){
	
			if( status.code == "0"){
				var room = status.result;

				if( room.password == null ){
					//console.log("不需要密码的房间",roomid);
					res.redirect("/"+roomid);
					return ;
				}

				if( room.password === password ){
					UserModel.addRoomPassword( user._id, room.id, password, function( status ){
						//console.log("addRoomPassword", status );
						if(status.code == "0"){
							res.redirect("/"+roomid);
						}
					} );	
				}else{
					status.setCode("403");
					status.setMsg("输入的密码不正确");
					res.render("sys/room_limit", status.toJSON({room:room, user:user.getInfo()}));
				}
			}else{

				res.status(404).render("404", status.toJSON());
			}

		});


	}
	
};