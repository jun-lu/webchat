
/*
	url: "/sys/room-set-close",
	method:post,
	param:
		id:room.id
	return:true/false	

*/
var WebStatus = require("../../lib/WebStatus");
var RoomModel = require("../../lib/RoomModel");
var Promise = require("../../lib/Promise");
var tools = require("../../lib/tools");

module.exports = function( req, res ){

	var id = tools.trim(req.query.id);
	var status = new WebStatus();
	var user = req.session.user;
	var	promise = new Promise();
	
	if( user == null ){

		res.write( status.setCode("-3").toString() );
		res.end();
		return ;

	};


	if( String(id).length == 0 ){
		res.write( status.setCode("-1").toString() );
		res.end();
		return ;
	}


	promise.then(function(){

		RoomModel.idFind( id, function( status ){

			if( status.code == 0 ){
				//验证创建者权限
				if( String(status.result.masterId) == String(user._id) ){
					promise.ok();
				}else{
					res.write( new WebStatus("403") );
					res.end();
				}

			}else{

				res.write( status.toString() );
				res.end();
			}
		});	

	});

	promise.then(function(){

		RoomModel.update({id:id}, {status:1}, function( status ){

			res.write(status.toString());
			res.end();
		});


	});

	promise.start();

};
