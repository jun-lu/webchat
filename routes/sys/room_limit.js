/**
	
	into
	
	登陆
*/

var RoomModel = require("../../lib/RoomModel");
var WebStatus = require("../../lib/WebStatus"); 

module.exports = {

	get:function( req, res ){
		console.log(req.query);
		var roomid = req.query.roomid;
		var user = req.session.user || user;
		var roomid = req.query.roomid;

		if( !roomid ){
			res.write( new WebStatus("-1").toString() );
			res.end();
			return ;
		}

		RoomModel.idOrNameFind( roomid, roomid, function( status ){
			//console.log( status );
			if( status.code == "0" ){
				res.render("sys/room_limit", {user:user.getInfo(), room:status.result.toJSON()});
			}else{
				res.render("404");
			}

		});

		

	},
	post:function(req, res){
		
	}
	
};